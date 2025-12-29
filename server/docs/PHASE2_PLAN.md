# Phase 2: Frontend Components Implementation Plan

**Status:** 🚀 READY TO START
**Started:** 2025-12-27
**Priority:** HIGH - User-facing features to complete Phase 1 backend

---

## Overview

Phase 2 focuses on building the frontend components that connect to the completed Phase 1 backend infrastructure. These components will enable users to interact with the calendar, booking, SMS, and AI services.

---

## Prerequisites ✅

All Phase 1 backend services are complete and verified:
- ✅ Database schema with all required tables
- ✅ Microsoft Graph OAuth service operational
- ✅ Twilio SMS service initialized
- ✅ OpenAI GPT-4 service initialized
- ✅ Booking API endpoints functional
- ✅ Environment variables configured
- ✅ Server running on port 4000

---

## Implementation Tasks

### 1. Public Booking Page 🎯 **HIGHEST PRIORITY**

**Route:** `/book/:bookingUrl`
**Description:** Public-facing page for external referrers to book HMR appointments

#### Components to Build

##### 1.1 BookingPage Container
**File:** `src/pages/booking/index.tsx`
- Fetch pharmacist availability by booking URL
- Handle loading states
- Display error for invalid booking URLs
- Route parameter extraction

##### 1.2 BookingForm Component
**File:** `src/components/booking/BookingForm.tsx`
- **Patient Information Section**
  - First name (required)
  - Last name (required)
  - Phone number (required, Australian format validation)
  - Email (optional)
  - Date of birth (optional)
  - Address fields (optional)

- **Referrer Information Section**
  - Referrer name (required)
  - Referrer email (optional)
  - Referrer phone (optional)
  - Clinic/Organisation (optional)

- **Appointment Details Section**
  - Date picker (shows available dates)
  - Time slot selector (filtered by availability)
  - Reason for referral (textarea)
  - Additional notes (textarea, optional)

- **Form Validation**
  - Use Zod schema validation
  - Real-time field validation
  - Display error messages
  - Prevent submission if invalid

##### 1.3 AvailabilityCalendar Component
**File:** `src/components/booking/AvailabilityCalendar.tsx`
- Display month view calendar
- Highlight available dates (based on availability slots passed from BookingPage)
- Disable past dates
- Disable unavailable dates
- Handle date selection

##### 1.4 TimeSlotPicker Component
**File:** `src/components/booking/TimeSlotPicker.tsx`
- Display available time slots for selected date
- Calculate slots based on:
  - Pharmacist availability slots (day of week + time ranges)
  - Buffer time before/after
  - Default appointment duration
  - Existing bookings (check for conflicts, show as Busy)
- Show slot as buttons/cards
- Visual indication of selected slot
- Handle timezone (Australia/Sydney, DST-safe)

##### 1.5 BookingConfirmation Component
**File:** `src/components/booking/BookingConfirmation.tsx`
- Success message
- Booking details summary
  - Patient name
  - Appointment date/time
  - Pharmacist name
  - Location (if provided)
- Next steps instructions
- Print button (optional)

#### API Integration

**Endpoints to Use:**
- `GET /api/booking/public/:bookingUrl` - Get pharmacist info, booking settings, availability, and busy slots
- `POST /api/booking/public/:bookingUrl` - Submit booking

**Response Handling:**
- Success: Redirect to confirmation page
- Error: Display error message (booking URL not found, time slot taken, etc.)
- Loading: Show skeleton/spinner

#### Styling Requirements
- Mobile-first responsive design
- Use shadcn/ui components (Calendar, Button, Input, Label, Card, etc.)
- Tailwind CSS for layout
- Accessibility: Keyboard navigation, ARIA labels, screen reader support

#### User Flow
1. User visits `/book/pharmacist-name`
2. Calendar shows next 30 days, available dates highlighted
3. User selects a date
4. Time slots for that date appear
5. User selects a time slot
6. Form appears with patient and referrer details
7. User fills form and submits
8. Confirmation page shows booking details
9. SMS sent to patient (backend handles this)

---

### 2. Admin Booking Management 📋

**Route:** `/admin/booking`
**Description:** Pharmacist dashboard for managing availability and booking settings

#### Components to Build

##### 2.1 BookingDashboard Container
**File:** `src/pages/admin/booking/BookingDashboard.tsx`
- Tabs for Availability, Settings, SMS Logs
- Protected route (requires authentication)
- Fetch user's booking settings and availability slots

##### 2.2 AvailabilityEditor Component
**File:** `src/components/admin/AvailabilityEditor.tsx`
- **Weekly Schedule Grid**
  - 7 rows (Monday - Sunday)
  - Each row shows time slots for that day
  - Add new slot button per day
  - Edit existing slot (pencil icon)
  - Delete slot (trash icon)
  - Toggle slot availability (enable/disable switch)

- **Add/Edit Slot Modal**
  - Day of week (dropdown or pre-filled if adding from row)
  - Start time (time picker, 30min intervals)
  - End time (time picker, 30min intervals)
  - Validate end time > start time
  - Save button

##### 2.3 BookingSettingsForm Component
**File:** `src/components/admin/BookingSettingsForm.tsx`
- **General Settings**
  - Buffer time before (number input, minutes)
  - Buffer time after (number input, minutes)
  - Default appointment duration (number input, minutes)
  - Allow public booking (toggle)
  - Require approval (toggle, if public booking enabled)

- **Custom Booking URL**
  - Text input for custom slug
  - Preview: `yoursite.com/book/{slug}`
  - Validation: alphanumeric, hyphens, lowercase
  - Check uniqueness via API

- **Email Templates** (optional for Phase 2)
  - Confirmation email text (textarea)
  - Reminder email text (textarea)

- Save button at bottom

##### 2.4 CalendarConnectionCard Component
**File:** `src/components/admin/CalendarConnectionCard.tsx`
- **Connection Status**
  - Icon (green checkmark if connected, red X if not)
  - Status text ("Connected" or "Not Connected")
  - Connected email (if connected)
  - Last sync timestamp (if connected)

- **Actions**
  - "Connect to Microsoft" button (if not connected)
    - Redirects to `/api/auth/microsoft/login`
  - "Disconnect" button (if connected)
    - Shows confirmation dialog
    - Calls `POST /api/auth/microsoft/disconnect`
  - Calendar sync toggle (if connected)
    - Enable/disable automatic calendar sync

##### 2.5 SmsLogsTable Component
**File:** `src/components/admin/SmsLogsTable.tsx`
- **Table Columns**
  - Date/Time sent
  - Phone number
  - Message preview (first 50 chars)
  - Status (pending/sent/failed badge)
  - HMR Review ID (link to review if applicable)
  - Actions (view full message button)

- **Filters**
  - Status filter (all/sent/failed)
  - Date range filter
  - Search by phone number

- **Pagination**
  - Show 20 per page
  - Page navigation

#### API Integration

**Endpoints to Use:**
- `GET /api/booking/availability` - List user's availability slots
- `POST /api/booking/availability` - Create new slot
- `PATCH /api/booking/availability/:id` - Update slot
- `DELETE /api/booking/availability/:id` - Delete slot
- `GET /api/booking/settings` - Get user's booking settings
- `PATCH /api/booking/settings` - Update settings
- `GET /api/auth/microsoft/status` - Check calendar connection
- `POST /api/auth/microsoft/disconnect` - Disconnect calendar

---

### 3. Patient Checklist Page ✅

**Route:** `/checklist/:token`
**Description:** Public page for patients to view pre-appointment instructions

#### Components to Build

##### 3.1 ChecklistPage Container
**File:** `src/pages/checklist/ChecklistPage.tsx`
- Extract token from URL params
- Validate token via API (check expiry)
- Fetch appointment details if token valid
- Show error page if token expired/invalid

##### 3.2 ChecklistContent Component
**File:** `src/components/checklist/ChecklistContent.tsx`
- **Header Section**
  - Title: "Pre-Appointment Checklist"
  - Pharmacist name
  - Appointment date/time
  - Location/instructions

- **What to Prepare Section**
  - List of current medications (names, doses)
  - Questions or concerns about medications
  - Medical history summary
  - Recent pathology results

- **What to Bring Section**
  - All medication bottles/boxes
  - List of over-the-counter medications
  - List of supplements/vitamins
  - Pharmacy prescription bags

- **What to Expect Section**
  - Interview duration (~45 minutes)
  - Topics that will be covered
  - Consent form information
  - Follow-up process

- **Confirmation Section**
  - Checkbox: "I have read and understand the checklist"
  - "Confirm" button
  - On confirmation, mark token as used in database

##### 3.3 ExpiredTokenPage Component
**File:** `src/components/checklist/ExpiredTokenPage.tsx`
- Error message
- Instructions to contact pharmacist

#### API Integration

**New Endpoints Needed (Backend TODO):**
- `GET /api/checklist/:token` - Validate token and fetch appointment details
- `POST /api/checklist/:token/confirm` - Mark token as used

#### Styling
- Clean, minimal design
- Large, readable text (mobile-friendly)
- Print-friendly styling (`@media print`)
- No authentication required

---

### 4. AI Report Generation UI 🤖

**Location:** Integrate into existing HMR detail page
**File:** `src/pages/hmr/detail.tsx` (modify existing)

#### Components to Build

##### 4.1 AiGenerateButton Component
**File:** `src/components/ai/AiGenerateButton.tsx`
- Button with wand/sparkles icon
- Label: "Generate with AI"
- Positioned near report editor
- Opens modal on click

##### 4.2 AiGenerationModal Component
**File:** `src/components/ai/AiGenerationModal.tsx`
- **Header**
  - Title: "AI Report Generation"
  - Close button

- **Section Selection**
  - Radio buttons or tabs:
    - Assessment Summary
    - Recommendations
    - Patient Education

- **Model Selection** (optional if multiple providers)
  - Dropdown: OpenAI GPT-4, etc.

- **Context Preview**
  - Show patient name, medications count, conditions
  - Confirm data will be sent to AI

- **Generate Button**
  - Loading state with spinner
  - Disabled during generation
  - Show progress message ("Generating...")

##### 4.3 AiReportPreview Component
**File:** `src/components/ai/AiReportPreview.tsx`
- **Generated Content Display**
  - Markdown or rich text preview
  - Scrollable if long

- **Actions**
  - "Insert into Editor" button
  - "Regenerate" button
  - "Edit Before Inserting" (opens in textarea)
  - "Cancel" button

- **Metadata**
  - Token usage (input tokens, output tokens)
  - Estimated cost
  - Generation timestamp
  - Model used

##### 4.4 AiGenerationHistory Component
**File:** `src/components/ai/AiGenerationHistory.tsx`
- List of previous generations for this review
- Each entry shows:
  - Timestamp
  - Section type
  - Model used
  - Token count
  - Preview button (view generated text)

#### API Integration

**Endpoints to Use:**
- `POST /api/ai/assessment-summary` - Generate assessment
- `POST /api/ai/recommendations` - Generate recommendations
- `POST /api/ai/patient-education` - Generate education content

**Request Body Example:**
```json
{
  "reviewId": 123,
  "patientContext": {
    "age": 75,
    "medications": [...],
    "conditions": [...]
  }
}
```

**Response:**
```json
{
  "content": "Generated markdown/HTML content...",
  "tokensUsed": {
    "prompt": 1500,
    "completion": 800
  },
  "model": "gpt-4-turbo-preview",
  "cost": 0.015
}
```

#### Integration Points
- Add button to HMR review detail page
- Insert generated content into TipTap editor
- Store generation in audit trail table

---

### 5. Microsoft Calendar Connection UI 🗓️

**Route:** `/settings/integrations`
**Description:** User settings page for calendar and other integrations

#### Components to Build

##### 5.1 IntegrationsPage Container
**File:** `src/pages/settings/IntegrationsPage.tsx`
- Protected route
- Fetch user's integration status
- Display integration cards

##### 5.2 CalendarIntegrationCard Component
**File:** `src/components/settings/CalendarIntegrationCard.tsx`
- **Header**
  - Microsoft 365 logo
  - "Calendar Integration" title

- **Status Section**
  - Connection status indicator (badge)
  - Connected email (if connected)
  - Last sync timestamp (if connected)

- **Actions**
  - If NOT connected:
    - "Connect to Microsoft" button
    - On click: redirect to `/api/auth/microsoft/login`

  - If connected:
    - "Disconnect" button with confirmation dialog
    - Calendar sync toggle (enable/disable auto-sync)
    - "Sync Now" button (manual sync)

- **Settings** (if connected)
  - Auto-sync toggle
  - Default calendar dropdown (if multiple calendars)

##### 5.3 OAuthCallbackHandler Component
**File:** `src/components/auth/OAuthCallbackHandler.tsx`
- Handle redirect from Microsoft OAuth
- Parse query params for success/error
- Show success toast if connected
- Show error toast if failed
- Redirect to integrations page

#### API Integration

**Endpoints to Use:**
- `GET /api/auth/microsoft/status` - Check connection status
- `GET /api/auth/microsoft/login` - Initiate OAuth flow (redirect)
- `GET /api/auth/microsoft/callback` - OAuth callback (backend handles)
- `POST /api/auth/microsoft/disconnect` - Disconnect account

#### User Flow
1. User navigates to `/settings/integrations`
2. Sees "Not Connected" status
3. Clicks "Connect to Microsoft"
4. Redirected to Microsoft login page
5. Logs in and grants permissions
6. Redirected back to callback URL
7. Backend saves tokens
8. User redirected to integrations page
9. Sees "Connected" status with email

---

### 6. Automated Reminder Scheduling ⏰

**Description:** Background job to send SMS reminders 24 hours before appointments

#### Backend Task (Node.js Cron Job)

##### 6.1 Create Reminder Service
**File:** `server/src/services/reminder/reminderService.ts`
- Check for appointments scheduled 24 hours from now
- For each appointment:
  - Generate secure checklist token
  - Create SMS message with checklist link
  - Send via Twilio service
  - Log SMS in sms_logs table

##### 6.2 Set Up Cron Job
**File:** `server/src/jobs/appointmentReminders.ts`
- Use `node-cron` package
- Schedule: Run daily at 9am (or hourly)
- Call reminder service

**Example:**
```typescript
import cron from 'node-cron';
import { sendAppointmentReminders } from '../services/reminder/reminderService';

// Run daily at 9am
cron.schedule('0 9 * * *', async () => {
  console.log('Running appointment reminder job...');
  await sendAppointmentReminders();
});
```

##### 6.3 Manual Reminder Trigger (Optional)
**Endpoint:** `POST /api/booking/:reviewId/send-reminder`
- Manually trigger reminder for specific appointment
- Useful for testing and resending

#### Frontend Component (Optional)

##### 6.4 ReminderSettings Component
**File:** `src/components/admin/ReminderSettings.tsx`
- Toggle reminder notifications on/off
- Configure reminder timing (24hr, 48hr, custom)
- Test reminder button (send test SMS)

---

## Implementation Priority

### Sprint 1 (Week 1)
1. ✅ Public Booking Page (Components 1.1-1.5)
2. ✅ Patient Checklist Page (Components 3.1-3.3)
3. ✅ Checklist token generation backend endpoint

### Sprint 2 (Week 2)
4. ✅ Admin Booking Management (Components 2.1-2.3)
5. ✅ Calendar Connection UI (Components 5.1-5.3)

### Sprint 3 (Week 3)
6. ✅ AI Report Generation UI (Components 4.1-4.4)
7. ✅ SMS Logs Table (Component 2.5)

### Sprint 4 (Week 4)
8. ✅ Automated Reminder Scheduling (Component 6.1-6.3)
9. ✅ Testing and bug fixes
10. ✅ Documentation updates

---

## Testing Checklist

### Public Booking Page
- [ ] Can access page with valid booking URL
- [ ] Shows error for invalid booking URL
- [ ] Calendar shows available dates correctly
- [ ] Time slots filter by selected date
- [ ] Form validation works
- [ ] Booking submission creates HMR review
- [ ] SMS confirmation sent (if enabled)
- [ ] Calendar event created (if sync enabled)
- [ ] Mobile responsive

### Admin Booking Management
- [ ] Availability slots load correctly
- [ ] Can add new availability slot
- [ ] Can edit existing slot
- [ ] Can delete slot
- [ ] Settings save correctly
- [ ] Custom booking URL validation works
- [ ] Calendar connection status accurate
- [ ] SMS logs display correctly

### Patient Checklist
- [ ] Valid token shows checklist
- [ ] Expired token shows error
- [ ] Confirmation button marks token as used
- [ ] Mobile friendly layout
- [ ] Print styling works

### AI Generation
- [ ] Button appears on HMR detail page
- [ ] Modal opens correctly
- [ ] Content generates successfully
- [ ] Generated content can be inserted into editor
- [ ] Token usage displays correctly
- [ ] Error handling for API failures

### Calendar Connection
- [ ] OAuth flow redirects correctly
- [ ] Successful connection saves tokens
- [ ] Disconnect removes tokens
- [ ] Status updates in real-time
- [ ] Error messages display for failures

### Automated Reminders
- [ ] Cron job runs on schedule
- [ ] Reminders sent 24hrs before
- [ ] Checklist link is valid
- [ ] SMS delivery logged
- [ ] No duplicate reminders sent

---

## Success Metrics

### User Engagement
- [ ] At least 1 external booking received per week
- [ ] 80%+ of patients confirm checklist before appointment
- [ ] AI generation used for 50%+ of reports

### Technical Performance
- [ ] Public booking page loads < 2 seconds
- [ ] Form submission response < 1 second
- [ ] AI generation completes < 10 seconds
- [ ] SMS delivery success rate > 95%
- [ ] Calendar sync success rate > 95%

### User Satisfaction
- [ ] Zero critical bugs in production
- [ ] Positive feedback from referrers on booking experience
- [ ] Pharmacist reports time saved with AI generation

---

## Dependencies

### NPM Packages (Frontend)
```bash
# If not already installed
npm install date-fns
npm install react-day-picker
npm install zod
```

### NPM Packages (Backend)
```bash
cd server
npm install node-cron
```

### Environment Variables
All required environment variables already configured in Phase 1.

---

## Notes

- All backend APIs are ready and tested
- Frontend components should use existing patterns from HMR pages
- Reuse shadcn/ui components where possible
- Follow existing TypeScript and ESLint conventions
- Mobile-first design is critical for patient-facing pages
- Accessibility is important for public booking and checklist pages

---

**Last Updated:** 2025-12-27
**Next Review:** After Sprint 1 completion
