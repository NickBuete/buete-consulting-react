import twilio from 'twilio';
import { logger } from '../../utils/logger';

interface SMSConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  senderName: string | null;
  enabled: boolean;
}

interface SMSMessage {
  to: string;
  body: string;
}

interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Twilio SMS service for sending appointment reminders and notifications
 */
export class TwilioService {
  private config: SMSConfig;
  private client: twilio.Twilio | null = null;

  constructor() {
    this.config = {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
      senderName: process.env.TWILIO_SENDER_NAME || null,
      enabled: process.env.SMS_ENABLED === 'true',
    };

    if (this.config.enabled) {
      if (!this.config.accountSid || !this.config.authToken) {
        logger.warn(
          'SMS is enabled but Twilio credentials are not configured. SMS functionality will be disabled.'
        );
        this.config.enabled = false;
      } else {
        this.client = twilio(this.config.accountSid, this.config.authToken);
        logger.info('Twilio SMS service initialized');
      }
    } else {
      logger.info('SMS service is disabled');
    }
  }

  /**
   * Check if SMS service is enabled and configured
   */
  isEnabled(): boolean {
    return this.config.enabled && this.client !== null;
  }

  /**
   * Send an SMS message
   */
  async sendSMS(message: SMSMessage): Promise<SMSResult> {
    if (!this.isEnabled()) {
      logger.warn('SMS service is disabled. Message not sent.');
      return {
        success: false,
        error: 'SMS service is not enabled',
      };
    }

    try {
      // Validate phone number format (Australian +61 format)
      const phoneRegex = /^\+61[0-9]{9}$/;
      if (!phoneRegex.test(message.to)) {
        logger.warn(`Invalid phone number format: ${message.to}`);
        return {
          success: false,
          error: 'Invalid phone number format. Use +61 format (e.g., +61412345678)',
        };
      }

      // Use sender name (Alpha ID) if configured, otherwise use phone number
      // Note: Alpha Sender IDs work in Australia but only for one-way messaging
      const fromValue = this.config.senderName || this.config.phoneNumber;

      const result = await this.client!.messages.create({
        body: message.body,
        from: fromValue,
        to: message.to,
      });

      logger.info(`SMS sent successfully to ${message.to}. Message SID: ${result.sid}`);

      return {
        success: true,
        messageId: result.sid,
      };
    } catch (error: any) {
      logger.error(`Failed to send SMS to ${message.to}:`, error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
      };
    }
  }

  /**
   * Send appointment reminder SMS
   */
  async sendAppointmentReminder(params: {
    to: string;
    patientName: string;
    appointmentDate: string;
    appointmentTime: string;
    checklistUrl: string;
  }): Promise<SMSResult> {
    const message = `Hi ${params.patientName}, this is a reminder about your Home Medicines Review appointment tomorrow at ${params.appointmentTime}. Please prepare using our checklist: ${params.checklistUrl}. Reply STOP to unsubscribe.`;

    return this.sendSMS({
      to: params.to,
      body: message,
    });
  }

  /**
   * Send appointment confirmation SMS
   */
  async sendAppointmentConfirmation(params: {
    to: string;
    patientName: string;
    appointmentDate: string;
    appointmentTime: string;
    location?: string;
  }): Promise<SMSResult> {
    let message = `Hi ${params.patientName}, your Home Medicines Review is confirmed for ${params.appointmentDate} at ${params.appointmentTime}.`;

    if (params.location) {
      message += ` Location: ${params.location}.`;
    }

    message += ` You will receive a reminder 24 hours beforehand. Reply STOP to unsubscribe.`;

    return this.sendSMS({
      to: params.to,
      body: message,
    });
  }

  /**
   * Send appointment cancellation SMS
   */
  async sendAppointmentCancellation(params: {
    to: string;
    patientName: string;
    appointmentDate: string;
  }): Promise<SMSResult> {
    const message = `Hi ${params.patientName}, your Home Medicines Review appointment on ${params.appointmentDate} has been cancelled. Please contact us to reschedule. Reply STOP to unsubscribe.`;

    return this.sendSMS({
      to: params.to,
      body: message,
    });
  }

  /**
   * Format phone number to Australian +61 format
   */
  formatAustralianPhone(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // Handle different input formats
    if (cleaned.startsWith('61')) {
      // Already has country code
      return `+${cleaned}`;
    } else if (cleaned.startsWith('0')) {
      // Remove leading 0 and add country code
      return `+61${cleaned.substring(1)}`;
    } else if (cleaned.length === 9) {
      // Missing leading 0 and country code
      return `+61${cleaned}`;
    }

    // Return as-is if format is unclear
    return phone;
  }

  /**
   * Validate Australian phone number
   */
  isValidAustralianPhone(phone: string): boolean {
    const formatted = this.formatAustralianPhone(phone);
    const phoneRegex = /^\+61[0-9]{9}$/;
    return phoneRegex.test(formatted);
  }
}

export const twilioService = new TwilioService();
