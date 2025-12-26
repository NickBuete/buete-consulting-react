# Phase 1 Setup Guide

This document guides you through setting up the Phase 1 features:
1. Microsoft Calendar Integration (Office 365)
2. SMS Reminder System (Twilio)
3. OpenAI GPT-4 Integration
4. External Booking Page
5. Patient Checklist Page

---

## Prerequisites

- Azure/Microsoft 365 account (from GoDaddy hosting)
- Twilio account for SMS
- OpenAI API account with access to GPT-4

---

## Step 1: Azure AD App Registration (Microsoft Calendar)

### 1.1 Access Azure Portal

1. Go to [https://portal.azure.com](https://portal.azure.com)
2. Sign in with your Microsoft 365 account (from GoDaddy)

### 1.2 Create App Registration

1. In the left sidebar, click **Azure Active Directory** (or search for it)
2. Click **App registrations** in the left menu
3. Click **+ New registration** at the top

### 1.3 Configure App Registration

**Name:** `Buete Consulting HMR Calendar`

**Supported account types:** Select "Accounts in this organizational directory only"

**Redirect URI:**
- Type: **Web**
- URL (Development): `http://localhost:4000/api/auth/microsoft/callback`
- URL (Production): `https://your-api-domain.vercel.app/api/auth/microsoft/callback`

Click **Register**

### 1.4 Note Application (Client) ID

After registration, you'll see the **Overview** page. Copy the following:
- **Application (client) ID** → This is your `MICROSOFT_CLIENT_ID`
- **Directory (tenant) ID** → This is your `MICROSOFT_TENANT_ID`

### 1.5 Create Client Secret

1. In the left menu, click **Certificates & secrets**
2. Click **+ New client secret**
3. Description: `HMR Calendar Secret`
4. Expires: Choose **24 months** (or your preference)
5. Click **Add**
6. **IMPORTANT:** Copy the **Value** immediately (you won't see it again)
   - This is your `MICROSOFT_CLIENT_SECRET`

### 1.6 Configure API Permissions

1. In the left menu, click **API permissions**
2. Click **+ Add a permission**
3. Select **Microsoft Graph**
4. Select **Delegated permissions**
5. Search for and add these permissions:
   - ✅ **Calendars.ReadWrite**
   - ✅ **User.Read**
   - ✅ **offline_access**
6. Click **Add permissions**
7. Click **Grant admin consent for [Your Organization]** (blue button at top)
8. Confirm by clicking **Yes**

---

## Step 2: Twilio Setup (SMS)

### 2.1 Create Twilio Account

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free trial account
3. Verify your phone number
4. Complete the getting started wizard

### 2.2 Get Your Credentials

1. Go to [Twilio Console](https://console.twilio.com/)
2. From the dashboard, copy:
   - **Account SID** → This is your `TWILIO_ACCOUNT_SID`
   - **Auth Token** → This is your `TWILIO_AUTH_TOKEN` (click "Show" to reveal)

### 2.3 Get a Phone Number

1. In the Twilio Console, go to **Phone Numbers** > **Manage** > **Buy a number**
2. Select **Australia** as the country
3. Check **SMS** capability
4. Search and choose a number
5. Click **Buy** (free trial credits will be used)
6. Copy the phone number in E.164 format (e.g., `+61412345678`)
   - This is your `TWILIO_PHONE_NUMBER`

### 2.4 Important Trial Limitations

- Twilio trial can only send SMS to **verified numbers**
- To verify a number:
  1. Go to **Phone Numbers** > **Verified Caller IDs**
  2. Click **+ Add a new Caller ID**
  3. Enter the phone number and verify via SMS code
- To remove this limitation, upgrade your account (add credit card)

---

## Step 3: OpenAI API Setup

### 3.1 Get API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in to your OpenAI account
3. Click **+ Create new secret key**
4. Name: `Buete Consulting HMR`
5. Click **Create secret key**
6. **IMPORTANT:** Copy the key immediately (starts with `sk-`)
   - This is your `OPENAI_API_KEY`

### 3.2 Check Access & Billing

1. Go to [https://platform.openai.com/account/limits](https://platform.openai.com/account/limits)
2. Ensure you have access to **GPT-4 models**
3. Go to [https://platform.openai.com/account/billing/overview](https://platform.openai.com/account/billing/overview)
4. Add a payment method if needed
5. Set up usage limits to avoid unexpected charges

### 3.3 Recommended Model

We recommend using `gpt-4-turbo-preview` which:
- Has a 128K context window
- Cheaper than GPT-4 ($0.01/1K input tokens, $0.03/1K output tokens)
- Faster response times
- Better at following structured instructions

---

## Step 4: Update Environment Variables

### 4.1 Development Environment

1. Navigate to the `server` directory
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file and add your credentials:

```env
# Microsoft Graph API (Office 365 Calendar)
MICROSOFT_CLIENT_ID=your-application-client-id-from-azure
MICROSOFT_CLIENT_SECRET=your-client-secret-from-azure
MICROSOFT_TENANT_ID=your-tenant-id-from-azure
MICROSOFT_REDIRECT_URI=http://localhost:4000/api/auth/microsoft/callback

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+61412345678
SMS_ENABLED=true

# OpenAI API Configuration
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.3

# AI Provider Selection (bedrock or openai)
AI_PROVIDER=openai
```

### 4.2 Production Environment (Vercel)

1. Go to your Vercel project dashboard
2. Click **Settings** > **Environment Variables**
3. Add each variable above (use production redirect URI)

**Production Redirect URI:**
```
https://your-api-domain.vercel.app/api/auth/microsoft/callback
```

**Important:** You'll also need to add this production URL to Azure:
1. Go back to Azure Portal > App registrations > Your app
2. Click **Authentication** in left menu
3. Under **Redirect URIs**, click **+ Add URI**
4. Add: `https://your-api-domain.vercel.app/api/auth/microsoft/callback`
5. Click **Save**

---

## Step 5: Database Migration

Run the Prisma migration to create the new tables:

```bash
cd server
npx prisma migrate dev --name add_calendar_booking_features
```

This will create:
- Updated `users` table with Microsoft OAuth tokens
- `availability_slots` - Pharmacist availability schedule
- `booking_settings` - Booking configuration per pharmacist
- `checklist_tokens` - Secure tokens for patient checklist access
- `sms_logs` - SMS delivery tracking

---

## Step 6: Test the Integrations

### 6.1 Start the Development Server

```bash
cd server
npm run dev
```

### 6.2 Test Microsoft Calendar OAuth

1. Navigate to: `http://localhost:4000/api/auth/microsoft/login`
2. You should be redirected to Microsoft login
3. Sign in with your Office 365 account
4. Grant permissions
5. You should be redirected back with a success message

### 6.3 Test SMS (Development)

The SMS service will log attempts even if delivery fails. Check the server logs.

**Remember:** In Twilio trial mode, you can only send to verified numbers.

### 6.4 Test OpenAI

OpenAI integration is tested when generating HMR reports through the application.

---

## Step 7: Configure Booking Settings (Optional)

Once the app is running, you can configure:

1. **Availability Slots**: Set your weekly availability
   - Day of week (Monday = 0, Sunday = 6)
   - Start/end times (e.g., "09:00" to "17:00")

2. **Booking Settings**:
   - Buffer time before/after appointments
   - Default appointment duration
   - Custom booking URL slug
   - Email templates for confirmations

These can be managed through the admin interface (to be built) or directly via API.

---

## Security Considerations

### Protect Your Secrets

✅ **DO:**
- Keep `.env` file in `.gitignore`
- Use environment variables for all secrets
- Rotate credentials periodically
- Use different credentials for dev/prod

❌ **DON'T:**
- Commit secrets to Git
- Share credentials in Slack/email
- Use production credentials in development
- Hard-code API keys in source code

### Token Storage

- Microsoft refresh tokens are stored encrypted in the database
- Access tokens are refreshed automatically before expiry
- Users can revoke access via Microsoft account settings

### SMS Security

- Patient phone numbers are validated before sending
- SMS logs track all messages for audit
- Rate limiting prevents abuse
- STOP keyword support for opt-out

---

## Troubleshooting

### Microsoft Calendar Issues

**Error: "Invalid redirect URI"**
- Ensure redirect URI in `.env` matches exactly in Azure
- Include http:// or https://
- No trailing slashes

**Error: "AADSTS50011: Reply URL mismatch"**
- Check the redirect URI in Azure matches your callback URL
- Try using "common" as tenant ID if multi-tenant

**Error: "Insufficient privileges"**
- Grant admin consent in Azure API permissions
- Ensure user has calendar access in Office 365

### Twilio Issues

**Error: "Phone number not verified"**
- Add the recipient to verified caller IDs in Twilio console
- Or upgrade account to remove trial restrictions

**Error: "Invalid phone number format"**
- Use E.164 format: +61XXXXXXXXX
- Remove spaces, dashes, parentheses

### OpenAI Issues

**Error: "Insufficient quota"**
- Add payment method to OpenAI account
- Check billing limits
- Ensure you have GPT-4 access

**Error: "Model not found"**
- Use `gpt-4-turbo-preview` or `gpt-4`
- Check model availability in your region

---

## Next Steps

Once setup is complete:

1. ✅ Test Microsoft Calendar OAuth flow
2. ✅ Verify SMS delivery to a test number
3. ✅ Generate a test HMR report with OpenAI
4. ✅ Set up your availability schedule
5. ✅ Create your first booking via the public booking page
6. ✅ Test the patient checklist flow

Refer to [PROJECT_ROADMAP.md](PROJECT_ROADMAP.md) for the full implementation timeline.

---

## Support Resources

- **Microsoft Graph API Docs**: https://learn.microsoft.com/en-us/graph/
- **Twilio SMS Docs**: https://www.twilio.com/docs/sms
- **OpenAI API Docs**: https://platform.openai.com/docs/
- **Prisma Docs**: https://www.prisma.io/docs/

---

## Cost Estimates (Monthly)

### Twilio SMS
- ~$0.08 AUD per SMS
- 100 appointments/month = ~$8 AUD
- (2 SMS per appointment: confirmation + reminder)

### OpenAI GPT-4 Turbo
- Input: $0.01 per 1K tokens
- Output: $0.03 per 1K tokens
- Average HMR report: ~$0.15-0.30
- 100 reports/month = ~$20-30 AUD

### Microsoft Graph API
- **FREE** (included with Office 365 subscription)

### Total Estimated Monthly Cost
- 100 HMR appointments: ~$28-38 AUD
- Very affordable for professional service automation

---

**Last Updated:** 2025-12-27
