/**
 * Test script to send a test SMS
 * Usage: ts-node scripts/testSMS.ts
 */

// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import { twilioService } from '../src/services/sms/twilioService';
import { logger } from '../src/utils/logger';

async function sendTestSMS() {
  const testPhone = '+61413271072';

  logger.info({ phone: testPhone }, 'Sending test SMS...');

  try {
    // Check if SMS is enabled
    if (!twilioService.isEnabled()) {
      logger.error('SMS service is not enabled. Check your .env file.');
      process.exit(1);
    }

    // Validate phone number
    if (!twilioService.isValidAustralianPhone(testPhone)) {
      logger.error({ phone: testPhone }, 'Invalid Australian phone number format');
      process.exit(1);
    }

    // Send test SMS
    const result = await twilioService.sendSMS({
      to: testPhone,
      body: 'Test SMS from Buete Consulting HMR system. The SMS reminder system is working correctly! 🎉',
    });

    if (result.success) {
      logger.info(
        {
          phone: testPhone,
          messageId: result.messageId
        },
        'Test SMS sent successfully!'
      );
      console.log('\n✅ SUCCESS: Test SMS sent!');
      console.log(`Message SID: ${result.messageId}`);
    } else {
      logger.error(
        {
          phone: testPhone,
          error: result.error
        },
        'Failed to send test SMS'
      );
      console.log('\n❌ FAILED: Could not send test SMS');
      console.log(`Error: ${result.error}`);
      process.exit(1);
    }
  } catch (error) {
    logger.error({ err: error }, 'Exception while sending test SMS');
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  }

  process.exit(0);
}

sendTestSMS();
