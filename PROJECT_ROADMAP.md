# Buete Consulting - Project Enhancement Roadmap

**Last Updated:** 2025-12-27
**Project Goal:** Transform into a best-in-class pharmacy consulting platform

---

## Project Vision

A comprehensive platform for pharmacy consultants that:
1. Showcases example websites built (e.g., Gardens Pharmacy)
2. Provides Australian pharmacy tools & calculators
3. Offers quick reference to Australian pharmacy regulations
4. Manages complete HMR workflow from referral to claim
5. Delivers AI-assisted clinical report generation

---

## Current State Assessment

### ✅ **Completed Features**

#### Frontend
- [x] React + TypeScript + Tailwind CSS
- [x] shadcn/ui component library
- [x] Authentication system (login/register)
- [x] Role-based access control (BASIC, PRO, ADMIN)
- [x] Offline PWA capabilities with service worker
- [x] IndexedDB for offline data storage
- [x] Responsive mobile-first design

#### Backend
- [x] Express + Prisma + PostgreSQL
- [x] JWT authentication
- [x] User management with bcrypt password hashing
- [x] Rate limiting & security middleware (Helmet, CORS)
- [x] Comprehensive API logging (Pino)
- [x] Multi-tenant support (owner-based isolation)

#### HMR Workflow System
- [x] Patient management (CRUD)
- [x] Prescriber management with clinic relationships
- [x] Clinic management
- [x] HMR Review workflow with status tracking
- [x] Medication list management per review
- [x] Comprehensive symptom questionnaire (15+ symptoms)
- [x] Medical history tracking
- [x] Allergy tracking
- [x] Pathology results storage
- [x] Action items with priority & assignment
- [x] Attachment metadata storage
- [x] Audit logging for compliance
- [x] AI report generation (AWS Bedrock)
- [x] Rich text editor (TipTap) for reports
- [x] Education advice module
- [x] Recommendations module
- [x] Dashboard with statistics

#### Pharmacy Tools
- [x] Creatinine Clearance Calculator (Cockcroft-Gault)
- [x] Unit & Concentration Converter
- [x] Opioid MME Calculator
- [x] Variable Dose Planner (warfarin, tapering)
- [x] Quick Reference Library (10+ Australian resources)
  - [x] SUSMP (Poisons Standard)
  - [x] TGA Medicine Shortages
  - [x] PBS Schedule
  - [x] QCPP Hub
  - [x] SafeScript (VIC, NSW, TAS, WA)
  - [x] SA Medicines Handbook
  - [x] Australian Immunisation Handbook

#### Infrastructure
- [x] Vercel deployment configuration
- [x] Supabase PostgreSQL integration
- [x] Environment-based configuration
- [x] CORS with environment-specific origins
- [x] Production build pipeline

### ⚠️ **Partially Implemented**

- [ ] Template/Portfolio Showcase (structure exists, needs content)
  - [x] Template data models
  - [x] Template filtering/search
  - [x] Template card components
  - [ ] Real case studies (Gardens Pharmacy)
  - [ ] Screenshots & metrics
  - [ ] Client testimonials

- [ ] File Upload/Storage
  - [x] Attachment metadata in database
  - [ ] Actual file upload to S3/storage
  - [ ] Photo upload for medications
  - [ ] Document management

### ❌ **Missing Critical Features**

#### HMR Workflow Gaps
- [ ] Calendar integration (Microsoft/Office 365)
- [ ] External booking page for referrers
- [ ] SMS reminder system (24hr before appointment)
- [ ] Patient pre-appointment checklist webpage
- [ ] Email notifications (confirmations, reminders)
- [ ] E-signature capture for consent
- [ ] Voice recording during interviews

#### AI Enhancements
- [ ] OpenAI GPT-4 integration (preferred over Bedrock)
- [ ] Multiple AI model selection
- [ ] Citation of clinical guidelines in reports
- [ ] Version comparison for report drafts

#### Business Operations
- [ ] Billing & claims tracking
- [ ] Invoice generation
- [ ] Financial reporting
- [ ] Accounting software integration (Xero)
- [ ] Revenue analytics

#### Analytics & Reporting
- [ ] HMR completion metrics dashboard
- [ ] Time-to-completion tracking
- [ ] Referrer analysis (top sources)
- [ ] Intervention impact tracking
- [ ] Export to CSV/PDF

#### Additional Tools
- [ ] BMI/BSA Calculator
- [ ] Paediatric Dose Calculator
- [ ] IV Rate Calculator
- [ ] Drug Interaction Checker
- [ ] Pregnancy/Lactation Safety Checker
- [ ] Compounding Calculator
- [ ] PBS Authority Code Finder
- [ ] S8 Register Template Generator

---

## Implementation Roadmap

### **Phase 1: Critical HMR Workflow Backend** ✅ **COMPLETE**

**Completed:** 2025-12-27
**Priority:** HIGH - Essential for daily HMR operations

#### Objectives ✅
1. ✅ Enable external referrers to book appointments (backend ready)
2. ✅ Automate patient reminders and confirmations (services ready)
3. ✅ Improve AI report quality with OpenAI (service implemented)
4. ⏳ Showcase portfolio with Gardens Pharmacy case study (deferred to Phase 3)

#### Completed Tasks

##### 1.1 Microsoft Calendar Integration ✅
- ✅ Set up Microsoft Graph API OAuth2 flow
  - ✅ Azure AD app registration complete
  - ✅ OAuth callback endpoints implemented
  - ✅ Token refresh mechanism built
- ✅ Calendar event creation service ready
- ✅ Sync scheduled appointments to Outlook/Office 365
- ✅ Two-way sync (update/cancel events)
- ✅ Store `calendarEventId` in HMR reviews (schema updated)
- ✅ Handle timezone conversions (Australia/Sydney)

##### 1.2 External Booking Page Backend ✅
- ✅ Public booking API (`/api/booking/public/:bookingUrl`)
- ✅ Availability management endpoints
- ✅ Booking form validation schemas
- ✅ Automatic HMR review creation with PENDING status
- ✅ Buffer time configuration (before/after appointments)
- ✅ Booking settings management
- ✅ Custom booking URL slugs

##### 1.3 SMS Reminder System ✅
- ✅ Twilio account setup & configuration
- ✅ SMS service abstraction layer implemented
- ✅ SMS delivery status tracking (sms_logs table)
- ✅ Phone number validation (Australian format)
- ✅ SMS templates (reminder, confirmation, cancellation)
- ⏳ Scheduled job for 24hr reminders (Phase 2 - frontend trigger needed)

##### 1.4 Patient Pre-Appointment Checklist Backend ✅
- ✅ Secure token storage (checklist_tokens table)
- ✅ Token generation mechanism ready
- ⏳ Public checklist page (`/checklist/:token`) - Phase 2 frontend
- ⏳ Checklist content and UI - Phase 2 frontend

##### 1.5 OpenAI GPT-4 Integration ✅
- ✅ OpenAI SDK installed
- ✅ OpenAI service wrapper created
- ✅ Environment variable configuration
- ✅ HMR report generation service
- ✅ Patient education content generation
- ✅ Token usage tracking capability
- ⏳ Frontend UI for model selection - Phase 2
- ⏳ Report regeneration UI - Phase 2

##### 1.6 Gardens Pharmacy Case Study
- ⏳ Deferred to Phase 3 (portfolio enhancement)

**Backend Success Criteria:** ✅ ALL COMPLETE
- ✅ Database schema includes all Phase 1 tables
- ✅ Microsoft Graph OAuth service operational
- ✅ Booking API endpoints functional
- ✅ Twilio SMS service initialized
- ✅ OpenAI GPT-4 service initialized
- ✅ Environment variables configured
- ✅ Server running successfully

---

### **Phase 2: Frontend Components** 🚀 **NEXT**

**Timeline:** Current Sprint
**Priority:** HIGH - Complete the user-facing features

#### Objectives
1. Build public booking interface for external referrers
2. Create admin booking management UI
3. Implement patient checklist webpage
4. Integrate AI generation into HMR workflow UI
5. Add Microsoft Calendar connection in settings

#### Tasks

##### 2.1 Public Booking Page UI
- [ ] Create `/book/:bookingUrl` route
- [ ] Build booking form component
  - [ ] Patient information fields
  - [ ] Referrer details fields
  - [ ] Appointment date/time picker
  - [ ] Reason for referral textarea
- [ ] Availability calendar display component
- [ ] Time slot selection component
- [ ] Form validation with Zod
- [ ] Success confirmation page
- [ ] Error handling and user feedback
- [ ] Mobile-responsive design
- [ ] Loading states during submission

##### 2.2 Admin Booking Management
- [ ] Create `/admin/booking` section
- [ ] Availability slots editor
  - [ ] Weekly schedule grid UI
  - [ ] Add/edit/delete time slots
  - [ ] Enable/disable slots toggle
- [ ] Booking settings form
  - [ ] Buffer time configuration
  - [ ] Default duration setting
  - [ ] Public booking toggle
  - [ ] Require approval toggle
  - [ ] Custom booking URL input
  - [ ] Email template editors
- [ ] Calendar connection status card
  - [ ] Connection indicator (connected/disconnected)
  - [ ] Microsoft account email display
  - [ ] Connect/disconnect buttons
- [ ] SMS logs viewer table
  - [ ] Filter by status
  - [ ] Search by phone number
  - [ ] View message content

##### 2.3 Patient Checklist Page
- [ ] Create `/checklist/:token` public route
- [ ] Token validation and expiry check
- [ ] Checklist content display
  - [ ] What to prepare section
  - [ ] What to bring section
  - [ ] What to expect section
  - [ ] Appointment details display
- [ ] Confirmation button
- [ ] Mobile-optimized layout
- [ ] Print-friendly styling
- [ ] Expired token error page

##### 2.4 AI Report Generation UI
- [ ] Add "Generate with AI" button to HMR detail page
- [ ] AI generation modal/dialog
  - [ ] Section selection (recommendations, assessment, education)
  - [ ] Model selection dropdown (if multiple providers)
  - [ ] Generate button with loading state
- [ ] Report preview/edit component
- [ ] Insert generated content into TipTap editor
- [ ] Token usage display
- [ ] Cost estimation display
- [ ] Generation history/audit trail view

##### 2.5 Microsoft Calendar Connection UI
- [ ] Create `/settings/integrations` page
- [ ] Calendar integration card
  - [ ] Status indicator with icon
  - [ ] Connected account email
  - [ ] Last sync timestamp
  - [ ] "Connect to Microsoft" button
  - [ ] "Disconnect" button with confirmation
  - [ ] Calendar sync toggle (enable/disable)
- [ ] OAuth flow handling
  - [ ] Redirect to Microsoft login
  - [ ] Handle callback success/error
  - [ ] Display success message
- [ ] Error handling for expired tokens
- [ ] Auto-refresh token UI feedback

##### 2.6 Automated Reminder Scheduling
- [ ] Create cron job / scheduled task
  - [ ] Check appointments 24hrs ahead
  - [ ] Generate checklist token
  - [ ] Send SMS with checklist link
  - [ ] Log SMS delivery
- [ ] Manual reminder trigger UI (optional)
- [ ] Reminder settings configuration

**Success Criteria:**
- [ ] Referrers can book appointments via public link
- [ ] Admins can configure availability and settings
- [ ] Patients can access checklist via SMS link
- [ ] HMR reports can be generated with AI from UI
- [ ] Users can connect/disconnect Microsoft calendar
- [ ] Automated SMS reminders sent 24hrs before appointments

---

### **Phase 3: Enhanced Functionality & Portfolio**

**Timeline:** Future Sprint
**Priority:** MEDIUM - Improves efficiency and professionalism

#### 3.1 Gardens Pharmacy Case Study
- [ ] Content gathering
  - [ ] Screenshots (desktop, mobile, tablet)
  - [ ] Project metrics (timeline, features, traffic)
  - [ ] Client testimonial
  - [ ] Problem/solution narrative
- [ ] Case study page design
- [ ] Before/after comparisons
- [ ] Technology stack showcase
- [ ] Results & impact section
- [ ] Live site link
- [ ] Add to templates showcase page

#### 3.2 Additional Pharmacy Calculators
- [ ] BMI/BSA Calculator (Mosteller formula)
- [ ] Paediatric Dose Calculator (mg/kg, mg/m²)
- [ ] IV Infusion Rate Calculator
- [ ] Ideal Body Weight Calculator
- [ ] Adjusted Body Weight Calculator
- [ ] eGFR Calculator (CKD-EPI, MDRD)

#### 3.3 Reporting & Analytics Dashboard
- [ ] HMR metrics overview
  - [ ] Total reviews by status
  - [ ] Average time per status
  - [ ] Completion rate
  - [ ] Revenue projection
- [ ] Referrer analytics
  - [ ] Top referring clinics
  - [ ] Referrals over time (chart)
  - [ ] Response time to referrals
- [ ] Patient demographics
  - [ ] Age distribution
  - [ ] Polypharmacy analysis (5+ meds)
  - [ ] Common conditions
- [ ] Export functionality (CSV, PDF)

#### 3.4 Referrer Portal
- [ ] Secure login for prescribers
- [ ] View status of their referrals
- [ ] Download completed reports
- [ ] Submit new referrals online
- [ ] Notification preferences

#### 3.5 E-Signature Capture
- [ ] Canvas-based signature component
- [ ] Signature storage (base64 or S3)
- [ ] Consent form templates
- [ ] Signature verification/audit trail
- [ ] PDF generation with signature

#### 3.6 Photo Upload for Medications
- [ ] S3-compatible storage setup (Cloudflare R2, AWS S3)
- [ ] Image upload component
- [ ] Image compression/optimization
- [ ] Thumbnail generation
- [ ] Gallery view in review detail
- [ ] OCR for medication names (optional)

**Success Criteria:**
- [ ] 6+ pharmacy calculators available
- [ ] Analytics dashboard showing key HMR metrics
- [ ] Prescribers can track their referrals
- [ ] Digital consent capture implemented
- [ ] Medication photos uploadable and viewable

---

### **Phase 4: Business Operations**

**Timeline:** Future Sprint
**Priority:** MEDIUM - Revenue tracking and growth

#### 4.1 Billing & Claims Management
- [ ] Claim record model (Medicare item numbers)
- [ ] Claim submission tracking
- [ ] Payment status tracking
- [ ] Rejection workflow
- [ ] Resubmission management
- [ ] Claim amount calculator (current Medicare rates)

#### 4.2 Invoice Generation
- [ ] Invoice template design
- [ ] PDF generation (puppeteer or PDFKit)
- [ ] Automatic invoice numbering
- [ ] Payment terms configuration
- [ ] Send invoice via email
- [ ] Invoice history & search

#### 4.3 Financial Reporting
- [ ] Monthly revenue reports
- [ ] Outstanding claims report
- [ ] Financial year summary
- [ ] GST reporting
- [ ] Payment aging report

#### 4.4 Xero Integration (Optional)
- [ ] Xero OAuth setup
- [ ] Create invoices in Xero
- [ ] Sync payment status
- [ ] Contact sync (patients/clinics)

#### 4.5 Patient Portal
- [ ] Patient registration & login
- [ ] View their HMR reports
- [ ] Download PDF summaries
- [ ] Medication list view
- [ ] Educational resources
- [ ] Book follow-up appointments

**Success Criteria:**
- [ ] Claims tracked from submission to payment
- [ ] Invoices generated and emailed automatically
- [ ] Financial reports available for tax/accounting
- [ ] Patients can access their reports online

---

### **Phase 5: Advanced Features**

**Timeline:** Future Sprint
**Priority:** LOW - Nice-to-have innovations

#### 5.1 Drug Interaction Checking
- [ ] API integration (Drugs.com, Medscape, or MIMS)
- [ ] Real-time interaction checking during medication entry
- [ ] Severity classification
- [ ] Clinical significance notes
- [ ] Interaction report in HMR summary

#### 5.2 Patient Satisfaction Surveys
- [ ] Survey template builder
- [ ] Email survey after HMR completion
- [ ] Anonymous response collection
- [ ] NPS (Net Promoter Score) calculation
- [ ] Feedback dashboard

#### 5.3 CPD Tracking Module
- [ ] CPD activity logging
- [ ] Upload certificates
- [ ] Renewal reminders (AHPRA, insurance)
- [ ] CPD points calculation
- [ ] Annual summary export

#### 5.4 Advanced Analytics
- [ ] Intervention impact tracking
- [ ] Medications ceased
- [ ] Medications initiated
- [ ] Dose changes
- [ ] GP acceptance rate
- [ ] Benchmarking against industry averages
- [ ] Predictive analytics (HMR completion time)
- [ ] Patient risk stratification

#### 5.5 Multi-Pharmacist Collaboration
- [ ] Team workspaces
- [ ] Internal messaging/comments on reviews
- [ ] Task assignment within reviews
- [ ] Peer review workflow
- [ ] Supervisor approval gates
- [ ] Activity feed

#### 5.6 Mobile App (React Native)
- [ ] iOS & Android builds
- [ ] Push notifications
- [ ] Offline-first architecture
- [ ] Camera integration for medication photos
- [ ] GPS check-in for home visits
- [ ] Voice-to-text notes

**Success Criteria:**
- [ ] Drug interactions flagged automatically
- [ ] Patient feedback collected systematically
- [ ] CPD requirements tracked
- [ ] Team collaboration features live
- [ ] Mobile app published to app stores

---

## Additional Feature Ideas (Backlog)

### Professional Development
- [ ] Clinical resource library (PDF storage)
- [ ] Conference/webinar tracker
- [ ] Journal article repository
- [ ] Clinical guidelines quick access

### Marketing & Growth
- [ ] Automated referrer thank-you emails
- [ ] Monthly summary reports to GP clinics
- [ ] Branded HMR explainer brochures
- [ ] Marketing email templates
- [ ] Referral program tracking

### Compliance & Quality
- [ ] HIPAA/Privacy Act compliance checklist
- [ ] Two-factor authentication (TOTP)
- [ ] Session timeout for sensitive data
- [ ] Data breach response plan
- [ ] GDPR-style data export
- [ ] Automated backup verification

### Additional Tools

- [ ] Compounding Calculator (dilutions, alligation)


## Technical Debt & Infrastructure

### Backend Improvements
- [ ] Add Redis for caching & session management
- [ ] Message queue (Bull/BullMQ) for background jobs
- [ ] S3-compatible storage for files
- [ ] WebSocket for real-time notifications
- [ ] GraphQL API (optional alternative to REST)

### Frontend Improvements
- [ ] React Query for data fetching
- [ ] Optimistic updates for better UX
- [ ] Sentry error tracking
- [ ] Lighthouse CI for performance
- [ ] Storybook for component documentation

### DevOps & Testing
- [ ] GitHub Actions CI/CD pipeline
- [ ] Staging environment
- [ ] Unit tests (Jest) - target 80% coverage
- [ ] Integration tests (Playwright)
- [ ] E2E tests for critical flows
- [ ] Database migration strategy (Prisma Migrate)
- [ ] Monitoring (DataDog, New Relic, or Grafana)
- [ ] Automated security scanning

### Documentation
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Component documentation (Storybook)
- [ ] User guide/help center
- [ ] Video tutorials
- [ ] Onboarding checklist for new users

---

## Notes & Decisions

### Technology Choices
- **Frontend:** React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Express, Prisma, PostgreSQL
- **Hosting:** Vercel (frontend), Supabase (database)
- **AI:** AWS Bedrock + OpenAI (dual support)
- **Calendar:** Microsoft Graph API (Office 365)
- **SMS:** Twilio
- **Email:** Office 365 SMTP or SendGrid
- **Storage:** TBD (S3, Cloudflare R2, or Supabase Storage)
- **Domain:** GoDaddy with Office 365 email

### Design Principles
1. Mobile-first responsive design
2. Offline-capable for home visits
3. Fast & intuitive user experience
4. Australian pharmacy context throughout
5. Evidence-based clinical tools
6. Secure & compliant with privacy regulations
7. Scalable for multi-pharmacist teams

### Open Questions
- [ ] Which SMS provider? (Twilio vs AWS SNS vs local AU provider)
- [ ] Which storage provider? (S3 vs Cloudflare R2 vs Supabase)
- [ ] OCR for medication photos worth it?
- [ ] Drug interaction API - which provider?
- [ ] Payment gateway for invoicing? (Stripe, PayPal)

---

## Version History

| Date       | Version | Changes                                           |
|------------|---------|--------------------------------------------------|
| 2025-12-27 | 1.0     | Initial roadmap created                          |
| 2025-12-27 | 2.0     | Phase 1 backend complete, phases reorganized     |

