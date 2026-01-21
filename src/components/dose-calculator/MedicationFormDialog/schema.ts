import { z } from 'zod';

// Zod schema for preparation
const preparationSchema = z.object({
  id: z.string(),
  strength: z.number().positive('Strength must be positive'),
  canBeHalved: z.boolean(),
});

// Zod schema for dose time value
// Using z.string() due to Zod v4/TypeScript 4.9 compatibility - type is validated at runtime
const doseTimeValueSchema = z.object({
  time: z.string(),
  dose: z.number().nonnegative(),
});

// Zod schema for taper phase (with optional dose times)
const taperPhaseSchema = z.object({
  id: z.string(),
  dose: z.number().nonnegative('Dose must be 0 or greater'),
  durationDays: z.number().int().positive('Duration must be at least 1 day'),
  doseTimes: z.array(doseTimeValueSchema).optional(),
});

// Main medication schema
export const medicationSchema = z.object({
  medicationName: z.string().min(1, 'Medication name is required'),
  unit: z.string(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  scheduleType: z.string(),

  // Dose times mode (applies to schedule type configs)
  // Using z.string() due to Zod v4/TypeScript 4.9 compatibility
  doseTimesMode: z.string(),
  enabledDoseTimes: z.array(z.string()).optional(),

  // Linear config
  linearStartingDose: z.number().nonnegative().optional(),
  linearTitrationDirection: z.string().optional(),
  linearChangeAmount: z.number().nonnegative().optional(),
  linearIntervalDays: z.number().int().min(1).optional(),
  linearMinimumDose: z.number().nonnegative().optional(),
  linearMaximumDose: z.number().positive().optional(),
  // Linear config dose times
  linearStartingDoseTimes: z.array(doseTimeValueSchema).optional(),
  linearMaximumDoseTimes: z.array(doseTimeValueSchema).optional(),

  // Cyclic config
  cyclicDose: z.number().nonnegative().optional(),
  cyclicDaysOn: z.number().int().min(1).optional(),
  cyclicDaysOff: z.number().int().min(0).optional(),
  // Cyclic config dose times
  cyclicDoseTimes: z.array(doseTimeValueSchema).optional(),

  // Day of week config
  dowMonday: z.number().nonnegative().optional(),
  dowTuesday: z.number().nonnegative().optional(),
  dowWednesday: z.number().nonnegative().optional(),
  dowThursday: z.number().nonnegative().optional(),
  dowFriday: z.number().nonnegative().optional(),
  dowSaturday: z.number().nonnegative().optional(),
  dowSunday: z.number().nonnegative().optional(),
  // Day of week dose times (each day has its own dose times array)
  dowMondayTimes: z.array(doseTimeValueSchema).optional(),
  dowTuesdayTimes: z.array(doseTimeValueSchema).optional(),
  dowWednesdayTimes: z.array(doseTimeValueSchema).optional(),
  dowThursdayTimes: z.array(doseTimeValueSchema).optional(),
  dowFridayTimes: z.array(doseTimeValueSchema).optional(),
  dowSaturdayTimes: z.array(doseTimeValueSchema).optional(),
  dowSundayTimes: z.array(doseTimeValueSchema).optional(),

  // Multi-phase config
  phases: z.array(taperPhaseSchema).optional(),

  // Preparation config
  preparationMode: z.string(),
  preparations: z.array(preparationSchema).optional(),

  // Titration mode fields for multiple dose times
  linearTitrationMode: z.string().optional(),
  linearTitrationSequence: z.array(z.string()).optional(),
  linearIncrementsPerDoseTime: z.number().int().min(1).optional(),
}).refine(
  (data) => {
    if (data.endDate && data.startDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export type MedicationFormValues = z.infer<typeof medicationSchema>;
