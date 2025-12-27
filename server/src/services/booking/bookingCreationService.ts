/**
 * Booking creation orchestration service
 * Handles both PUBLIC and DIRECT booking flows
 * Extracted from bookingRoutes.ts lines 224-704
 */

import { prisma } from '../../db/prisma';
import { logger } from '../../utils/logger';
import {
  BOOKING_TIME_ZONE,
  addMinutesToDate,
  buildDateTime,
} from '../../utils/bookingTime';
import { hasBookingConflict } from '../bookingAvailability';
import { createBookingCalendarEvent } from '../bookingCalendar';
import { upsertBookingPatient } from '../bookingPatients';
import { sendBookingConfirmation } from '../notifications/bookingNotificationService';
import { isAppointmentWithinAvailability } from './bookingValidationService';
import { generateSecureToken, getTokenExpiry } from '../../utils/tokenGenerator';

export interface PublicBookingInput {
  bookingUrl: string;
  appointmentDate: string;
  appointmentTime: string;
  patientFirstName: string;
  patientLastName: string;
  patientPhone: string;
  patientEmail?: string;
  referrerName: string;
  referralReason?: string;
  notes?: string;
}

export interface DirectBookingInput {
  pharmacistId: number;
  appointmentDate: string;
  appointmentTime: string;
  patientFirstName: string;
  patientLastName: string;
  patientPhone: string;
  patientEmail?: string;
  referrerName: string;
  referrerClinic?: string;
  referralReason?: string;
  notes?: string;
}

/**
 * Create a public booking (no authentication required)
 * @param data - Public booking input
 * @returns Created booking details
 */
export const createPublicBooking = async (data: PublicBookingInput) => {
  // Get pharmacist and settings by booking URL
  const settings = await prisma.bookingSettings.findUnique({
    where: { bookingUrl: data.bookingUrl },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          calendarSyncEnabled: true,
          microsoftAccessToken: true,
          microsoftRefreshToken: true,
          microsoftTokenExpiry: true,
        },
      },
    },
  });

  if (!settings || !settings.allowPublicBooking) {
    throw new Error('Booking page not found or public booking disabled');
  }

  const pharmacistId = settings.userId;

  // Parse appointment datetime
  const appointmentDateTime = buildDateTime(
    data.appointmentDate,
    data.appointmentTime,
    BOOKING_TIME_ZONE
  );
  const appointmentEndTime = addMinutesToDate(
    appointmentDateTime,
    settings.defaultDuration
  );

  // Validate availability
  const isWithinAvailability = await isAppointmentWithinAvailability({
    userId: pharmacistId,
    appointmentDate: data.appointmentDate,
    appointmentStart: appointmentDateTime,
    appointmentEnd: appointmentEndTime,
  });

  if (!isWithinAvailability) {
    throw new Error('Selected time is not within availability');
  }

  // Check for conflicts
  const hasConflict = await hasBookingConflict(
    pharmacistId,
    appointmentDateTime,
    settings.defaultDuration,
    settings.bufferTimeBefore,
    settings.bufferTimeAfter,
    data.appointmentDate
  );

  if (hasConflict) {
    throw new Error('Selected time is no longer available');
  }

  // Upsert patient
  const { patient, formattedPhone } = await upsertBookingPatient({
    ownerId: pharmacistId,
    firstName: data.patientFirstName,
    lastName: data.patientLastName,
    phone: data.patientPhone,
    email: data.patientEmail || null,
  });

  // Create HMR review
  const review = await prisma.hmrReview.create({
    data: {
      ownerId: pharmacistId,
      patientId: patient.id,
      referredBy: data.referrerName,
      referralDate: new Date(),
      referralReason: data.referralReason || null,
      referralNotes: data.notes || null,
      scheduledAt: appointmentDateTime,
      status: settings.requireApproval ? 'PENDING' : 'SCHEDULED',
      visitLocation: 'To be confirmed',
    },
  });

  // Sync to Microsoft Calendar if enabled
  let calendarEventId: string | null = null;
  if (settings.user.calendarSyncEnabled && settings.user.microsoftAccessToken) {
    try {
      calendarEventId = await createBookingCalendarEvent({
        user: settings.user,
        patientName: `${patient.firstName} ${patient.lastName}`,
        referrerName: data.referrerName,
        referralReason: data.referralReason,
        formattedPhone,
        appointmentStart: appointmentDateTime,
        appointmentEnd: appointmentEndTime,
        patientEmail: data.patientEmail,
      });

      if (calendarEventId) {
        await prisma.hmrReview.update({
          where: { id: review.id },
          data: { calendarEventId },
        });
        logger.info(`Calendar event created: ${calendarEventId}`);
      }
    } catch (error) {
      logger.error({ err: error }, 'Failed to create calendar event');
      // Continue anyway - booking is still valid
    }
  }

  // Send confirmation notifications
  await sendBookingConfirmation({
    reviewId: review.id,
    patientEmail: data.patientEmail,
    patientName: `${patient.firstName} ${patient.lastName}`,
    patientPhone: formattedPhone,
    pharmacistName: settings.user.username,
    appointmentDateTime,
    appointmentTime: data.appointmentTime,
    referrerName: data.referrerName,
  });

  return {
    success: true,
    bookingId: review.id,
    pharmacistName: settings.user.username,
    appointmentDateTime: appointmentDateTime.toISOString(),
    requiresApproval: settings.requireApproval,
    message: settings.requireApproval
      ? 'Your booking request has been submitted and is pending approval.'
      : 'Your appointment has been confirmed!',
  };
};

/**
 * Create a direct booking (authenticated user)
 * Includes reschedule token generation
 * @param data - Direct booking input
 * @returns Created booking details
 */
export const createDirectBooking = async (data: DirectBookingInput) => {
  const userId = data.pharmacistId;

  // Get user and settings
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      bookingSettings: true,
    },
  });

  if (!user) {
    throw new Error('Pharmacist not found');
  }

  const settings = user.bookingSettings || {
    defaultDuration: 60,
    bufferTimeBefore: 0,
    bufferTimeAfter: 0,
    requireApproval: false,
  };

  // Parse appointment datetime
  const appointmentDateTime = buildDateTime(
    data.appointmentDate,
    data.appointmentTime,
    BOOKING_TIME_ZONE
  );
  const appointmentEndTime = addMinutesToDate(
    appointmentDateTime,
    settings.defaultDuration || 60
  );

  // Validate availability
  const isWithinAvailability = await isAppointmentWithinAvailability({
    userId,
    appointmentDate: data.appointmentDate,
    appointmentStart: appointmentDateTime,
    appointmentEnd: appointmentEndTime,
  });

  if (!isWithinAvailability) {
    throw new Error('Selected time is not available');
  }

  // Check for conflicts
  const hasConflict = await hasBookingConflict(
    userId,
    appointmentDateTime,
    settings.defaultDuration || 60,
    settings.bufferTimeBefore || 0,
    settings.bufferTimeAfter || 0,
    data.appointmentDate
  );

  if (hasConflict) {
    throw new Error('Selected time is no longer available');
  }

  // Upsert patient
  const { patient, formattedPhone } = await upsertBookingPatient({
    ownerId: userId,
    firstName: data.patientFirstName,
    lastName: data.patientLastName,
    phone: data.patientPhone,
    email: data.patientEmail || null,
  });

  // Create HMR review
  const review = await prisma.hmrReview.create({
    data: {
      ownerId: userId,
      patientId: patient.id,
      referredBy: data.referrerName,
      referralDate: new Date(),
      referralReason: data.referralReason || null,
      referralNotes: data.notes || null,
      scheduledAt: appointmentDateTime,
      status: settings.requireApproval ? 'PENDING' : 'SCHEDULED',
      visitLocation: 'To be confirmed',
    },
  });

  // Generate reschedule token (direct booking includes this)
  const token = generateSecureToken();
  const tokenExpiry = getTokenExpiry(30); // 30 days

  await prisma.rescheduleToken.create({
    data: {
      hmrReviewId: review.id,
      token,
      expiresAt: tokenExpiry,
    },
  });

  // Sync to Microsoft Calendar if enabled
  if (user.calendarSyncEnabled && user.microsoftAccessToken) {
    try {
      const calendarEventId = await createBookingCalendarEvent({
        user,
        patientName: `${patient.firstName} ${patient.lastName}`,
        referrerName: data.referrerName,
        referrerClinic: data.referrerClinic,
        referralReason: data.referralReason,
        formattedPhone,
        appointmentStart: appointmentDateTime,
        appointmentEnd: appointmentEndTime,
        patientEmail: data.patientEmail,
      });

      if (calendarEventId) {
        await prisma.hmrReview.update({
          where: { id: review.id },
          data: { calendarEventId },
        });
      }
    } catch (error) {
      logger.error({ err: error }, 'Failed to create calendar event');
    }
  }

  // Send confirmation notifications with reschedule link
  const rescheduleLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reschedule/${token}`;

  await sendBookingConfirmation({
    reviewId: review.id,
    patientEmail: data.patientEmail,
    patientName: `${patient.firstName} ${patient.lastName}`,
    patientPhone: formattedPhone,
    pharmacistName: user.username,
    appointmentDateTime,
    appointmentTime: data.appointmentTime,
    referrerName: data.referrerName,
    rescheduleLink,
  });

  return {
    success: true,
    bookingId: review.id,
    appointmentDateTime: appointmentDateTime.toISOString(),
    requiresApproval: settings.requireApproval,
    message: settings.requireApproval
      ? 'Your booking request has been submitted and is pending approval.'
      : 'Your appointment has been confirmed!',
  };
};
