# What's Next - Implementation Guide

## 🎉 What We've Built So Far

### ✅ Phase 1 Backend (Complete!)

All backend infrastructure for Phase 1 is complete and ready to use:

1. **Microsoft Calendar Integration** - Full OAuth2 flow with Office 365
2. **SMS System** - Twilio integration for reminders and confirmations
3. **OpenAI GPT-4** - AI-assisted HMR report generation
4. **Booking API** - Public booking system with calendar sync
5. **Database Schema** - All new tables created and migrated

### 📚 Documentation Created

- **[PROJECT_ROADMAP.md](PROJECT_ROADMAP.md)** - Full 4-phase roadmap
- **[PHASE1_SETUP.md](PHASE1_SETUP.md)** - Detailed setup instructions
- **[PHASE1_IMPLEMENTATION_SUMMARY.md](PHASE1_IMPLEMENTATION_SUMMARY.md)** - What's been built
- **[TEST_MICROSOFT_OAUTH.md](TEST_MICROSOFT_OAUTH.md)** - Testing guide
- **[server/MIGRATION_GUIDE.md](server/MIGRATION_GUIDE.md)** - Database migration guide

---

## 🚀 Immediate Next Steps (This Week)

### 1. Complete Service Setup

#### Azure AD (Done! ✓)
- ✅ App registered
- ✅ Permissions granted
- ✅ Client secret created
- ✅ Credentials in `.env` files

**Next:** Add production redirect URI when you deploy to Vercel

#### Twilio SMS (Optional - Can Do Later)
Follow **[PHASE1_SETUP.md](PHASE1_SETUP.md) Section 2**

Cost: ~$16/month for 100 appointments

#### OpenAI GPT-4 (Quick)
1. Add your API key to `.env`:
   ```env
   OPENAI_API_KEY=sk-your-actual-key-here
   ```
2. Test in HMR workflow

Cost: ~$20-30/month for 100 reports

### 2. Test Backend APIs

Your server is running on `http://localhost:4000`. Test these endpoints:

#### Health Check
```bash
curl http://localhost:4000/api/health
```

#### Microsoft OAuth Flow
While logged into your app:
```
http://localhost:4000/api/auth/microsoft/login
```

#### Booking Settings
```bash
curl http://localhost:4000/api/booking/settings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

See **[TEST_MICROSOFT_OAUTH.md](TEST_MICROSOFT_OAUTH.md)** for complete testing guide.

### 3. Build Frontend Components

Now we need to build the UI for Phase 1 features:

#### Priority 1: Public Booking Page

**Location:** `src/pages/booking/PublicBooking.tsx`

**What it needs:**
- Form for patient/referrer details
- Calendar view showing available dates
- Time slot picker
- Booking confirmation message
- Mobile-responsive design

**Route:** `/book/:bookingUrl`

**API Integration:**
- `GET /api/booking/public/:bookingUrl` - Get availability
- `POST /api/booking/public/:bookingUrl` - Submit booking

#### Priority 2: Admin Booking Settings

**Location:** `src/pages/admin/BookingSettings.tsx`

**What it needs:**
- Availability slot editor (weekly schedule)
- Booking settings form
- Custom URL configuration
- Calendar connection status
- SMS/Email template editor

**Route:** `/settings/booking`

**API Integration:**
- `GET /api/booking/settings`
- `PATCH /api/booking/settings`
- `GET/POST/PATCH/DELETE /api/booking/availability`

#### Priority 3: Calendar Connection UI

**Location:** `src/pages/settings/Integrations.tsx`

**What it needs:**
- "Connect Microsoft Calendar" button
- Connection status indicator
- Disconnect button
- Last sync time
- Calendar event preview

**API Integration:**
- `GET /api/auth/microsoft/status`
- `GET /api/auth/microsoft/login` (redirect)
- `POST /api/auth/microsoft/disconnect`

#### Priority 4: AI Report Generation

**Location:** Update `src/pages/hmr/detail.tsx`

**What to add:**
- "Generate Report with AI" button
- Model selector (OpenAI vs Bedrock)
- Loading state with progress
- Report preview/edit
- Token usage display
- Save generated report

**API Integration:**
- Create new endpoint in `aiRoutes.ts` for HMR report generation
- Call OpenAI service with HMR review data

#### Priority 5: Patient Checklist

**Location:** `src/pages/checklist/PatientChecklist.tsx`

**What it needs:**
- Public page (no login required)
- Pre-appointment instructions
- Medication preparation guide
- What to bring checklist
- Confirmation button

**Route:** `/checklist/:token`

**Backend TODO:**
- Create endpoint to generate checklist token
- Create endpoint to display checklist
- Link token in SMS reminders

---

## 📅 Recommended Timeline

### Week 1 (Current Week)
- [ ] Add Twilio credentials (optional)
- [ ] Add OpenAI API key
- [ ] Test Microsoft OAuth flow
- [ ] Build public booking page UI
- [ ] Build admin booking settings UI

### Week 2
- [ ] Build calendar connection UI
- [ ] Integrate AI report generation
- [ ] Build patient checklist page
- [ ] End-to-end testing

### Week 3
- [ ] Add automated SMS reminders (cron job)
- [ ] Add email notifications
- [ ] Create Gardens Pharmacy case study
- [ ] Polish and bug fixes

### Week 4
- [ ] Deploy to production
- [ ] Test in production
- [ ] Set up monitoring
- [ ] User acceptance testing

---

## 🎨 Design Guidelines

### Use Existing Components
You already have shadcn/ui components installed. Use them:

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Label,
  Select,
  Tabs,
} from '@/components/ui';
```

### Follow Existing Patterns
Look at these files for reference:
- **[src/pages/hmr/index.tsx](src/pages/hmr/index.tsx)** - Dashboard layout
- **[src/pages/pharmacy-tools/index.tsx](src/pages/pharmacy-tools/index.tsx)** - Form layouts
- **[src/components/crud/AddPatientDialog.tsx](src/components/crud/AddPatientDialog.tsx)** - Form validation

### Mobile-First
The booking page will be used by GPs and referrers on mobile:
- Responsive grid layouts
- Touch-friendly buttons (min 44px height)
- Clear, large text
- Simple navigation

### Color Scheme
Use your existing Tailwind theme:
- Primary: `brand-600` (teal)
- Success: `green-600`
- Error: `red-600`
- Gray scales for backgrounds

---

## 🔧 Development Workflow

### Starting Development

1. **Start Backend:**
   ```bash
   cd server
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   npm start
   ```

3. **Open Browser:**
   ```
   http://localhost:3000
   ```

### Making Changes

1. Create new component files in `src/pages/` or `src/components/`
2. Add routes in `src/router/index.tsx`
3. Test locally
4. Commit when feature is working

### Deployment

1. **Backend Deploy:**
   - Vercel auto-deploys from main branch
   - Add environment variables in Vercel dashboard
   - Run migration on production database

2. **Frontend Deploy:**
   - Vercel auto-deploys from main branch
   - Ensure API_URL points to production backend

---

## 💡 Quick Wins

Start with these to see immediate results:

### 1. Calendar Connection (10 min)
Add a simple button to settings page:

```tsx
const handleConnect = () => {
  window.location.href = 'http://localhost:4000/api/auth/microsoft/login';
};

<Button onClick={handleConnect}>
  Connect Microsoft Calendar
</Button>
```

### 2. Booking Form (30 min)
Create basic form using existing components:

```tsx
import { useForm } from 'react-hook-form';
import { Input, Button } from '@/components/ui';

const BookingForm = () => {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    const response = await fetch('/api/booking/public/your-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    // Handle response
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('patientFirstName')} placeholder="First Name" />
      <Input {...register('patientLastName')} placeholder="Last Name" />
      {/* More fields... */}
      <Button type="submit">Book Appointment</Button>
    </form>
  );
};
```

### 3. AI Report Button (15 min)
Add to HMR detail page:

```tsx
const handleGenerateReport = async () => {
  const response = await fetch(`/api/ai/generate-report/${reviewId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  const { summary, recommendations } = await response.json();
  // Display in UI
};

<Button onClick={handleGenerateReport}>
  Generate Report with AI
</Button>
```

---

## 📊 Success Metrics

You'll know Phase 1 is complete when:

- [ ] Referrers can book appointments via public URL
- [ ] Bookings automatically create calendar events
- [ ] Patients receive SMS confirmations
- [ ] HMR reports can be generated with AI
- [ ] Pharmacists can manage availability
- [ ] Calendar connection works end-to-end

---

## 🆘 Getting Help

### Common Issues

**"Server won't start"**
- Check `.env` file exists and has all required variables
- Ensure database is running
- Check port 4000 is not in use

**"Can't connect to database"**
- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Try: `psql "postgresql://nicholasbuete:Nbapple2025!@localhost:5432/postgres"`

**"Microsoft OAuth fails"**
- Verify redirect URI matches exactly in Azure
- Check client secret hasn't expired
- Ensure admin consent was granted

### Resources

- **Microsoft Graph Docs:** https://learn.microsoft.com/en-us/graph/
- **Twilio Docs:** https://www.twilio.com/docs/sms
- **OpenAI Docs:** https://platform.openai.com/docs/
- **shadcn/ui Components:** https://ui.shadcn.com/

---

## 🎯 The Vision

By the end of Phase 1, you'll have:

✅ **For Referrers:**
- Easy online booking (no login required)
- Automatic confirmations
- Custom booking page

✅ **For Patients:**
- SMS reminders with checklist
- Clear preparation instructions
- Professional experience

✅ **For Pharmacists:**
- Automatic calendar sync
- AI-assisted report writing
- Streamlined workflow

✅ **For Your Business:**
- Professional automation
- Time savings
- Better patient outcomes
- Scalable system

---

**Status:** Backend complete ✅ | Frontend in progress 🚧

**Next Action:** Build public booking page UI

**Estimated Time to MVP:** 2-3 weeks

Good luck! 🚀

---

**Last Updated:** 2025-12-27
