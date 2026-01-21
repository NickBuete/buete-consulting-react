/**
 * MedicationFormDialog
 *
 * Re-exports the wizard-based medication form dialog.
 * The wizard provides a step-by-step flow for better UX:
 * 1. Basics - medication name, unit, dates, schedule type
 * 2. Schedule - configuration specific to the schedule type
 * 3. Preparations - optional tablet tracking
 * 4. Review - summary before saving
 */
export { MedicationFormWizard as MedicationFormDialog } from './MedicationFormDialog/MedicationFormWizard';
