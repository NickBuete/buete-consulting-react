/**
 * SMS Reply Service
 * Handles incoming SMS replies from patients via Twilio webhooks
 */

import { prisma } from '../../db/prisma';
import { logger } from '../../utils/logger';
import { emailService } from '../email/emailService';

export interface IncomingSMS {
  from: string; // Patient's phone number
  to: string; // Your Twilio number
  body: string; // Message content
  messageSid: string; // Twilio message ID
  accountSid: string; // Twilio account ID
}

/**
 * Process incoming SMS reply from patient
 */
export async function processIncomingSMS(sms: IncomingSMS): Promise<void> {
  logger.info(
    {
      from: sms.from,
      messageSid: sms.messageSid,
      bodyLength: sms.body.length,
    },
    'Processing incoming SMS reply'
  );

  try {
    // Find the patient by phone number
    const patient = await prisma.patient.findFirst({
      where: {
        contactPhone: sms.from,
      },
      include: {
        owner: {
          select: {
            email: true,
            username: true,
          },
        },
        hmrReviews: {
          where: {
            scheduledAt: {
              gte: new Date(), // Only upcoming appointments
            },
          },
          orderBy: {
            scheduledAt: 'asc',
          },
          take: 1,
        },
      },
    });

    // Log the incoming SMS
    await prisma.smsLog.create({
      data: {
        hmrReviewId: patient?.hmrReviews[0]?.id || null,
        toPhone: sms.to, // Your number (received at)
        messageType: 'reply',
        messageBody: sms.body,
        messageSid: sms.messageSid,
        status: 'received',
        sentAt: new Date(),
      },
    });

    // Send email notification to pharmacist
    if (patient && patient.owner?.email) {
      const patientName = `${patient.firstName} ${patient.lastName}`;
      const upcomingAppointment = patient.hmrReviews?.[0];
      const appointmentInfo = upcomingAppointment?.scheduledAt
        ? `\nUpcoming appointment: ${upcomingAppointment.scheduledAt.toLocaleString('en-AU')}`
        : '';

      await emailService.sendEmail({
        to: patient.owner.email,
        subject: `SMS Reply from ${patientName}`,
        html: `
          <h2>Patient SMS Reply Received</h2>
          <p><strong>From:</strong> ${patientName}</p>
          <p><strong>Phone:</strong> ${sms.from}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString('en-AU')}</p>
          ${appointmentInfo}
          <hr>
          <h3>Message:</h3>
          <p>${sms.body}</p>
          <hr>
          <p><em>This is an automated notification from your HMR system.</em></p>
        `,
        text: `
Patient SMS Reply Received

From: ${patientName}
Phone: ${sms.from}
Time: ${new Date().toLocaleString('en-AU')}
${appointmentInfo}

Message:
${sms.body}

---
This is an automated notification from your HMR system.
        `,
      });

      logger.info(
        { patientName, pharmacistEmail: patient.owner.email },
        'Email notification sent for SMS reply'
      );
    } else if (!patient) {
      // Unknown sender - log and notify admin
      logger.warn(
        { from: sms.from, body: sms.body },
        'SMS received from unknown phone number'
      );

      // Optional: Send notification to admin email
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        await emailService.sendEmail({
          to: adminEmail,
          subject: 'SMS Reply from Unknown Number',
          html: `
            <h2>SMS Reply from Unknown Sender</h2>
            <p><strong>From:</strong> ${sms.from}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString('en-AU')}</p>
            <hr>
            <h3>Message:</h3>
            <p>${sms.body}</p>
            <hr>
            <p><em>This sender is not in your patient database.</em></p>
          `,
          text: `
SMS Reply from Unknown Sender

From: ${sms.from}
Time: ${new Date().toLocaleString('en-AU')}

Message:
${sms.body}

---
This sender is not in your patient database.
          `,
        });
      }
    }

    logger.info({ messageSid: sms.messageSid }, 'Successfully processed incoming SMS');
  } catch (error) {
    logger.error({ err: error, messageSid: sms.messageSid }, 'Failed to process incoming SMS');
    throw error;
  }
}

/**
 * Get recent SMS replies for a specific HMR review
 */
export async function getSMSRepliesForReview(reviewId: number) {
  return prisma.smsLog.findMany({
    where: {
      hmrReviewId: reviewId,
      messageType: 'reply',
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Get all recent SMS replies
 */
export async function getRecentSMSReplies(limit: number = 50) {
  return prisma.smsLog.findMany({
    where: {
      messageType: 'reply',
      status: 'received',
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
}
