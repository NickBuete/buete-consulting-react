# SMS Appointment Reminder System

## Overview
Automated SMS reminder system that sends appointment reminders 24 hours before scheduled HMR appointments.

## Features
- ✅ Automated daily checks for upcoming appointments (runs at 9 AM AEST daily)
- ✅ Sends SMS reminders 24 hours before appointment
- ✅ Tracks which reminders have been sent (prevents duplicates)
- ✅ Logs all SMS attempts with success/failure status
- ✅ Categorizes SMS by type (confirmation, reminder, cancellation)
- ✅ Graceful handling of invalid phone numbers
- ✅ Manual trigger capability for testing

## Database Changes

### HmrReview Table
Added `reminder_sent_at` field to track when reminders were sent:
```sql
ALTER TABLE "public"."hmr_reviews" ADD COLUMN "reminder_sent_at" TIMESTAMP(6);
```

### SmsLog Table
Added `message_type` field to categorize SMS messages:
```sql
ALTER TABLE "public"."sms_logs" ADD COLUMN "message_type" VARCHAR(50) NOT NULL DEFAULT 'general';
CREATE INDEX "sms_logs_message_type_idx" ON "public"."sms_logs"("message_type");
```

**Message Types:**
- `confirmation` - Appointment booking/reschedule confirmation
- `reminder` - 24-hour appointment reminder
- `cancellation` - Appointment cancellation notice
- `general` - General purpose SMS

## Architecture

### Service Layer
1. **appointmentReminderService.ts**
   - `processAppointmentReminders()` - Main function to process all pending reminders
   - `sendManualReminder(reviewId)` - Manually trigger reminder for specific appointment
   - Queries for appointments 23-25 hours ahead
   - Sends SMS and logs results
   - Updates `reminderSentAt` timestamp

2. **cronScheduler.ts**
   - Manages all scheduled tasks
   - Runs appointment reminders daily at 9:00 AM AEST
   - Graceful start/stop during server lifecycle

3. **bookingNotificationService.ts** (Updated)
   - Now uses `messageType` field for all SMS logs
   - Categorizes confirmation messages properly

### Reminder Logic
The system finds appointments that need reminders by:
1. Checking `scheduledAt` between 23-25 hours from now (24h window with 1h buffer)
2. Filtering where `reminderSentAt` is null (not already sent)
3. Ensuring patient has a valid phone number
4. Validating phone number format (Australian +61)

### Twilio Integration
Uses existing `twilioService.sendAppointmentReminder()` which includes:
- Patient name (first name only)
- Appointment date and time
- Checklist URL (if available)
- Standard "Reply STOP to unsubscribe" footer

## Configuration

### Environment Variables
Required in `.env`:
```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+61xxxxxxxxx
SMS_ENABLED=true

# Application URL (for checklist links)
FRONTEND_URL=https://yourdomain.com
```

### Cron Schedule
Default: `0 9 * * *` (9:00 AM daily, Australia/Melbourne timezone)

To change the schedule, edit `cronScheduler.ts`:
```typescript
const schedule = '0 9 * * *'; // Modify as needed
```

## Testing

### Manual Testing
You can manually trigger reminders via API or directly:

```typescript
import { sendManualReminder } from './services/notifications/appointmentReminderService';

// Send reminder for specific review
const result = await sendManualReminder(reviewId);
console.log(result);
```

### Using the Scheduler Trigger
```typescript
import { triggerJob } from './services/scheduler/cronScheduler';

// Manually run the reminder job
await triggerJob('appointmentReminders');
```

### Test Checklist
- [ ] Create a test HMR appointment scheduled for tomorrow
- [ ] Ensure patient has valid Australian phone number
- [ ] Wait for 9 AM or manually trigger job
- [ ] Verify SMS received
- [ ] Check `sms_logs` table for entry with `message_type='reminder'`
- [ ] Verify `reminder_sent_at` timestamp updated on `hmr_reviews`
- [ ] Confirm no duplicate reminders sent

### Database Queries for Monitoring

**Check upcoming appointments needing reminders:**
```sql
SELECT
  hr.id,
  p.first_name,
  p.contact_phone,
  hr.scheduled_at,
  hr.reminder_sent_at
FROM hmr_reviews hr
JOIN patients p ON hr.patient_id = p.id
WHERE
  hr.scheduled_at BETWEEN NOW() + INTERVAL '23 hours' AND NOW() + INTERVAL '25 hours'
  AND hr.reminder_sent_at IS NULL
  AND p.contact_phone IS NOT NULL;
```

**Check reminder SMS logs:**
```sql
SELECT
  id,
  hmr_review_id,
  to_phone,
  message_type,
  status,
  sent_at,
  error_msg
FROM sms_logs
WHERE message_type = 'reminder'
ORDER BY created_at DESC
LIMIT 20;
```

**Check reminder statistics:**
```sql
SELECT
  DATE(sent_at) as date,
  status,
  COUNT(*) as count
FROM sms_logs
WHERE message_type = 'reminder'
GROUP BY DATE(sent_at), status
ORDER BY date DESC;
```

## Troubleshooting

### Reminders Not Sending

1. **Check SMS is enabled**
   ```bash
   echo $SMS_ENABLED  # Should be 'true'
   ```

2. **Check Twilio credentials**
   ```bash
   echo $TWILIO_ACCOUNT_SID
   echo $TWILIO_AUTH_TOKEN
   echo $TWILIO_PHONE_NUMBER
   ```

3. **Check scheduler is running**
   - Look for log message: "Scheduled jobs initialized and running"
   - Check server startup logs

4. **Check appointment timing**
   - Appointment must be 23-25 hours ahead
   - `reminder_sent_at` must be null
   - Patient must have valid phone number

5. **Check phone number format**
   - Must be Australian format: +61xxxxxxxxx
   - Invalid formats will be skipped with warning log

### Duplicate Reminders
The system prevents duplicates by:
- Setting `reminder_sent_at` after successful send
- Only selecting appointments where `reminder_sent_at IS NULL`

If duplicates occur, check database constraints and logs.

### Failed SMS
Check `sms_logs` table for `status='failed'` and review `error_msg`:
- Invalid phone number format
- Twilio API errors (credentials, account limits)
- Network connectivity issues

## Logs
All operations are logged with context:

**Successful reminder:**
```
INFO: Running scheduled appointment reminder job
INFO: Found reviews needing appointment reminders {count: 5}
INFO: Appointment reminder sent successfully {reviewId: 123, phone: "+61412345678"}
INFO: Completed scheduled appointment reminder job {total: 5, sent: 5, failed: 0}
```

**Failed reminder:**
```
ERROR: Failed to send appointment reminder {reviewId: 123, error: "Invalid phone number"}
```

## Future Enhancements

Potential improvements:
- [ ] Configurable reminder timing (24h, 48h, custom)
- [ ] Multiple reminder schedule (e.g., 7 days + 1 day before)
- [ ] SMS template customization per pharmacist
- [ ] Reminder preferences in patient profile
- [ ] Retry logic for failed SMS
- [ ] SMS delivery status webhooks
- [ ] Admin dashboard for reminder statistics
- [ ] A/B testing different reminder messages

## Migration History
- **20251229000000_add_sms_reminder_tracking** - Added `reminder_sent_at` to `hmr_reviews` and `message_type` to `sms_logs`
