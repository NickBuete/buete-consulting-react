// Type definitions for the medication dosing calculator

export interface PatientDetails {
  name: string;
  dateOfBirth: Date;
  address: string;
}

export type MedicationUnit = 'mg' | 'mcg' | 'mL' | 'units';

export type TitrationDirection = 'increase' | 'decrease' | 'maintain';

export interface MedicationSchedule {
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
}

export interface DoseEntry {
  date: Date;
  dose: number;
  unit: MedicationUnit;
  medicationId: string;
  medicationName: string;
}

export interface CalendarDay {
  date: Date;
  doses: DoseEntry[];
  isCurrentMonth: boolean;
}
