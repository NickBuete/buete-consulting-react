/**
 * Booking reschedule operations
 * Extracted from bookingRoutes.ts lines 706-929
 */

import { prisma } from '../../db/prisma';
import { logger } from '../../utils/logger';
import {
  BOOKING_TIME_ZONE,
  addMinutesToDate,
  buildDateTime,
} from '../../utils/bookingTime';
import { updateBookingCalendarEvent } from '../bookingCalendar';
import { sendRescheduleNotification } from '../notifications/bookingNotificationService';

export interface RescheduleInput {
  appointmentDate: string;
  appointmentTime: string;
}

/**
 * Get booking information by reschedule token
 * @param token - The reschedule token
 * @returns Booking details if token is valid, null otherwise
 */
export const getBookingByToken = async (token: string) => {
  if (!token) {
    return null;
  }

  const rescheduleToken = await prisma.rescheduleToken.findUnique({
    where: { token },
    include: {
      hmrReview: {
        include: {
          patient: true,
          owner: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!rescheduleToken) {
    return null;
  }

  // Check if token is expired
  if (new Date() > rescheduleToken.expiresAt) {
    return { expired: true };
  }

  const review = rescheduleToken.hmrReview;

  return {
    expired: false,
    bookingId: review.id,
    patient: {
      firstName: review.patient.firstName,
      lastName: review.patient.lastName,
    },
    pharmacist: {
      name: review.owner.username,
    },
    currentAppointment: {
      date: review.scheduledAt?.toISOString().split('T')[0],
      time: review.scheduledAt?.toISOString().split('T')[1]?.substring(0, 5),
    },
    referredBy: review.referredBy,
  };
};

/**
 * Reschedule a booking using a reschedule token
 * @param token - The reschedule token
 * @param data - New appointment date and time
 * @returns Reschedule result
 */
export const rescheduleBooking = async (token: string, data: RescheduleInput) => {
  if (!token) {
    throw new Error('Token is required');
  }

  const rescheduleToken = await prisma.rescheduleToken.findUnique({
    where: { token },
    include: {
      hmrReview: {
        include: {
          patient: true,
          owner: {
            select: {
              id: true,
              username: true,
              email: true,
              microsoftAccessToken: true,
              microsoftRefreshToken: true,
              microsoftTokenExpiry: true,
              calendarSyncEnabled: true,
            },
          },
        },
      },
    },
  });

  if (!rescheduleToken) {
    throw new Error('Invalid reschedule link');
  }

  if (rescheduleToken.usedAt) {
    throw new Error('This reschedule link has already been used');
  }

  if (new Date() > rescheduleToken.expiresAt) {
    throw new Error('This reschedule link has expired');
  }

  const review = rescheduleToken.hmrReview;
  const user = review.owner;

  // Parse new appointment datetime
  const newAppointmentDateTime = buildDateTime(
    data.appointmentDate,
    data.appointmentTime,
    BOOKING_TIME_ZONE
  );
  const bookingSettings = await prisma.bookingSettings.findUnique({
    where: { userId: user.id },
  });
  const appointmentDuration = bookingSettings?.defaultDuration ?? 60;
  const newAppointmentEndTime = addMinutesToDate(
    newAppointmentDateTime,
    appointmentDuration
  );

  // Update calendar event if synced
  if (user.calendarSyncEnabled && review.calendarEventId && user.microsoftAccessToken) {
    try {
      await updateBookingCalendarEvent({
        user,
        eventId: review.calendarEventId,
        appointmentStart: newAppointmentDateTime,
        appointmentEnd: newAppointmentEndTime,
      });
    } catch (error) {
      logger.error({ err: error }, 'Failed to update calendar event');
    }
  }

  // Update review
  await prisma.hmrReview.update({
    where: { id: review.id },
    data: {
      scheduledAt: newAppointmentDateTime,
    },
  });

  // Mark token as used
  await prisma.rescheduleToken.update({
    where: { id: rescheduleToken.id },
    data: {
      usedAt: new Date(),
    },
  });

  // Send reschedule notifications
  await sendRescheduleNotification({
    reviewId: review.id,
    patientEmail: review.patient.contactEmail,
    patientName: `${review.patient.firstName} ${review.patient.lastName}`,
    patientPhone: review.patient.contactPhone || '',
    pharmacistName: user.username,
    appointmentDateTime: newAppointmentDateTime,
    appointmentTime: data.appointmentTime,
  });

  return {
    success: true,
    message: 'Appointment rescheduled successfully',
    newAppointmentDateTime: newAppointmentDateTime.toISOString(),
  };
};
