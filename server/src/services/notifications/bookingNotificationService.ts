/**
 * Booking notification service
 * Consolidates email/SMS notification logic duplicated across bookingRoutes
 * Handles both confirmation and reschedule notifications with SMS logging
 */

import { prisma } from '../../db/prisma';
import { twilioService } from '../sms/twilioService';
import { emailService } from '../email/emailService';
import { logger } from '../../utils/logger';
import { BOOKING_TIME_ZONE } from '../../utils/bookingTime';

/**
 * Result of notification sending operations
 */
export interface NotificationResult {
  emailSent: boolean;
  smsSent: boolean;
  errors: string[];
}

interface BookingNotificationParams {
  reviewId: number;
  patientEmail: string | null | undefined;
  patientName: string;
  patientPhone: string;
  pharmacistName: string;
  appointmentDateTime: Date;
  appointmentTime: string;
  referrerName?: string;
  rescheduleLink?: string;
}

/**
 * Sends booking confirmation notifications (email + SMS)
 * Integrates SMS logging internally
 * Does NOT throw errors - logs them and returns status
 *
 * @param params - Notification parameters
 * @returns Notification result with success status and any errors
 */
export const sendBookingConfirmation = async (
  params: BookingNotificationParams
): Promise<NotificationResult> => {
  const result: NotificationResult = {
    emailSent: false,
    smsSent: false,
    errors: [],
  };

  const formattedDate = params.appointmentDateTime.toLocaleDateString('en-AU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: BOOKING_TIME_ZONE,
  });

  // Send confirmation email
  if (params.patientEmail && params.rescheduleLink) {
    try {
      const emailParams: Parameters<typeof emailService.sendBookingConfirmation>[0] = {
        patientEmail: params.patientEmail,
        patientName: params.patientName,
        pharmacistName: params.pharmacistName,
        appointmentDate: formattedDate,
        appointmentTime: params.appointmentTime,
        rescheduleLink: params.rescheduleLink,
      };

      if (params.referrerName) {
        emailParams.referrerName = params.referrerName;
      }

      await emailService.sendBookingConfirmation(emailParams);
      result.emailSent = true;
      logger.info({ reviewId: params.reviewId, email: params.patientEmail }, 'Booking confirmation email sent');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ err: error, reviewId: params.reviewId }, 'Failed to send confirmation email');
      result.errors.push(`Email: ${errorMsg}`);
    }
  }

  // Send confirmation SMS
  if (twilioService.isEnabled() && twilioService.isValidAustralianPhone(params.patientPhone)) {
    try {
      await twilioService.sendAppointmentConfirmation({
        to: params.patientPhone,
        patientName: params.patientName.split(' ')[0], // First name only for SMS
        appointmentDate: formattedDate,
        appointmentTime: params.appointmentTime,
      });

      // Log successful SMS
      await prisma.smsLog.create({
        data: {
          hmrReviewId: params.reviewId,
          toPhone: params.patientPhone,
          messageBody: 'Appointment confirmation',
          status: 'sent',
          sentAt: new Date(),
        },
      });

      result.smsSent = true;
      logger.info({ reviewId: params.reviewId, phone: params.patientPhone }, 'Booking confirmation SMS sent');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ err: error, reviewId: params.reviewId }, 'Failed to send confirmation SMS');
      result.errors.push(`SMS: ${errorMsg}`);

      // Log failed SMS
      try {
        await prisma.smsLog.create({
          data: {
            hmrReviewId: params.reviewId,
            toPhone: params.patientPhone,
            messageBody: 'Appointment confirmation',
            status: 'failed',
            errorMsg,
          },
        });
      } catch (logError) {
        logger.error({ err: logError }, 'Failed to log SMS failure');
      }
    }
  }

  return result;
};

/**
 * Sends reschedule notification (email + SMS)
 * Similar to booking confirmation but with reschedule-specific messaging
 *
 * @param params - Notification parameters
 * @returns Notification result with success status and any errors
 */
export const sendRescheduleNotification = async (
  params: BookingNotificationParams
): Promise<NotificationResult> => {
  const result: NotificationResult = {
    emailSent: false,
    smsSent: false,
    errors: [],
  };

  const formattedDate = params.appointmentDateTime.toLocaleDateString('en-AU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: BOOKING_TIME_ZONE,
  });

  // Send reschedule email
  if (params.patientEmail && params.rescheduleLink) {
    try {
      const emailParams: Parameters<typeof emailService.sendBookingConfirmation>[0] = {
        patientEmail: params.patientEmail,
        patientName: params.patientName,
        pharmacistName: params.pharmacistName,
        appointmentDate: formattedDate,
        appointmentTime: params.appointmentTime,
        rescheduleLink: params.rescheduleLink,
      };

      if (params.referrerName) {
        emailParams.referrerName = params.referrerName;
      }

      // Using the same sendBookingConfirmation method as it handles reschedule links
      await emailService.sendBookingConfirmation(emailParams);
      result.emailSent = true;
      logger.info({ reviewId: params.reviewId, email: params.patientEmail }, 'Reschedule confirmation email sent');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ err: error, reviewId: params.reviewId }, 'Failed to send reschedule email');
      result.errors.push(`Email: ${errorMsg}`);
    }
  }

  // Send reschedule SMS
  if (twilioService.isEnabled() && twilioService.isValidAustralianPhone(params.patientPhone)) {
    try {
      await twilioService.sendAppointmentConfirmation({
        to: params.patientPhone,
        patientName: params.patientName.split(' ')[0], // First name only for SMS
        appointmentDate: formattedDate,
        appointmentTime: params.appointmentTime,
      });

      // Log successful SMS
      await prisma.smsLog.create({
        data: {
          hmrReviewId: params.reviewId,
          toPhone: params.patientPhone,
          messageBody: 'Appointment rescheduled confirmation',
          status: 'sent',
          sentAt: new Date(),
        },
      });

      result.smsSent = true;
      logger.info({ reviewId: params.reviewId, phone: params.patientPhone }, 'Reschedule confirmation SMS sent');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ err: error, reviewId: params.reviewId }, 'Failed to send reschedule SMS');
      result.errors.push(`SMS: ${errorMsg}`);

      // Log failed SMS
      try {
        await prisma.smsLog.create({
          data: {
            hmrReviewId: params.reviewId,
            toPhone: params.patientPhone,
            messageBody: 'Appointment rescheduled confirmation',
            status: 'failed',
            errorMsg,
          },
        });
      } catch (logError) {
        logger.error({ err: logError }, 'Failed to log SMS failure');
      }
    }
  }

  return result;
};
