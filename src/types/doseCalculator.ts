// Type definitions for the Variable Dose Planner

export interface PatientDetails {
  name: string;
  dateOfBirth: Date;
  address: string;
}

export type MedicationUnit = 'mg' | 'mcg' | 'mL' | 'units';

export type TitrationDirection = 'increase' | 'decrease' | 'maintain';

export type TitrationMode = 'together' | 'sequential';

// Dose time types for multiple daily doses
export type DoseTimeName = 'mane' | 'lunch' | 'dinner' | 'nocte';

export type DoseTimesMode = 'single' | 'multiple';

export interface DoseTimeValue {
  time: DoseTimeName;
  dose: number;
}

export interface DoseTimeEntry {
  time: DoseTimeName;
  dose: number;
  tabletBreakdown?: TabletBreakdown[];
}

// Labels for display
export const DOSE_TIME_LABELS: Record<DoseTimeName, string> = {
  mane: 'Mane (Morning)',
  lunch: 'Lunch',
  dinner: 'Dinner',
  nocte: 'Nocte (Bedtime)',
};

// Short labels for compact calendar display
export const DOSE_TIME_SHORT_LABELS: Record<DoseTimeName, string> = {
  mane: 'M',
  lunch: 'L',
  dinner: 'D',
  nocte: 'N',
};

// All dose time names in order
export const ALL_DOSE_TIMES: DoseTimeName[] = ['mane', 'lunch', 'dinner', 'nocte'];

// Schedule type discriminator
export type ScheduleType = 'linear' | 'cyclic' | 'dayOfWeek' | 'multiPhase';

// Preparation optimization mode
export type PreparationMode = 'none' | 'specify' | 'optimise';

// Available preparation/formulation
export interface Preparation {
  id: string;
  strength: number;
  unit: MedicationUnit;
  canBeHalved: boolean;
  description?: string;
}

// Linear titration config (existing behavior)
export interface LinearConfig {
  startingDose: number;
  titrationDirection: TitrationDirection;
  changeAmount: number;
  intervalDays: number;
  minimumDose?: number;
  maximumDose?: number;

  // Multiple dose times support
  doseTimesMode?: DoseTimesMode; // 'single' (default) or 'multiple'
  enabledDoseTimes?: DoseTimeName[]; // Which times are enabled
  startingDoseTimes?: DoseTimeValue[]; // Starting dose for each enabled time
  maximumDoseTimes?: DoseTimeValue[]; // Maximum dose for each enabled time (optional, overrides maximumDose)

  // Enhanced titration configuration for multiple dose times
  titrationMode?: TitrationMode; // 'together' (default) or 'sequential'
  titrationSequence?: DoseTimeName[]; // Order for sequential titration (e.g., ['nocte', 'mane'])
  incrementsPerDoseTime?: number; // How many increments before moving to next (default: 1)
}

// Cyclic dosing config (e.g., 21 days on, 7 days off)
export interface CyclicConfig {
  dose: number;
  daysOn: number;
  daysOff: number;

  // Multiple dose times support
  doseTimesMode?: DoseTimesMode;
  doseTimes?: DoseTimeValue[]; // Dose for each enabled time
}

// Day-of-week dosing config (e.g., warfarin)
export interface DayOfWeekConfig {
  monday?: number;
  tuesday?: number;
  wednesday?: number;
  thursday?: number;
  friday?: number;
  saturday?: number;
  sunday?: number;

  // Multiple dose times support
  doseTimesMode?: DoseTimesMode;
  enabledDoseTimes?: DoseTimeName[];
  // Per-day dose times (when mode is 'multiple')
  mondayTimes?: DoseTimeValue[];
  tuesdayTimes?: DoseTimeValue[];
  wednesdayTimes?: DoseTimeValue[];
  thursdayTimes?: DoseTimeValue[];
  fridayTimes?: DoseTimeValue[];
  saturdayTimes?: DoseTimeValue[];
  sundayTimes?: DoseTimeValue[];
}

// Multi-phase taper config (e.g., SNRI detox)
export interface TaperPhase {
  id: string;
  dose: number;
  durationDays: number;

  // Multiple dose times support (doses for each time within this phase)
  doseTimes?: DoseTimeValue[];
}

export interface MultiPhaseConfig {
  phases: TaperPhase[];

  // Multiple dose times support
  doseTimesMode?: DoseTimesMode;
  enabledDoseTimes?: DoseTimeName[];
}

// Enhanced medication schedule with all modes
export interface MedicationSchedule {
  id: string;
  medicationName: string;
  unit: MedicationUnit;
  startDate: Date;
  endDate?: Date;

  // Schedule type determines which config is used
  scheduleType: ScheduleType;

  // Configs for different schedule types (only one used based on scheduleType)
  linearConfig?: LinearConfig;
  cyclicConfig?: CyclicConfig;
  dayOfWeekConfig?: DayOfWeekConfig;
  multiPhaseConfig?: MultiPhaseConfig;

  // Preparation optimization (optional, applies to all types)
  preparationMode: PreparationMode;
  preparations?: Preparation[];
  optimisedPreparations?: Preparation[];

  // Medication-level dose times settings (convenience for all schedule types)
  doseTimesMode?: DoseTimesMode;
  enabledDoseTimes?: DoseTimeName[];
}

// Tablet breakdown for a single dose
export interface TabletBreakdown {
  preparation: Preparation;
  quantity: number; // e.g., 0.5 for half tablet, 1 for whole, 2 for two tablets
}

// Enhanced dose entry with tablet breakdown
export interface DoseEntry {
  date: Date;
  dose: number; // Total daily dose (sum of all dose times for backwards compatibility)
  unit: MedicationUnit;
  medicationId: string;
  medicationName: string;
  isOffDay?: boolean;
  tabletBreakdown?: TabletBreakdown[];

  // Multiple dose times (when mode is 'multiple')
  doseTimes?: DoseTimeEntry[];
}

export interface CalendarDay {
  date: Date;
  doses: DoseEntry[];
  isCurrentMonth: boolean;
}

// Preparation optimization result
export interface PreparationRequirement {
  preparation: Preparation;
  totalQuantity: number;
}

export interface PreparationSummary {
  medicationId: string;
  medicationName: string;
  requiredPreparations: PreparationRequirement[];
  canAchieveAllDoses: boolean;
  warnings: string[];
}

// Legacy type mapping for backwards compatibility during transition
// This allows existing code to work while we migrate
export type LegacyMedicationSchedule = {
  id: string;
  medicationName: string;
  strength: number;
  unit: MedicationUnit;
  startingDose: number;
  titrationDirection: TitrationDirection;
  changeAmount: number;
  intervalDays: number;
  startDate: Date;
  endDate?: Date;
  minimumDose?: number;
  maximumDose?: number;
};
