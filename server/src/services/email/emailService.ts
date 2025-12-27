import nodemailer from 'nodemailer';
import { logger } from '../../utils/logger';

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface BookingConfirmationParams {
  patientEmail: string;
  patientName: string;
  pharmacistName: string;
  appointmentDate: string;
  appointmentTime: string;
  rescheduleLink: string;
  referrerName?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private emailEnabled: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const emailProvider = process.env.EMAIL_PROVIDER || 'smtp';
    const emailEnabled = process.env.EMAIL_ENABLED === 'true';

    if (!emailEnabled) {
      logger.info('Email service is disabled');
      this.emailEnabled = false;
      return;
    }

    try {
      if (emailProvider === 'smtp') {
        const config = {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        };

        if (!config.host || !config.auth.user || !config.auth.pass) {
          logger.warn('Email service: Missing SMTP configuration');
          this.emailEnabled = false;
          return;
        }

        this.transporter = nodemailer.createTransport(config);
        this.emailEnabled = true;
        logger.info('Email service initialized with SMTP');
      } else {
        logger.warn(`Email provider "${emailProvider}" is not supported`);
        this.emailEnabled = false;
      }
    } catch (error) {
      logger.error('Failed to initialize email service', error);
      this.emailEnabled = false;
    }
  }

  async sendEmail(params: EmailParams): Promise<void> {
    if (!this.emailEnabled || !this.transporter) {
      logger.info('Email service disabled - email not sent', { to: params.to });
      return;
    }

    try {
      const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'noreply@bueteconsulting.com.au';
      const fromName = process.env.EMAIL_FROM_NAME || 'Buete Consulting';

      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text || params.html.replace(/<[^>]*>/g, ''), // Strip HTML as fallback
      });

      logger.info('Email sent successfully', {
        messageId: info.messageId,
        to: params.to,
      });
    } catch (error) {
      logger.error('Failed to send email', {
        error,
        to: params.to,
        subject: params.subject,
      });
      throw error;
    }
  }

  async sendBookingConfirmation(params: BookingConfirmationParams): Promise<void> {
    const { patientEmail, patientName, pharmacistName, appointmentDate, appointmentTime, rescheduleLink, referrerName } = params;

    const subject = 'Appointment Confirmation - Home Medicines Review';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #2563eb;
      color: white;
      padding: 30px 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      background-color: #ffffff;
      padding: 30px 20px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .appointment-details {
      background-color: #eff6ff;
      border-left: 4px solid #2563eb;
      padding: 20px;
      margin: 20px 0;
    }
    .appointment-details h2 {
      margin-top: 0;
      color: #1e40af;
      font-size: 18px;
    }
    .detail-row {
      display: flex;
      margin: 10px 0;
    }
    .detail-label {
      font-weight: 600;
      min-width: 120px;
      color: #4b5563;
    }
    .detail-value {
      color: #111827;
    }
    .button {
      display: inline-block;
      background-color: #2563eb;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 600;
    }
    .button:hover {
      background-color: #1d4ed8;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px;
      border: 1px solid #e5e7eb;
      border-top: none;
      border-radius: 0 0 8px 8px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
    }
    .warning {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>✓ Appointment Confirmed</h1>
  </div>

  <div class="content">
    <p>Dear ${patientName},</p>

    <p>Your Home Medicines Review appointment has been successfully scheduled with <strong>${pharmacistName}</strong>.</p>

    <div class="appointment-details">
      <h2>Appointment Details</h2>
      <div class="detail-row">
        <span class="detail-label">Patient:</span>
        <span class="detail-value">${patientName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date:</span>
        <span class="detail-value">${appointmentDate}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Time:</span>
        <span class="detail-value">${appointmentTime}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Pharmacist:</span>
        <span class="detail-value">${pharmacistName}</span>
      </div>
      ${referrerName ? `
      <div class="detail-row">
        <span class="detail-label">Referred by:</span>
        <span class="detail-value">${referrerName}</span>
      </div>
      ` : ''}
    </div>

    <h3>Need to Reschedule?</h3>
    <p>If you need to change your appointment time, you can reschedule using the link below:</p>

    <div style="text-align: center;">
      <a href="${rescheduleLink}" class="button">Reschedule Appointment</a>
    </div>

    <div class="warning">
      <strong>Important:</strong> This reschedule link is valid for 30 days and can only be used once. If you have any issues, please contact your referring doctor or pharmacist directly.
    </div>

    <h3>What to Prepare</h3>
    <p>Please have the following ready for your appointment:</p>
    <ul>
      <li>All current medications (prescription and over-the-counter)</li>
      <li>Recent pathology results (if available)</li>
      <li>List of current health concerns</li>
      <li>Medicare card</li>
    </ul>

    <p>If you have any questions before your appointment, please don't hesitate to contact us.</p>

    <p>We look forward to seeing you!</p>

    <p>Best regards,<br><strong>${pharmacistName}</strong><br>Accredited Pharmacist</p>
  </div>

  <div class="footer">
    <p>This is an automated confirmation email. Please do not reply directly to this message.</p>
    <p>&copy; ${new Date().getFullYear()} Buete Consulting. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    await this.sendEmail({
      to: patientEmail,
      subject,
      html,
    });
  }

  async testConnection(): Promise<boolean> {
    if (!this.emailEnabled || !this.transporter) {
      logger.warn('Email service is not enabled');
      return false;
    }

    try {
      await this.transporter.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service connection test failed', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
