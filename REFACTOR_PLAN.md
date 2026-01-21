# Refactor Plan

## Status: ✅ COMPLETED

All refactoring tasks have been completed. See details below.

---

## Scope
- Keep runtime behavior unchanged.
- Reduce file length and duplication.
- Prefer incremental extraction with shims to avoid wide changes.

## Completed Items

### 1. Dose Schedule Logic Split ✅
**Files:**
- `src/utils/doseCalculation.ts` → Now re-exports from modular files
- `src/utils/dose-calculation/schedule.ts` - Main calculation engine
- `src/utils/dose-calculation/preparations.ts` - Tablet optimization
- `src/utils/dose-calculation/calendar.ts` - Calendar generation
- `src/utils/dose-calculation/formatting.ts` - Display formatting

### 2. Medication Form Dialog Decomposition ✅
**Files:**
- `src/components/dose-calculator/MedicationFormDialog/schema.ts` - Zod validation
- `src/components/dose-calculator/MedicationFormDialog/mappers.ts` - Form ↔ Model
- `src/components/dose-calculator/MedicationFormDialog/sections/LinearSection.tsx`
- `src/components/dose-calculator/MedicationFormDialog/sections/CyclicSection.tsx`
- `src/components/dose-calculator/MedicationFormDialog/sections/DayOfWeekSection.tsx`
- `src/components/dose-calculator/MedicationFormDialog/sections/MultiPhaseSection.tsx`
- `src/components/dose-calculator/MedicationFormDialog/sections/DoseTimesSelector.tsx`
- `src/components/dose-calculator/MedicationFormDialog/ScheduleTypeSelector.tsx` - Visual cards
- `src/components/dose-calculator/MedicationFormDialog/MedicationFormWizard.tsx` - Wizard UI

### 3. Pill Trainer Extraction ✅
**Files:**
- `src/components/pharmacy-calculators/pill-trainer/levels.ts` - Level data
- `src/components/pharmacy-calculators/pill-trainer/print.ts` - Print utilities
- `src/components/pharmacy-calculators/pill-trainer/certificate.ts` - Certificate generation
- `src/components/pharmacy-calculators/pill-trainer/pill-trainer.css` - Styles

### 4. Dose Scheduler Extraction ✅
**Files:**
- `src/components/pharmacy-calculators/dose-scheduler/print.ts` - Print utilities

### 5. HMR Services Consolidation ✅
**Files:**
- `server/src/services/hmrReviewService.ts` → Deprecated shim, re-exports from `./hmr/`
- `server/src/services/hmr/hmrReviewService.ts` - Primary service location
- All services consolidated under `server/src/services/hmr/`

### 6. Booking Routes Split ✅
**Files:**
- `server/src/routes/bookingRoutes.ts` → Now only 21 lines, imports sub-routers
- `server/src/routes/booking/availabilityRoutes.ts`
- `server/src/routes/booking/settingsRoutes.ts`
- `server/src/routes/booking/publicRoutes.ts`
- `server/src/routes/booking/directRoutes.ts`

---

## Original Findings (for reference)

- Duplicate HMR review services risk drift and confusing imports.
  - `server/src/services/hmrReviewService.ts`
  - `server/src/services/hmr/hmrReviewService.ts`
- Dose schedule domain logic, formatting, and UI helpers are mixed, and formatting is duplicated in the PDF renderer.
  - `src/utils/doseCalculation.ts`
  - `src/components/dose-calculator/DoseCalendarPDF.tsx`
- Large UI components include embedded print/PDF HTML and inline styles.
  - `src/components/pharmacy-calculators/PillSwallowingTrainer.tsx`
  - `src/components/pharmacy-calculators/DoseScheduler.tsx`
- Booking routes remain long even after some extraction into services.
  - `server/src/routes/bookingRoutes.ts`
