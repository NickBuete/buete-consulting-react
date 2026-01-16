// Type definitions for the Variable Dose Planner

export interface PatientDetails {
  name: string;
  dateOfBirth: Date;
  address: string;
}

export type MedicationUnit = 'mg' | 'mcg' | 'mL' | 'units';

export type TitrationDirection = 'increase' | 'decrease' | 'maintain';

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
}

// Cyclic dosing config (e.g., 21 days on, 7 days off)
export interface CyclicConfig {
  dose: number;
  daysOn: number;
  daysOff: number;
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
}

// Multi-phase taper config (e.g., SNRI detox)
export interface TaperPhase {
  id: string;
  dose: number;
  durationDays: number;
}

export interface MultiPhaseConfig {
  phases: TaperPhase[];
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
}

// Tablet breakdown for a single dose
export interface TabletBreakdown {
  preparation: Preparation;
  quantity: number; // e.g., 0.5 for half tablet, 1 for whole, 2 for two tablets
}

// Enhanced dose entry with tablet breakdown
export interface DoseEntry {
  date: Date;
  dose: number;
  unit: MedicationUnit;
  medicationId: string;
  medicationName: string;
  isOffDay?: boolean;
  tabletBreakdown?: TabletBreakdown[];
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
