/**
 * SMS webhook routes
 * Handles incoming SMS from Twilio
 */

import { Router, Request, Response } from 'express';
import { processIncomingSMS } from '../services/notifications/smsReplyService';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/sms/webhook
 * Twilio webhook for incoming SMS messages
 *
 * When a patient replies to an SMS, Twilio sends a POST request here
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    logger.info({ body: req.body }, 'Received Twilio SMS webhook');

    // Twilio sends these parameters
    const { From, To, Body, MessageSid, AccountSid } = req.body;

    if (!From || !Body) {
      logger.warn({ body: req.body }, 'Invalid webhook payload from Twilio');
      return res.status(400).send('Missing required parameters');
    }

    // Process the incoming SMS
    await processIncomingSMS({
      from: From,
      to: To,
      body: Body,
      messageSid: MessageSid,
      accountSid: AccountSid,
    });

    // Respond to Twilio (must respond with 200 OK)
    // TwiML response (empty means no auto-reply)
    res.type('text/xml');
    res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  } catch (error) {
    logger.error({ err: error }, 'Error processing SMS webhook');

    // Still return 200 to Twilio to avoid retries
    res.type('text/xml');
    res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  }
});

/**
 * GET /api/sms/webhook
 * Health check for Twilio webhook
 */
router.get('/webhook', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'SMS webhook endpoint is active',
    instructions: 'Configure this URL in Twilio console as your SMS webhook'
  });
});

export default router;
