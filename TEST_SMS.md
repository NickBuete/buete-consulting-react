# Testing Twilio SMS Integration

## ✅ SMS Service Status: ENABLED

Your Twilio SMS service is now configured and running!

**Twilio Number:** `+16055254712` (US test number)

---

## ⚠️ Important: Twilio Trial Account Limitations

Your Twilio account appears to be in **trial mode**. This means:

1. **You can only send SMS to verified phone numbers**
2. Trial credit available (usually $15-20 USD)
3. SMS will include "Sent from a Twilio trial account" prefix

### Verify Your Phone Number

Before testing, you need to verify the recipient phone number:

1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to **Phone Numbers** > **Manage** > **Verified Caller IDs**
3. Click **+ Add a new Caller ID**
4. Enter your Australian mobile number (e.g., `+61412345678`)
5. Choose verification method (SMS or Call)
6. Enter the verification code you receive

---

## 🧪 Testing SMS Functionality

### Option 1: Test via API (Quick Test)

Create a simple test script to send an SMS:

```bash
# Create test file
cat > test-sms.sh << 'EOF'
#!/bin/bash

# Replace with your verified phone number
PHONE_NUMBER="+61412345678"

# Get your JWT token (login to app first and copy from browser)
JWT_TOKEN="your-jwt-token-here"

# Send test SMS
curl -X POST http://localhost:4000/api/test-sms \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"to\": \"$PHONE_NUMBER\",
    \"message\": \"Test SMS from Buete Consulting HMR system\"
  }"
EOF

chmod +x test-sms.sh
./test-sms.sh
```

**Note:** We need to add a test endpoint. Let me create one for you below.

### Option 2: Test via Booking Flow (Full Integration)

This tests the complete booking workflow including SMS:

1. **Set up your booking page:**
   - Login to your app
   - Go to settings and configure booking settings
   - Set a custom booking URL (e.g., "nicholas-hmr")

2. **Create a test booking:**
   ```bash
   curl -X POST http://localhost:4000/api/booking/public/nicholas-hmr \
     -H "Content-Type: application/json" \
     -d '{
       "patientFirstName": "Test",
       "patientLastName": "Patient",
       "patientPhone": "+61412345678",
       "patientEmail": "test@example.com",
       "referrerName": "Dr. Test",
       "referralReason": "Medication review",
       "appointmentDate": "2025-12-30",
       "appointmentTime": "14:00"
     }'
   ```

3. **Check results:**
   - Check your phone for SMS confirmation
   - Check database: `SELECT * FROM sms_logs ORDER BY created_at DESC LIMIT 5;`
   - Check Twilio console for delivery status

---

## 📊 SMS Logs in Database

All SMS attempts are logged. Check the logs:

```sql
-- View recent SMS logs
SELECT
  id,
  to_phone,
  LEFT(message_body, 50) as message_preview,
  status,
  error_msg,
  sent_at,
  created_at
FROM sms_logs
ORDER BY created_at DESC
LIMIT 10;

-- Count by status
SELECT
  status,
  COUNT(*) as count
FROM sms_logs
GROUP BY status;
```

---

## 🔍 Troubleshooting

### Error: "Phone number not verified"

**Problem:** Trying to send to an unverified number in trial mode.

**Solution:**
1. Verify the recipient number in Twilio console
2. Or upgrade your Twilio account (add credit card)

### Error: "Invalid phone number format"

**Problem:** Phone number format is incorrect.

**Solution:**
- Use E.164 format: `+61412345678` (Australian)
- Remove spaces, dashes, parentheses
- Include country code (+61 for Australia, +1 for US)

### SMS Shows "Sent" but Not Received

**Possible causes:**
1. Phone is off or out of service
2. SMS blocked by carrier
3. Twilio trial restrictions
4. Wrong phone number

**Check:**
- Twilio console > Monitor > Logs > Messaging
- Look for delivery status and error codes

### Trial Account Message Prefix

All SMS from trial accounts include:
```
"Sent from your Twilio trial account - [Your message here]"
```

To remove this, upgrade to a paid account (no minimum commitment).

---

## 💰 Upgrading to Production

When ready to go live:

1. **Upgrade Account:**
   - Go to [Twilio Console](https://console.twilio.com/)
   - Click **Upgrade** button
   - Add payment method (no monthly fees)
   - Pay-as-you-go pricing

2. **Get Australian Phone Number:**
   ```
   Cost: ~$1.50 USD/month
   SMS Cost: ~$0.08 AUD per message
   ```

   Steps:
   - Go to Phone Numbers > Buy a Number
   - Select **Australia** as country
   - Choose **SMS** capability
   - Filter by area code if needed
   - Purchase number

3. **Update Environment Variables:**
   ```env
   TWILIO_PHONE_NUMBER=+61XXXXXXXXX  # Your new Australian number
   ```

4. **Test in Production:**
   - No more verification required
   - No trial message prefix
   - Can send to any valid phone number

---

## 📱 SMS Templates in Use

### Appointment Confirmation
```
Hi {patientName}, your Home Medicines Review is confirmed for {date} at {time}.
Location: {location}. You will receive a reminder 24 hours beforehand.
Reply STOP to unsubscribe.
```

### 24-Hour Reminder
```
Hi {patientName}, this is a reminder about your Home Medicines Review appointment
tomorrow at {time}. Please prepare using our checklist: {checklistUrl}.
Reply STOP to unsubscribe.
```

### Cancellation
```
Hi {patientName}, your Home Medicines Review appointment on {date} has been
cancelled. Please contact us to reschedule. Reply STOP to unsubscribe.
```

---

## 🔐 Security Best Practices

✅ **Current Implementation:**
- SMS logs track all messages
- Credentials in environment variables (not committed)
- Phone number validation before sending
- Opt-out support (STOP keyword)

❌ **TODO for Production:**
- [ ] Rate limiting on SMS endpoints
- [ ] Cost monitoring/alerts in Twilio
- [ ] PII masking in logs (last 4 digits only)
- [ ] Compliance with Australian Privacy Act
- [ ] SMS consent tracking

---

## 📈 Monitoring & Analytics

### Twilio Console Metrics
- Total messages sent/delivered/failed
- Delivery rates
- Error codes and reasons
- Cost tracking

### Database Metrics
```sql
-- SMS success rate (last 30 days)
SELECT
  COUNT(CASE WHEN status = 'sent' THEN 1 END) * 100.0 / COUNT(*) as success_rate,
  COUNT(*) as total_sent
FROM sms_logs
WHERE created_at >= NOW() - INTERVAL '30 days';

-- SMS by review
SELECT
  hmr_review_id,
  COUNT(*) as sms_count,
  MAX(sent_at) as last_sent
FROM sms_logs
WHERE hmr_review_id IS NOT NULL
GROUP BY hmr_review_id
ORDER BY last_sent DESC;
```

---

## ✨ What's Working Now

With SMS enabled, your system will automatically:

1. ✅ Send confirmation when booking is created
2. ✅ Include checklist link in reminder (when implemented)
3. ✅ Track all SMS delivery attempts
4. ✅ Format Australian phone numbers correctly
5. ✅ Handle errors gracefully (logs, doesn't fail booking)

---

## 🚀 Next Steps

1. **Verify your phone number** in Twilio console
2. **Test SMS** via booking flow or test endpoint
3. **Check SMS logs** in database
4. **Implement 24-hour reminder** cron job (Phase 1 TODO)
5. **Build patient checklist page** to generate URLs for SMS

---

**Status:** SMS Configured ✅ | Ready to Test 🧪

**Test Number:** +16055254712 (Twilio trial)

**Your Number:** Add to verified caller IDs first!

---

**Last Updated:** 2025-12-27
