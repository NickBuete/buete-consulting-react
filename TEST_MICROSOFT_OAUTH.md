# Testing Microsoft OAuth Calendar Integration

## ✅ Setup Complete!

Your Azure AD app is configured correctly with:
- **Application ID:** `fb6b4281-e3e4-4de3-a3aa-b357de77a7cb`
- **Tenant ID:** `9fac9def-8968-4170-83b4-17530aae6275`
- **Permissions:** Calendars.ReadWrite, User.Read, offline_access
- **Admin Consent:** Granted ✓

## 🧪 Test the OAuth Flow

### Step 1: Start the Server (Already Running ✓)

Your development server is running on `http://localhost:4000`

### Step 2: Log into Your App

1. Open your frontend: `http://localhost:3000`
2. Log in with your user account
3. This will give you a JWT token for authentication

### Step 3: Test Microsoft Calendar Connection

**Option A: Using Browser (Easiest)**

1. While logged into your app, visit:
   ```
   http://localhost:4000/api/auth/microsoft/login
   ```

2. You'll be redirected to Microsoft login
3. Sign in with your Office 365 account
4. Grant permissions
5. You'll be redirected back to the callback URL
6. You should see a success page showing your connected account

**Option B: Using curl (For API Testing)**

```bash
# First, get your JWT token from the frontend
# (Check browser dev tools > Application > Local Storage)

# Then test the status endpoint
curl http://localhost:4000/api/auth/microsoft/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# You should see:
# {"connected":false,"expired":false,"email":null,"expiresAt":null}
```

### Step 4: Verify Calendar Sync

After connecting, create a test booking:

```bash
# Test public booking endpoint
curl -X POST http://localhost:4000/api/booking/public/YOUR_BOOKING_URL \
  -H "Content-Type: application/json" \
  -d '{
    "patientFirstName": "Test",
    "patientLastName": "Patient",
    "patientPhone": "0412345678",
    "patientEmail": "test@example.com",
    "referrerName": "Dr. Test",
    "referralReason": "Test booking",
    "appointmentDate": "2025-12-28",
    "appointmentTime": "14:00"
  }'
```

Check your Office 365 calendar - you should see a new event!

## 🔍 What to Check

### In Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click your app: "Buete Consulting HMR Calendar"
4. Check **API permissions** - should show:
   - ✓ Calendars.ReadWrite (Delegated)
   - ✓ User.Read (Delegated)
   - ✓ offline_access (Delegated)
   - Green checkmark "Granted for [Your Organization]"

### In Database

After successful OAuth, check your users table:

```sql
SELECT
  id,
  username,
  calendar_sync_enabled,
  microsoft_email,
  microsoft_token_expiry
FROM users
WHERE id = YOUR_USER_ID;
```

You should see:
- `calendar_sync_enabled: true`
- `microsoft_email: your-office365-email@domain.com`
- `microsoft_token_expiry: future timestamp`

## 🐛 Troubleshooting

### Error: "AADSTS50011: Reply URL mismatch"

**Problem:** The redirect URI doesn't match what's configured in Azure.

**Solution:**
1. Go to Azure Portal > Your app > **Authentication**
2. Under "Redirect URIs", add:
   - `http://localhost:4000/api/auth/microsoft/callback` (for dev)
   - `https://your-api.vercel.app/api/auth/microsoft/callback` (for prod)
3. Click **Save**

### Error: "AADSTS65001: Consent required"

**Problem:** Admin consent not granted or expired.

**Solution:**
1. Go to Azure Portal > Your app > **API permissions**
2. Click "Grant admin consent for [Your Organization]"
3. Confirm with "Yes"

### Error: "Invalid client secret"

**Problem:** The client secret is incorrect or expired.

**Solution:**
1. Go to Azure Portal > Your app > **Certificates & secrets**
2. Check if your secret is expired
3. If expired, create a new secret
4. Update `.env` and `.env.production` with the new secret

### Calendar Events Not Syncing

**Checklist:**
- [ ] User has connected their Microsoft account
- [ ] `calendar_sync_enabled` is `true` in database
- [ ] Token hasn't expired (check `microsoft_token_expiry`)
- [ ] API permissions include `Calendars.ReadWrite`
- [ ] User's Office 365 account has calendar access

## 📊 Server Logs

Check the server output for logs:

```bash
# Server should show:
{"level":"info","msg":"Microsoft calendar authorized for user X"}
{"level":"info","msg":"Calendar event created: event-id-here"}
```

## ✨ Success Indicators

You'll know it's working when:

1. ✓ OAuth redirects to Microsoft login
2. ✓ Callback returns success page
3. ✓ Database shows `calendar_sync_enabled: true`
4. ✓ New bookings create calendar events
5. ✓ Events appear in Office 365 calendar
6. ✓ No errors in server logs

## 🎯 Next Steps

Once calendar integration works:

1. **Test Booking Flow:**
   - Set up your availability slots
   - Configure booking settings
   - Create a custom booking URL
   - Test end-to-end booking

2. **Set Up Twilio SMS:**
   - Follow [PHASE1_SETUP.md](PHASE1_SETUP.md) step 2
   - Test SMS confirmations

3. **Add OpenAI API Key:**
   - Add your key to `.env`
   - Test HMR report generation

4. **Build Frontend Components:**
   - Public booking page
   - Admin settings UI
   - Calendar connection status

---

**Current Status:**
- ✅ Azure AD configured
- ✅ Backend ready
- ✅ Database migrated
- 🔄 Ready to test!

**Last Updated:** 2025-12-27
