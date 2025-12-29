import { Resend } from 'resend';
import { logger } from '../../utils/logger';

interface HMRConfirmationParams {
  patientEmail: string;
  patientName: string;
  patientAddress: string;
  pharmacistName: string;
  pharmacistEmail: string;
  pharmacistPhone: string;
  pharmacyBusiness: string;
  appointmentTime: string; // e.g., "Monday, 15 January 2025 at 2:00 PM"
  rescheduleToken: string;
}

interface PharmacistNotificationParams {
  pharmacistEmail: string;
  pharmacistName: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  referrerName: string;
  appointmentDateTime: string;
  appointmentTime: string;
  bookingId: number;
}

class ResendService {
  private resend: Resend | null = null;
  private enabled: boolean = false;
  private baseUrl: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (!apiKey) {
      logger.info('Resend API key not configured - email service disabled');
      return;
    }

    this.resend = new Resend(apiKey);
    this.enabled = true;
    logger.info('Resend email service initialized');
  }

  isEnabled(): boolean {
    return this.enabled && this.resend !== null;
  }

  /**
   * Send HMR appointment confirmation to patient using Resend template
   */
  async sendHMRConfirmation(params: HMRConfirmationParams): Promise<void> {
    if (!this.isEnabled() || !this.resend) {
      logger.info('Resend service disabled - skipping patient confirmation email');
      return;
    }

    try {
      const rescheduleUrl = `${this.baseUrl}/reschedule?token=${params.rescheduleToken}`;

      await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@bueteconsulting.au',
        to: params.patientEmail,
        subject: 'Your HMR Appointment Confirmation',
        react: null as any, // We're using a template
        // @ts-ignore - Resend SDK types don't include template_id yet
        template_id: 'hmr-interview-confirmation',
        template_data: {
          Patient_name: params.patientName,
          Patient_address: params.patientAddress,
          Pharmacist_name: params.pharmacistName,
          Pharmacist_email: params.pharmacistEmail,
          Pharmacist_phone: params.pharmacistPhone,
          Pharmacy_business: params.pharmacyBusiness,
          Appointment_time: params.appointmentTime,
          base_url: this.baseUrl,
          reschedule_token: params.rescheduleToken,
        },
      });

      logger.info({
        to: params.patientEmail,
        template: 'hmr-interview-confirmation'
      }, 'Patient confirmation email sent via Resend');
    } catch (error) {
      logger.error({ err: error, to: params.patientEmail }, 'Failed to send Resend confirmation email');
      throw error;
    }
  }

  /**
   * Send notification to pharmacist about new booking
   */
  async sendPharmacistNotification(
    params: PharmacistNotificationParams,
    file?: Express.Multer.File
  ): Promise<void> {
    if (!this.isEnabled() || !this.resend) {
      logger.info('Resend service disabled - skipping pharmacist notification email');
      return;
    }

    try {
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
    .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9fafb; }
    .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #2563eb; }
    .detail-row { margin: 8px 0; }
    .label { font-weight: 600; color: #4b5563; }
    .value { color: #111827; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔔 New Booking Received</h1>
  </div>

  <div class="content">
    <p>Hi ${params.pharmacistName},</p>

    <p>You have received a new HMR booking request.</p>

    <div class="details">
      <h3>Patient Information</h3>
      <div class="detail-row">
        <span class="label">Name:</span> <span class="value">${params.patientName}</span>
      </div>
      <div class="detail-row">
        <span class="label">Phone:</span> <span class="value">${params.patientPhone}</span>
      </div>
      ${params.patientEmail ? `
      <div class="detail-row">
        <span class="label">Email:</span> <span class="value">${params.patientEmail}</span>
      </div>
      ` : ''}
    </div>

    <div class="details">
      <h3>Appointment Details</h3>
      <div class="detail-row">
        <span class="label">Date & Time:</span> <span class="value">${params.appointmentDateTime}</span>
      </div>
      <div class="detail-row">
        <span class="label">Referred by:</span> <span class="value">${params.referrerName}</span>
      </div>
      <div class="detail-row">
        <span class="label">Booking ID:</span> <span class="value">#${params.bookingId}</span>
      </div>
    </div>

    ${file ? `
    <div style="background-color: #eff6ff; padding: 15px; margin: 20px 0; border-left: 4px solid #2563eb;">
      <p style="margin: 0;"><strong>📎 Referral document attached</strong></p>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #4b5563;">The referrer has uploaded a document with this booking.</p>
    </div>
    ` : ''}

    <p>Please log into your dashboard to view full details and manage this booking.</p>

    <p style="text-align: center; margin: 30px 0;">
      <a href="${this.baseUrl}/admin/bookings" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Dashboard</a>
    </p>

    <p>Best regards,<br>Your HMR Booking System</p>
  </div>
</body>
</html>
      `;

      const emailData: any = {
        from: process.env.RESEND_FROM_EMAIL || 'noreply@bueteconsulting.au',
        to: params.pharmacistEmail,
        subject: `New Booking: ${params.patientName} - ${params.appointmentTime}`,
        html,
      };

      // Add attachment if file is provided
      if (file) {
        emailData.attachments = [
          {
            filename: file.originalname || 'referral-document.pdf',
            content: file.buffer,
          },
        ];
      }

      await this.resend.emails.send(emailData);

      logger.info({
        to: params.pharmacistEmail,
        bookingId: params.bookingId
      }, 'Pharmacist notification email sent via Resend');
    } catch (error) {
      logger.error({ err: error, to: params.pharmacistEmail }, 'Failed to send pharmacist notification email');
      throw error;
    }
  }
}

export const resendService = new ResendService();
