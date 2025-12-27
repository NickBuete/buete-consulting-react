import express from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { asyncHandler } from './utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { graphService } from '../services/microsoft/graphClient';
import { twilioService } from '../services/sms/twilioService';
import { emailService } from '../services/email/emailService';
import { generateSecureToken, getTokenExpiry } from '../utils/tokenGenerator';
import { logger } from '../utils/logger';
import crypto from 'crypto';

const router = express.Router();

// ========================================
// Validation Schemas
// ========================================

const availabilitySlotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/),
  isAvailable: z.boolean().optional(),
});

const bookingSettingsSchema = z.object({
  bufferTimeBefore: z.number().min(0).max(120).optional(),
  bufferTimeAfter: z.number().min(0).max(120).optional(),
  defaultDuration: z.number().min(15).max(240).optional(),
  allowPublicBooking: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
  bookingUrl: z.string().min(3).max(100).optional(),
  confirmationEmailText: z.string().optional(),
  reminderEmailText: z.string().optional(),
});

const publicBookingSchema = z.object({
  patientFirstName: z.string().min(1),
  patientLastName: z.string().min(1),
  patientPhone: z.string().min(10),
  patientEmail: z.string().email().optional(),
  referrerName: z.string().min(1),
  referrerEmail: z.string().email().optional(),
  referrerPhone: z.string().optional(),
  referrerClinic: z.string().optional(),
  referralReason: z.string().optional(),
  appointmentDate: z.string(), // ISO date
  appointmentTime: z.string().regex(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/),
  notes: z.string().optional(),
});

const directBookingSchema = z.object({
  pharmacistId: z.number(),
  patientFirstName: z.string().min(1),
  patientLastName: z.string().min(1),
  patientPhone: z.string().min(10),
  patientEmail: z.string().email().optional(),
  referrerName: z.string().min(1),
  referrerEmail: z.string().email().optional(),
  referrerPhone: z.string().optional(),
  referrerClinic: z.string().optional(),
  referralReason: z.string().optional(),
  appointmentDate: z.string(), // ISO date
  appointmentTime: z.string().regex(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/),
  notes: z.string().optional(),
});

const rescheduleSchema = z.object({
  appointmentDate: z.string(), // ISO date
  appointmentTime: z.string().regex(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/),
});

// ========================================
// Availability Slots Management
// ========================================

/**
 * Get pharmacist's availability slots
 * GET /api/booking/availability
 */
router.get(
  '/availability',
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;

    const slots = await prisma.availabilitySlot.findMany({
      where: { userId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    res.json(slots);
  })
);

/**
 * Create availability slot
 * POST /api/booking/availability
 */
router.post(
  '/availability',
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const validated = availabilitySlotSchema.parse(req.body);

    const slot = await prisma.availabilitySlot.create({
      data: {
        userId,
        dayOfWeek: validated.dayOfWeek,
        startTime: validated.startTime,
        endTime: validated.endTime,
        ...(validated.isAvailable !== undefined && { isAvailable: validated.isAvailable }),
      },
    });

    res.status(201).json(slot);
  })
);

/**
 * Update availability slot
 * PATCH /api/booking/availability/:id
 */
router.patch(
  '/availability/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const slotId = parseInt(req.params.id!, 10);
    const validated = availabilitySlotSchema.partial().parse(req.body);

    // Filter out undefined values
    const updateData: any = {};
    if (validated.dayOfWeek !== undefined) updateData.dayOfWeek = validated.dayOfWeek;
    if (validated.startTime !== undefined) updateData.startTime = validated.startTime;
    if (validated.endTime !== undefined) updateData.endTime = validated.endTime;
    if (validated.isAvailable !== undefined) updateData.isAvailable = validated.isAvailable;

    const slot = await prisma.availabilitySlot.update({
      where: { id: slotId, userId },
      data: updateData,
    });

    res.json(slot);
  })
);

/**
 * Delete availability slot
 * DELETE /api/booking/availability/:id
 */
router.delete(
  '/availability/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const slotId = parseInt(req.params.id!, 10);

    await prisma.availabilitySlot.delete({
      where: { id: slotId, userId },
    });

    res.json({ message: 'Availability slot deleted' });
  })
);

// ========================================
// Booking Settings Management
// ========================================

/**
 * Get booking settings
 * GET /api/booking/settings
 */
router.get(
  '/settings',
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;

    let settings = await prisma.bookingSettings.findUnique({
      where: { userId },
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.bookingSettings.create({
        data: { userId },
      });
    }

    res.json(settings);
  })
);

/**
 * Update booking settings
 * PATCH /api/booking/settings
 */
router.patch(
  '/settings',
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const validated = bookingSettingsSchema.parse(req.body);

    // Filter out undefined values for create
    const createData: any = { userId };
    if (validated.bufferTimeBefore !== undefined) createData.bufferTimeBefore = validated.bufferTimeBefore;
    if (validated.bufferTimeAfter !== undefined) createData.bufferTimeAfter = validated.bufferTimeAfter;
    if (validated.defaultDuration !== undefined) createData.defaultDuration = validated.defaultDuration;
    if (validated.allowPublicBooking !== undefined) createData.allowPublicBooking = validated.allowPublicBooking;
    if (validated.requireApproval !== undefined) createData.requireApproval = validated.requireApproval;
    if (validated.bookingUrl !== undefined) createData.bookingUrl = validated.bookingUrl;
    if (validated.confirmationEmailText !== undefined) createData.confirmationEmailText = validated.confirmationEmailText;
    if (validated.reminderEmailText !== undefined) createData.reminderEmailText = validated.reminderEmailText;

    // Filter out undefined values for update
    const updateData: any = {};
    if (validated.bufferTimeBefore !== undefined) updateData.bufferTimeBefore = validated.bufferTimeBefore;
    if (validated.bufferTimeAfter !== undefined) updateData.bufferTimeAfter = validated.bufferTimeAfter;
    if (validated.defaultDuration !== undefined) updateData.defaultDuration = validated.defaultDuration;
    if (validated.allowPublicBooking !== undefined) updateData.allowPublicBooking = validated.allowPublicBooking;
    if (validated.requireApproval !== undefined) updateData.requireApproval = validated.requireApproval;
    if (validated.bookingUrl !== undefined) updateData.bookingUrl = validated.bookingUrl;
    if (validated.confirmationEmailText !== undefined) updateData.confirmationEmailText = validated.confirmationEmailText;
    if (validated.reminderEmailText !== undefined) updateData.reminderEmailText = validated.reminderEmailText;

    const settings = await prisma.bookingSettings.upsert({
      where: { userId },
      create: createData,
      update: updateData,
    });

    res.json(settings);
  })
);

// ========================================
// Public Booking (No Auth Required)
// ========================================

/**
 * Get pharmacist's public booking info
 * GET /api/booking/public/:bookingUrl
 */
router.get(
  '/public/:bookingUrl',
  asyncHandler(async (req, res) => {
    const { bookingUrl } = req.params;

    if (!bookingUrl) {
      return res.status(400).json({ error: 'Booking URL is required' });
    }

    const settings = await prisma.bookingSettings.findUnique({
      where: { bookingUrl },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            calendarSyncEnabled: true,
          },
        },
      },
    });

    if (!settings || !settings.allowPublicBooking) {
      return res.status(404).json({ error: 'Booking page not found' });
    }

    // Get availability slots
    const slots = await prisma.availabilitySlot.findMany({
      where: {
        userId: settings.userId,
        isAvailable: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    res.json({
      pharmacist: {
        name: settings.user.username,
        email: settings.user.email,
      },
      settings: {
        defaultDuration: settings.defaultDuration,
        requireApproval: settings.requireApproval,
      },
      availability: slots,
    });
  })
);

/**
 * Create public booking
 * POST /api/booking/public/:bookingUrl
 */
router.post(
  '/public/:bookingUrl',
  asyncHandler(async (req, res) => {
    const { bookingUrl } = req.params;
    const validated = publicBookingSchema.parse(req.body);

    if (!bookingUrl) {
      return res.status(400).json({ error: 'Booking URL is required' });
    }

    // Get booking settings
    const settings = await prisma.bookingSettings.findUnique({
      where: { bookingUrl },
      include: {
        user: {
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
    });

    if (!settings || !settings.allowPublicBooking) {
      return res.status(404).json({ error: 'Booking not available' });
    }

    const userId = settings.userId;

    // Format phone number
    const formattedPhone = twilioService.formatAustralianPhone(
      validated.patientPhone
    );

    // Create or find patient
    let patient = await prisma.patient.findFirst({
      where: {
        ownerId: userId,
        firstName: validated.patientFirstName,
        lastName: validated.patientLastName,
      },
    });

    if (!patient) {
      patient = await prisma.patient.create({
        data: {
          ownerId: userId,
          firstName: validated.patientFirstName,
          lastName: validated.patientLastName,
          contactPhone: formattedPhone,
          contactEmail: validated.patientEmail || null,
        },
      });
    } else {
      patient = await prisma.patient.update({
        where: { id: patient.id },
        data: {
          contactPhone: formattedPhone,
          contactEmail: validated.patientEmail || null,
        },
      });
    }

    // Parse appointment datetime
    const appointmentDateTime = new Date(
      `${validated.appointmentDate}T${validated.appointmentTime}:00+10:00`
    );
    const appointmentEndTime = new Date(
      appointmentDateTime.getTime() + settings.defaultDuration * 60000
    );

    // Create HMR review
    const review = await prisma.hmrReview.create({
      data: {
        ownerId: userId,
        patientId: patient.id,
        referredBy: validated.referrerName,
        referralDate: new Date(),
        referralReason: validated.referralReason || null,
        referralNotes: validated.notes || null,
        scheduledAt: appointmentDateTime,
        status: settings.requireApproval ? 'PENDING' : 'SCHEDULED',
        visitLocation: 'To be confirmed',
      },
    });

    // Sync to Microsoft Calendar if enabled
    let calendarEventId: string | undefined;
    if (settings.user.calendarSyncEnabled && settings.user.microsoftAccessToken) {
      try {
        // Check if token needs refresh
        let accessToken = settings.user.microsoftAccessToken;
        if (
          settings.user.microsoftTokenExpiry &&
          new Date() >= settings.user.microsoftTokenExpiry
        ) {
          const refreshed = await graphService.refreshAccessToken(
            settings.user.microsoftRefreshToken!
          );
          accessToken = refreshed.accessToken;

          // Update tokens in database
          await prisma.user.update({
            where: { id: userId },
            data: {
              microsoftAccessToken: refreshed.accessToken,
              microsoftRefreshToken: refreshed.refreshToken,
              microsoftTokenExpiry: new Date(
                Date.now() + refreshed.expiresIn * 1000
              ),
            },
          });
        }

        // Create calendar event
        calendarEventId = await graphService.createCalendarEvent(accessToken, {
          subject: `HMR: ${patient.firstName} ${patient.lastName}`,
          body: `<p><strong>Home Medicines Review</strong></p>
                 <p>Patient: ${patient.firstName} ${patient.lastName}</p>
                 <p>Referred by: ${validated.referrerName}</p>
                 <p>Reason: ${validated.referralReason || 'Not specified'}</p>
                 <p>Phone: ${formattedPhone}</p>`,
          startDateTime: appointmentDateTime.toISOString(),
          endDateTime: appointmentEndTime.toISOString(),
          ...(validated.patientEmail && {
            attendees: [
              {
                emailAddress: validated.patientEmail,
                name: `${patient.firstName} ${patient.lastName}`,
              },
            ],
          }),
        });

        // Update review with calendar event ID
        await prisma.hmrReview.update({
          where: { id: review.id },
          data: { calendarEventId },
        });

        logger.info(`Calendar event created: ${calendarEventId}`);
      } catch (error) {
        logger.error({ err: error }, 'Failed to create calendar event');
        // Continue anyway - booking is still valid
      }
    }

    // Send confirmation SMS
    if (twilioService.isEnabled() && twilioService.isValidAustralianPhone(formattedPhone)) {
      try {
        await twilioService.sendAppointmentConfirmation({
          to: formattedPhone,
          patientName: patient.firstName,
          appointmentDate: appointmentDateTime.toLocaleDateString('en-AU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          appointmentTime: validated.appointmentTime,
        });

        await prisma.smsLog.create({
          data: {
            hmrReviewId: review.id,
            toPhone: formattedPhone,
            messageBody: 'Appointment confirmation',
            status: 'sent',
            sentAt: new Date(),
          },
        });
      } catch (error) {
        logger.error({ err: error }, 'Failed to send confirmation SMS');
        // Log but don't fail the booking
        await prisma.smsLog.create({
          data: {
            hmrReviewId: review.id,
            toPhone: formattedPhone,
            messageBody: 'Appointment confirmation',
            status: 'failed',
            errorMsg: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    }

    res.status(201).json({
      success: true,
      bookingId: review.id,
      appointmentDateTime: appointmentDateTime.toISOString(),
      requiresApproval: settings.requireApproval,
      message: settings.requireApproval
        ? 'Your booking request has been submitted and is pending approval.'
        : 'Your appointment has been confirmed!',
    });
  })
);

// ========================================
// Direct Booking (Authenticated)
// ========================================

/**
 * Create direct booking (from inline widget)
 * POST /api/booking/direct
 */
router.post(
  '/direct',
  authenticate,
  asyncHandler(async (req, res) => {
    const validated = directBookingSchema.parse(req.body);
    const userId = validated.pharmacistId;

    // Get user and settings
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        bookingSettings: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Pharmacist not found' });
    }

    const settings = user.bookingSettings || {
      defaultDuration: 60,
      requireApproval: false,
    };

    // Format phone number
    const formattedPhone = twilioService.formatAustralianPhone(validated.patientPhone);

    // Create or find patient
    let patient = await prisma.patient.findFirst({
      where: {
        ownerId: userId,
        firstName: validated.patientFirstName,
        lastName: validated.patientLastName,
      },
    });

    if (!patient) {
      patient = await prisma.patient.create({
        data: {
          ownerId: userId,
          firstName: validated.patientFirstName,
          lastName: validated.patientLastName,
          contactPhone: formattedPhone,
          contactEmail: validated.patientEmail || null,
        },
      });
    } else {
      patient = await prisma.patient.update({
        where: { id: patient.id },
        data: {
          contactPhone: formattedPhone,
          contactEmail: validated.patientEmail || null,
        },
      });
    }

    // Parse appointment datetime
    const appointmentDateTime = new Date(
      `${validated.appointmentDate}T${validated.appointmentTime}:00+10:00`
    );
    const appointmentEndTime = new Date(
      appointmentDateTime.getTime() + settings.defaultDuration * 60000
    );

    // Create HMR review
    const review = await prisma.hmrReview.create({
      data: {
        ownerId: userId,
        patientId: patient.id,
        referredBy: validated.referrerName,
        referralDate: new Date(),
        referralReason: validated.referralReason || null,
        referralNotes: validated.notes || null,
        scheduledAt: appointmentDateTime,
        status: settings.requireApproval ? 'PENDING' : 'SCHEDULED',
        visitLocation: 'To be confirmed',
      },
    });

    // Generate reschedule token
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
        let accessToken = user.microsoftAccessToken;
        if (user.microsoftTokenExpiry && new Date() >= user.microsoftTokenExpiry) {
          const refreshed = await graphService.refreshAccessToken(
            user.microsoftRefreshToken!
          );
          accessToken = refreshed.accessToken;

          await prisma.user.update({
            where: { id: userId },
            data: {
              microsoftAccessToken: refreshed.accessToken,
              microsoftRefreshToken: refreshed.refreshToken,
              microsoftTokenExpiry: new Date(Date.now() + refreshed.expiresIn * 1000),
            },
          });
        }

        const calendarEventId = await graphService.createCalendarEvent(accessToken, {
          subject: `HMR: ${patient.firstName} ${patient.lastName}`,
          body: `<p><strong>Home Medicines Review</strong></p>
                 <p>Patient: ${patient.firstName} ${patient.lastName}</p>
                 <p>Referred by: ${validated.referrerName}</p>
                 ${validated.referrerClinic ? `<p>Clinic: ${validated.referrerClinic}</p>` : ''}
                 <p>Reason: ${validated.referralReason || 'Not specified'}</p>
                 <p>Phone: ${formattedPhone}</p>`,
          startDateTime: appointmentDateTime.toISOString(),
          endDateTime: appointmentEndTime.toISOString(),
          attendees: validated.patientEmail
            ? [{ emailAddress: validated.patientEmail, name: `${patient.firstName} ${patient.lastName}` }]
            : [],
        });

        await prisma.hmrReview.update({
          where: { id: review.id },
          data: { calendarEventId },
        });
      } catch (error) {
        logger.error({ err: error }, 'Failed to create calendar event');
      }
    }

    // Send confirmation email
    if (validated.patientEmail) {
      try {
        const rescheduleLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reschedule/${token}`;

        await emailService.sendBookingConfirmation({
          patientEmail: validated.patientEmail,
          patientName: `${patient.firstName} ${patient.lastName}`,
          pharmacistName: user.username,
          appointmentDate: appointmentDateTime.toLocaleDateString('en-AU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          appointmentTime: validated.appointmentTime,
          rescheduleLink,
          referrerName: validated.referrerName,
        });
      } catch (error) {
        logger.error({ err: error }, 'Failed to send confirmation email');
      }
    }

    // Send confirmation SMS
    if (twilioService.isEnabled() && twilioService.isValidAustralianPhone(formattedPhone)) {
      try {
        await twilioService.sendAppointmentConfirmation({
          to: formattedPhone,
          patientName: patient.firstName,
          appointmentDate: appointmentDateTime.toLocaleDateString('en-AU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          appointmentTime: validated.appointmentTime,
        });

        await prisma.smsLog.create({
          data: {
            hmrReviewId: review.id,
            toPhone: formattedPhone,
            messageBody: 'Appointment confirmation',
            status: 'sent',
            sentAt: new Date(),
          },
        });
      } catch (error) {
        logger.error({ err: error }, 'Failed to send confirmation SMS');
        await prisma.smsLog.create({
          data: {
            hmrReviewId: review.id,
            toPhone: formattedPhone,
            messageBody: 'Appointment confirmation',
            status: 'failed',
            errorMsg: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    }

    res.status(201).json({
      success: true,
      bookingId: review.id,
      appointmentDateTime: appointmentDateTime.toISOString(),
      requiresApproval: settings.requireApproval,
      message: settings.requireApproval
        ? 'Your booking request has been submitted and is pending approval.'
        : 'Your appointment has been confirmed!',
    });
  })
);

// ========================================
// Reschedule Endpoints (Public)
// ========================================

/**
 * Get booking info by reschedule token
 * GET /api/booking/reschedule/:token
 */
router.get(
  '/reschedule/:token',
  asyncHandler(async (req, res) => {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
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
      return res.status(404).json({ error: 'Invalid reschedule link' });
    }

    if (rescheduleToken.usedAt) {
      return res.status(400).json({
        error: 'This reschedule link has already been used',
      });
    }

    if (new Date() > rescheduleToken.expiresAt) {
      return res.status(400).json({
        error: 'This reschedule link has expired',
      });
    }

    const review = rescheduleToken.hmrReview;

    res.json({
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
    });
  })
);

/**
 * Reschedule booking
 * POST /api/booking/reschedule/:token
 */
router.post(
  '/reschedule/:token',
  asyncHandler(async (req, res) => {
    const { token } = req.params;
    const validated = rescheduleSchema.parse(req.body);

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
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
      return res.status(404).json({ error: 'Invalid reschedule link' });
    }

    if (rescheduleToken.usedAt) {
      return res.status(400).json({
        error: 'This reschedule link has already been used',
      });
    }

    if (new Date() > rescheduleToken.expiresAt) {
      return res.status(400).json({
        error: 'This reschedule link has expired',
      });
    }

    const review = rescheduleToken.hmrReview;
    const user = review.owner;

    // Parse new appointment datetime
    const newAppointmentDateTime = new Date(
      `${validated.appointmentDate}T${validated.appointmentTime}:00+10:00`
    );

    // Update calendar event if synced
    if (user.calendarSyncEnabled && review.calendarEventId && user.microsoftAccessToken) {
      try {
        let accessToken = user.microsoftAccessToken;
        if (user.microsoftTokenExpiry && new Date() >= user.microsoftTokenExpiry) {
          const refreshed = await graphService.refreshAccessToken(
            user.microsoftRefreshToken!
          );
          accessToken = refreshed.accessToken;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              microsoftAccessToken: refreshed.accessToken,
              microsoftRefreshToken: refreshed.refreshToken,
              microsoftTokenExpiry: new Date(Date.now() + refreshed.expiresIn * 1000),
            },
          });
        }

        await graphService.updateCalendarEvent(
          accessToken,
          review.calendarEventId,
          {
            startDateTime: newAppointmentDateTime.toISOString(),
            endDateTime: new Date(newAppointmentDateTime.getTime() + 60 * 60000).toISOString(),
          }
        );
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

    // Send confirmation email
    if (review.patient.contactEmail) {
      try {
        await emailService.sendEmail({
          to: review.patient.contactEmail,
          subject: 'Appointment Rescheduled - Home Medicines Review',
          html: `
            <h2>Appointment Rescheduled</h2>
            <p>Dear ${review.patient.firstName},</p>
            <p>Your appointment has been successfully rescheduled to:</p>
            <p><strong>Date:</strong> ${newAppointmentDateTime.toLocaleDateString('en-AU', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</p>
            <p><strong>Time:</strong> ${validated.appointmentTime}</p>
            <p>If you have any questions, please contact ${user.username}.</p>
          `,
        });
      } catch (error) {
        logger.error({ err: error }, 'Failed to send reschedule confirmation email');
      }
    }

    // Send SMS confirmation
    if (review.patient.contactPhone && twilioService.isEnabled()) {
      try {
        await twilioService.sendAppointmentConfirmation({
          to: review.patient.contactPhone,
          patientName: review.patient.firstName,
          appointmentDate: newAppointmentDateTime.toLocaleDateString('en-AU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          appointmentTime: validated.appointmentTime,
        });
      } catch (error) {
        logger.error({ err: error }, 'Failed to send reschedule SMS');
      }
    }

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      newAppointmentDateTime: newAppointmentDateTime.toISOString(),
    });
  })
);

export default router;
