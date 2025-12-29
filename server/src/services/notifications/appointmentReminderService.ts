/**
 * Appointment reminder service
 * Handles automated SMS reminders for upcoming HMR appointments
 * Sends reminders 24 hours before scheduled appointments
 */

import { prisma } from '../../db/prisma';
import { twilioService } from '../sms/twilioService';
import { logger } from '../../utils/logger';
import { BOOKING_TIME_ZONE } from '../../utils/bookingTime';

interface ReminderResult {
  reviewId: number;
  patientName: string;
  sent: boolean;
  error?: string;
}

interface ReminderSummary {
  totalProcessed: number;
  sent: number;
  failed: number;
  skipped: number;
  details: ReminderResult[];
}

/**
 * Get HMR reviews that need reminders sent (24 hours before appointment)
 * Only includes reviews that:
 * - Have a scheduled appointment (scheduledAt is not null)
 * - Appointment is between 23-25 hours from now (24h window with 1h buffer)
 * - Reminder has not been sent yet (reminderSentAt is null)
 * - Patient has a valid phone number
 */
async function getReviewsNeedingReminders(): Promise<any[]> {
  const now = new Date();

  // Calculate time window: 23-25 hours from now
  const reminderWindowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const reminderWindowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const reviews = await prisma.hmrReview.findMany({
    where: {
      scheduledAt: {
        gte: reminderWindowStart,
        lte: reminderWindowEnd,
      },
      reminderSentAt: null,
      patient: {
        contactPhone: {
          not: null,
        },
      },
    },
    include: {
      patient: {
        select: {
          firstName: true,
          lastName: true,
          preferredName: true,
          contactPhone: true,
        },
      },
      owner: {
        select: {
          username: true,
          email: true,
        },
      },
    },
  });

  return reviews;
}

/**
 * Send a single appointment reminder SMS
 */
async function sendReminderForReview(review: any): Promise<ReminderResult> {
  const result: ReminderResult = {
    reviewId: review.id,
    patientName: review.patient.preferredName || review.patient.firstName,
    sent: false,
  };

  try {
    const patientPhone = review.patient.contactPhone;

    // Validate phone number
    if (!twilioService.isValidAustralianPhone(patientPhone)) {
      result.error = 'Invalid phone number format';
      logger.warn(
        { reviewId: review.id, phone: patientPhone },
        'Skipping reminder - invalid phone number'
      );
      return result;
    }

    // Format appointment details
    const appointmentDateTime = new Date(review.scheduledAt);
    const formattedDate = appointmentDateTime.toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: BOOKING_TIME_ZONE,
    });

    const formattedTime = appointmentDateTime.toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: BOOKING_TIME_ZONE,
    });

    // Generate checklist URL if checklist token exists
    const checklistToken = await prisma.checklistToken.findFirst({
      where: {
        hmrReviewId: review.id,
        expiresAt: {
          gt: new Date(),
        },
        usedAt: null,
      },
    });

    const checklistUrl = checklistToken
      ? `${process.env.FRONTEND_URL || 'https://yourdomain.com'}/checklist/${checklistToken.token}`
      : '';

    // Send SMS reminder
    const smsResult = await twilioService.sendAppointmentReminder({
      to: twilioService.formatAustralianPhone(patientPhone),
      patientName: result.patientName,
      appointmentDate: formattedDate,
      appointmentTime: formattedTime,
      checklistUrl,
    });

    if (smsResult.success) {
      // Update review to mark reminder as sent
      await prisma.hmrReview.update({
        where: { id: review.id },
        data: { reminderSentAt: new Date() },
      });

      // Log successful SMS with message type
      await prisma.smsLog.create({
        data: {
          hmrReviewId: review.id,
          toPhone: twilioService.formatAustralianPhone(patientPhone),
          messageType: 'reminder',
          messageBody: 'Appointment reminder (24h before)',
          messageSid: smsResult.messageId,
          status: 'sent',
          sentAt: new Date(),
        },
      });

      result.sent = true;
      logger.info(
        { reviewId: review.id, phone: patientPhone },
        'Appointment reminder sent successfully'
      );
    } else {
      result.error = smsResult.error;

      // Log failed SMS
      await prisma.smsLog.create({
        data: {
          hmrReviewId: review.id,
          toPhone: twilioService.formatAustralianPhone(patientPhone),
          messageType: 'reminder',
          messageBody: 'Appointment reminder (24h before)',
          status: 'failed',
          errorMsg: smsResult.error,
        },
      });

      logger.error(
        { reviewId: review.id, error: smsResult.error },
        'Failed to send appointment reminder'
      );
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    result.error = errorMsg;

    logger.error(
      { err: error, reviewId: review.id },
      'Exception while sending appointment reminder'
    );

    // Log failed SMS on exception
    try {
      await prisma.smsLog.create({
        data: {
          hmrReviewId: review.id,
          toPhone: review.patient.contactPhone,
          messageType: 'reminder',
          messageBody: 'Appointment reminder (24h before)',
          status: 'failed',
          errorMsg,
        },
      });
    } catch (logError) {
      logger.error({ err: logError }, 'Failed to log SMS failure');
    }
  }

  return result;
}

/**
 * Process all pending appointment reminders
 * This function should be called by a scheduled job (cron)
 *
 * @returns Summary of reminder processing
 */
export async function processAppointmentReminders(): Promise<ReminderSummary> {
  logger.info('Starting appointment reminder processing');

  const summary: ReminderSummary = {
    totalProcessed: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    details: [],
  };

  // Check if SMS service is enabled
  if (!twilioService.isEnabled()) {
    logger.warn('SMS service is disabled. Skipping reminder processing.');
    return summary;
  }

  try {
    // Get all reviews needing reminders
    const reviews = await getReviewsNeedingReminders();
    summary.totalProcessed = reviews.length;

    logger.info(
      { count: reviews.length },
      'Found reviews needing appointment reminders'
    );

    // Process each review
    for (const review of reviews) {
      const result = await sendReminderForReview(review);
      summary.details.push(result);

      if (result.sent) {
        summary.sent++;
      } else if (result.error) {
        summary.failed++;
      } else {
        summary.skipped++;
      }
    }

    logger.info(
      {
        total: summary.totalProcessed,
        sent: summary.sent,
        failed: summary.failed,
        skipped: summary.skipped,
      },
      'Completed appointment reminder processing'
    );
  } catch (error) {
    logger.error({ err: error }, 'Error during reminder processing');
    throw error;
  }

  return summary;
}

/**
 * Manual trigger for sending reminder for a specific review
 * Useful for testing or manual intervention
 */
export async function sendManualReminder(reviewId: number): Promise<ReminderResult> {
  logger.info({ reviewId }, 'Manually triggering appointment reminder');

  const review = await prisma.hmrReview.findUnique({
    where: { id: reviewId },
    include: {
      patient: {
        select: {
          firstName: true,
          lastName: true,
          preferredName: true,
          contactPhone: true,
        },
      },
      owner: {
        select: {
          username: true,
          email: true,
        },
      },
    },
  });

  if (!review) {
    throw new Error(`Review not found: ${reviewId}`);
  }

  if (!review.scheduledAt) {
    throw new Error(`Review ${reviewId} does not have a scheduled appointment`);
  }

  return sendReminderForReview(review);
}
