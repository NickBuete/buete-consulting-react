# Refactor Plan

## Scope
- Keep runtime behavior unchanged.
- Reduce file length and duplication.
- Prefer incremental extraction with shims to avoid wide changes.

## Findings
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

## Investigations
- Confirm whether any code still imports the legacy HMR service.
  - `server/src/services/hmrReviewService.ts`
- Map usage of `src/utils/doseCalculation.ts` to separate domain vs display helpers.
- Identify common print/PDF helper needs across pharmacy calculator components.
- Decide on minimal test harness (frontend or server) for characterization tests.

## Recommendations
- Split dose schedule logic into focused modules and re-export from the existing path to minimize churn.
  - `src/utils/doseCalculation.ts`
- Decompose the medication form dialog into schema, mappers, and schedule-specific sections.
  - `src/components/dose-calculator/MedicationFormDialog.tsx`
- Extract pill trainer content and print/PDF utilities; move inline styles into CSS.
  - `src/components/pharmacy-calculators/PillSwallowingTrainer.tsx`
  - `src/components/pharmacy-calculators/DoseScheduler.tsx`
- Consolidate HMR review services under `server/src/services/hmr/` and update route imports.
  - `server/src/services/hmrReviewService.ts`
  - `server/src/services/hmr/hmrReviewService.ts`
  - `server/src/routes/hmrReviewRoutes.ts`
- Split booking routes into sub-routers; centralize shared booking orchestration helpers.
  - `server/src/routes/bookingRoutes.ts`
  - `server/src/services/booking/bookingCreationService.ts`
