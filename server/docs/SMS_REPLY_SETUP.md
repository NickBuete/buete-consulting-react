# SMS Reply Notification Setup

## Overview
When patients reply to your SMS messages, Twilio can forward those replies to your server, which will:
1. Log the reply in the database
2. Send you an email notification with the patient's message
3. Associate the reply with the correct HMR appointment

## How It Works

```
Patient replies to SMS
       ↓
Twilio receives reply
       ↓
Twilio sends webhook to your server
       ↓
Server processes reply:
  - Finds patient by phone number
  - Logs reply in sms_logs table
  - Sends email to pharmacist
       ↓
You receive email notification
```

## Setup Instructions

### 1. Deploy Your Server
Your server must be publicly accessible for Twilio to send webhooks. Options:
- **Production**: Deploy to Vercel, Heroku, AWS, etc.
- **Development/Testing**: Use ngrok to expose localhost

#### Using ngrok for Testing:
```bash
# Install ngrok (if not installed)
brew install ngrok  # macOS
# or download from https://ngrok.com

# Start your server
cd server
npm run dev

# In another terminal, expose port 4000
ngrok http 4000

# You'll get a URL like: https://abc123.ngrok.io
```

### 2. Configure Twilio Webhook

1. **Log into Twilio Console**: https://console.twilio.com
2. **Navigate to Phone Numbers**:
   - Click "Phone Numbers" → "Manage" → "Active numbers"
   - Click on your number: +61 483 916 702

3. **Configure Messaging Webhook**:
   - Scroll to "Messaging" section
   - Under "A MESSAGE COMES IN":
     - **Webhook URL**: `https://your-domain.com/api/sms/webhook`
       - For production: `https://your-api-domain.vercel.app/api/sms/webhook`
       - For testing with ngrok: `https://abc123.ngrok.io/api/sms/webhook`
     - **HTTP Method**: POST
     - **Content Type**: application/x-www-form-urlencoded

4. **Save** the configuration

### 3. Configure Email Notifications

Add your email to receive notifications in `.env`:

```bash
# Optional: Admin email for unknown sender notifications
ADMIN_EMAIL=your-email@example.com
```

Make sure your email service is configured. Check `/server/src/services/email/emailService.ts` for email configuration.

### 4. Test the Setup

#### Test 1: Verify Webhook Endpoint
```bash
# Should return status: ok
curl https://your-domain.com/api/sms/webhook
```

#### Test 2: Send Test SMS Reply
1. Send an SMS to a patient (or use the test script)
2. Reply to that SMS from the patient's phone
3. Check your email - you should receive a notification
4. Check the database:

```sql
-- View all SMS replies
SELECT * FROM sms_logs
WHERE message_type = 'reply'
ORDER BY created_at DESC;
```

## What Happens When a Patient Replies

### For Known Patients (in your database):
1. Reply is logged in `sms_logs` table with `message_type='reply'`
2. Email sent to the pharmacist who owns that patient with:
   - Patient name
   - Phone number
   - Reply message
   - Upcoming appointment details (if any)

### For Unknown Numbers:
1. Reply is still logged in `sms_logs` table
2. Email sent to `ADMIN_EMAIL` (if configured) notifying unknown sender
3. No patient association

## Viewing SMS Replies

### Via Database Queries

**All recent replies:**
```sql
SELECT
  sl.created_at,
  sl.to_phone as from_patient,
  sl.message_body,
  p.first_name || ' ' || p.last_name as patient_name,
  u.email as pharmacist_email
FROM sms_logs sl
LEFT JOIN hmr_reviews hr ON sl.hmr_review_id = hr.id
LEFT JOIN patients p ON hr.patient_id = p.id
LEFT JOIN users u ON p.owner_id = u.id
WHERE sl.message_type = 'reply'
ORDER BY sl.created_at DESC
LIMIT 20;
```

**Replies for specific patient:**
```sql
SELECT
  created_at,
  message_body,
  status
FROM sms_logs
WHERE to_phone = '+61413271072'  -- Patient's phone
  AND message_type = 'reply'
ORDER BY created_at DESC;
```

**Conversation thread (sent + received):**
```sql
SELECT
  created_at,
  message_type,
  message_body,
  status,
  CASE
    WHEN message_type = 'reply' THEN 'Patient'
    ELSE 'You'
  END as sender
FROM sms_logs
WHERE hmr_review_id = 123  -- Specific appointment
ORDER BY created_at ASC;
```

## Troubleshooting

### Not Receiving Email Notifications

1. **Check email service is configured**
   ```bash
   # Check your email service logs
   grep "email" logs/server.log
   ```

2. **Check spam folder** - automated emails may be filtered

3. **Verify email service environment variables** are set

### Webhook Not Being Called

1. **Verify URL is correct** in Twilio console
2. **Check URL is publicly accessible**:
   ```bash
   curl https://your-domain.com/api/sms/webhook
   # Should return: {"status":"ok",...}
   ```

3. **Check Twilio debugger**:
   - Go to: https://console.twilio.com/monitor/debugger
   - Look for failed webhook attempts
   - Check error messages

4. **Enable Twilio request logging** in your server:
   ```typescript
   // In app.ts, add logging middleware
   app.use('/api/sms/webhook', (req, res, next) => {
     console.log('Twilio webhook received:', req.body);
     next();
   });
   ```

### Replies Not Matching Patients

**Issue**: Patient phone number doesn't match database
- Check phone number formatting in database
- Ensure numbers are in +61 format (not 04... format)

**Fix**: Update patient phone numbers to match format:
```sql
-- Convert 04xx numbers to +61 4xx
UPDATE patients
SET contact_phone = '+61' || SUBSTRING(contact_phone FROM 2)
WHERE contact_phone LIKE '04%';
```

## Security Considerations

### Verify Twilio Requests
For production, you should verify that webhook requests are actually from Twilio:

```typescript
import { validateRequest } from 'twilio';

// In your webhook route
const twilioSignature = req.headers['x-twilio-signature'];
const url = `https://your-domain.com${req.originalUrl}`;
const isValid = validateRequest(
  process.env.TWILIO_AUTH_TOKEN!,
  twilioSignature as string,
  url,
  req.body
);

if (!isValid) {
  return res.status(403).send('Invalid request');
}
```

### Rate Limiting
Consider adding rate limiting to prevent abuse:
```typescript
import rateLimit from 'express-rate-limit';

const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
});

app.use('/api/sms/webhook', webhookLimiter);
```

## Future Enhancements

Potential improvements:
- [ ] In-app notification panel to view replies
- [ ] Two-way conversation interface in the web app
- [ ] Auto-reply capabilities for common questions
- [ ] SMS conversation history on patient profile
- [ ] Sentiment analysis on patient replies
- [ ] Keyword-based auto-routing (e.g., "CANCEL" triggers workflow)

## Cost Considerations

**Twilio Pricing** (as of 2024):
- **Inbound SMS**: ~$0.0075 AUD per message
- **Outbound SMS**: ~$0.075 AUD per message
- **Phone number rental**: ~$1.50 AUD per month

**Example monthly cost** (100 patients, 1 reminder each):
- 100 outbound reminders: $7.50 AUD
- ~10 replies: $0.08 AUD
- Phone rental: $1.50 AUD
- **Total**: ~$9 AUD/month

## Support

For Twilio webhook issues, check:
- Twilio Documentation: https://www.twilio.com/docs/sms/twiml
- Twilio Debugger: https://console.twilio.com/monitor/debugger
- Twilio Support: https://support.twilio.com
