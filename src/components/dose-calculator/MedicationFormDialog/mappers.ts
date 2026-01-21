import type {
  DoseTimeName,
  DoseTimesMode,
  MedicationSchedule,
  Preparation,
  PreparationMode,
  ScheduleType,
  TitrationMode,
} from '../../../types/doseCalculator';
import type { MedicationFormValues } from './schema';

export function getDefaultValues(): MedicationFormValues {
  return {
    medicationName: '',
    unit: 'mg',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    scheduleType: 'linear',

    // Dose times mode
    doseTimesMode: 'single',
    enabledDoseTimes: ['mane'],

    linearStartingDose: 0,
    linearTitrationDirection: 'decrease',
    linearChangeAmount: 0,
    linearIntervalDays: 7,
    linearMinimumDose: undefined,
    linearMaximumDose: undefined,
    linearStartingDoseTimes: [],
    linearMaximumDoseTimes: [],
    linearTitrationMode: 'together',
    linearTitrationSequence: [],
    linearIncrementsPerDoseTime: 1,

    cyclicDose: 0,
    cyclicDaysOn: 21,
    cyclicDaysOff: 7,
    cyclicDoseTimes: [],

    dowMonday: undefined,
    dowTuesday: undefined,
    dowWednesday: undefined,
    dowThursday: undefined,
    dowFriday: undefined,
    dowSaturday: undefined,
    dowSunday: undefined,
    dowMondayTimes: [],
    dowTuesdayTimes: [],
    dowWednesdayTimes: [],
    dowThursdayTimes: [],
    dowFridayTimes: [],
    dowSaturdayTimes: [],
    dowSundayTimes: [],

    phases: [],

    preparationMode: 'none',
    preparations: [],
  };
}

export function medicationToFormValues(medication: MedicationSchedule): MedicationFormValues {
  // Determine dose times mode from the schedule type config
  let doseTimesMode: DoseTimesMode = 'single';
  let enabledDoseTimes: DoseTimeName[] = ['mane'];

  if (medication.linearConfig?.doseTimesMode === 'multiple') {
    doseTimesMode = 'multiple';
    enabledDoseTimes = medication.linearConfig.enabledDoseTimes ?? ['mane'];
  } else if (medication.cyclicConfig?.doseTimesMode === 'multiple') {
    doseTimesMode = 'multiple';
    enabledDoseTimes = medication.cyclicConfig.doseTimes?.map(dt => dt.time) ?? ['mane'];
  } else if (medication.dayOfWeekConfig?.doseTimesMode === 'multiple') {
    doseTimesMode = 'multiple';
    enabledDoseTimes = medication.dayOfWeekConfig.enabledDoseTimes ?? ['mane'];
  } else if (medication.multiPhaseConfig?.doseTimesMode === 'multiple') {
    doseTimesMode = 'multiple';
    enabledDoseTimes = medication.multiPhaseConfig.enabledDoseTimes ?? ['mane'];
  }

  return {
    medicationName: medication.medicationName,
    unit: medication.unit,
    startDate: medication.startDate.toISOString().split('T')[0],
    endDate: medication.endDate ? medication.endDate.toISOString().split('T')[0] : '',
    scheduleType: medication.scheduleType,

    // Dose times mode
    doseTimesMode,
    enabledDoseTimes,

    linearStartingDose: medication.linearConfig?.startingDose ?? 0,
    linearTitrationDirection: medication.linearConfig?.titrationDirection ?? 'decrease',
    linearChangeAmount: medication.linearConfig?.changeAmount ?? 0,
    linearIntervalDays: medication.linearConfig?.intervalDays ?? 7,
    linearMinimumDose: medication.linearConfig?.minimumDose,
    linearMaximumDose: medication.linearConfig?.maximumDose,
    linearStartingDoseTimes: medication.linearConfig?.startingDoseTimes?.map(dt => ({
      time: dt.time,
      dose: dt.dose,
    })) ?? [],
    linearMaximumDoseTimes: medication.linearConfig?.maximumDoseTimes?.map(dt => ({
      time: dt.time,
      dose: dt.dose,
    })) ?? [],
    linearTitrationMode: medication.linearConfig?.titrationMode ?? 'together',
    linearTitrationSequence: medication.linearConfig?.titrationSequence ?? [],
    linearIncrementsPerDoseTime: medication.linearConfig?.incrementsPerDoseTime ?? 1,

    cyclicDose: medication.cyclicConfig?.dose ?? 0,
    cyclicDaysOn: medication.cyclicConfig?.daysOn ?? 21,
    cyclicDaysOff: medication.cyclicConfig?.daysOff ?? 7,
    cyclicDoseTimes: medication.cyclicConfig?.doseTimes?.map(dt => ({
      time: dt.time,
      dose: dt.dose,
    })) ?? [],

    dowMonday: medication.dayOfWeekConfig?.monday,
    dowTuesday: medication.dayOfWeekConfig?.tuesday,
    dowWednesday: medication.dayOfWeekConfig?.wednesday,
    dowThursday: medication.dayOfWeekConfig?.thursday,
    dowFriday: medication.dayOfWeekConfig?.friday,
    dowSaturday: medication.dayOfWeekConfig?.saturday,
    dowSunday: medication.dayOfWeekConfig?.sunday,
    dowMondayTimes: medication.dayOfWeekConfig?.mondayTimes?.map(dt => ({ time: dt.time, dose: dt.dose })) ?? [],
    dowTuesdayTimes: medication.dayOfWeekConfig?.tuesdayTimes?.map(dt => ({ time: dt.time, dose: dt.dose })) ?? [],
    dowWednesdayTimes: medication.dayOfWeekConfig?.wednesdayTimes?.map(dt => ({ time: dt.time, dose: dt.dose })) ?? [],
    dowThursdayTimes: medication.dayOfWeekConfig?.thursdayTimes?.map(dt => ({ time: dt.time, dose: dt.dose })) ?? [],
    dowFridayTimes: medication.dayOfWeekConfig?.fridayTimes?.map(dt => ({ time: dt.time, dose: dt.dose })) ?? [],
    dowSaturdayTimes: medication.dayOfWeekConfig?.saturdayTimes?.map(dt => ({ time: dt.time, dose: dt.dose })) ?? [],
    dowSundayTimes: medication.dayOfWeekConfig?.sundayTimes?.map(dt => ({ time: dt.time, dose: dt.dose })) ?? [],

    phases: medication.multiPhaseConfig?.phases.map(p => ({
      id: p.id,
      dose: p.dose,
      durationDays: p.durationDays,
      doseTimes: p.doseTimes?.map(dt => ({ time: dt.time, dose: dt.dose })),
    })) ?? [],

    preparationMode: medication.preparationMode,
    preparations: medication.preparations?.map(p => ({
      id: p.id,
      strength: p.strength,
      canBeHalved: p.canBeHalved,
    })) ?? [],
  };
}

export function formValuesToMedication(
  data: MedicationFormValues,
  existingId?: string,
  optimisedPreps?: Preparation[]
): MedicationSchedule {
  const medication: MedicationSchedule = {
    id: existingId || `med-${Date.now()}`,
    medicationName: data.medicationName,
    unit: data.unit as 'mg' | 'mcg' | 'mL' | 'units',
    startDate: new Date(data.startDate),
    endDate: data.endDate ? new Date(data.endDate) : undefined,
    scheduleType: data.scheduleType as ScheduleType,
    preparationMode: data.preparationMode as PreparationMode,
    doseTimesMode: data.doseTimesMode as DoseTimesMode,
    enabledDoseTimes: data.enabledDoseTimes as DoseTimeName[],
  };

  const doseTimesMode = data.doseTimesMode as DoseTimesMode;
  const enabledDoseTimes = data.enabledDoseTimes as DoseTimeName[];

  // Add config based on schedule type
  switch (data.scheduleType) {
    case 'linear':
      medication.linearConfig = {
        startingDose: data.linearStartingDose ?? 0,
        titrationDirection: (data.linearTitrationDirection as 'increase' | 'decrease' | 'maintain') ?? 'decrease',
        changeAmount: data.linearChangeAmount ?? 0,
        intervalDays: data.linearIntervalDays ?? 7,
        minimumDose: data.linearMinimumDose,
        maximumDose: data.linearMaximumDose,
        doseTimesMode: doseTimesMode,
        enabledDoseTimes: enabledDoseTimes,
        startingDoseTimes: doseTimesMode === 'multiple'
          ? (data.linearStartingDoseTimes ?? [])
              .filter(dt => enabledDoseTimes.includes(dt.time as DoseTimeName))
              .map(dt => ({
                time: dt.time as DoseTimeName,
                dose: dt.dose,
              }))
          : undefined,
        maximumDoseTimes: doseTimesMode === 'multiple'
          ? (data.linearMaximumDoseTimes ?? [])
              .filter(dt => enabledDoseTimes.includes(dt.time as DoseTimeName) && dt.dose > 0)
              .map(dt => ({
                time: dt.time as DoseTimeName,
                dose: dt.dose,
              }))
          : undefined,
        // Enhanced titration settings for multiple dose times
        titrationMode: doseTimesMode === 'multiple'
          ? (data.linearTitrationMode as TitrationMode) ?? 'together'
          : undefined,
        titrationSequence: doseTimesMode === 'multiple' && data.linearTitrationMode === 'sequential'
          ? (data.linearTitrationSequence as DoseTimeName[])
          : undefined,
        incrementsPerDoseTime: doseTimesMode === 'multiple' && data.linearTitrationMode === 'sequential'
          ? data.linearIncrementsPerDoseTime ?? 1
          : undefined,
      };
      break;

    case 'cyclic':
      medication.cyclicConfig = {
        dose: data.cyclicDose ?? 0,
        daysOn: data.cyclicDaysOn ?? 21,
        daysOff: data.cyclicDaysOff ?? 7,
        doseTimesMode: doseTimesMode,
        doseTimes: doseTimesMode === 'multiple'
          ? (data.cyclicDoseTimes ?? [])
              .filter(dt => enabledDoseTimes.includes(dt.time as DoseTimeName))
              .map(dt => ({
                time: dt.time as DoseTimeName,
                dose: dt.dose,
              }))
          : undefined,
      };
      break;

    case 'dayOfWeek':
      const filterDayTimes = (times?: { time: string; dose: number }[]) =>
        doseTimesMode === 'multiple' && times
          ? times.filter(dt => enabledDoseTimes.includes(dt.time as DoseTimeName)).map(dt => ({ time: dt.time as DoseTimeName, dose: dt.dose }))
          : undefined;
      medication.dayOfWeekConfig = {
        monday: data.dowMonday,
        tuesday: data.dowTuesday,
        wednesday: data.dowWednesday,
        thursday: data.dowThursday,
        friday: data.dowFriday,
        saturday: data.dowSaturday,
        sunday: data.dowSunday,
        doseTimesMode: doseTimesMode,
        enabledDoseTimes: enabledDoseTimes,
        mondayTimes: filterDayTimes(data.dowMondayTimes),
        tuesdayTimes: filterDayTimes(data.dowTuesdayTimes),
        wednesdayTimes: filterDayTimes(data.dowWednesdayTimes),
        thursdayTimes: filterDayTimes(data.dowThursdayTimes),
        fridayTimes: filterDayTimes(data.dowFridayTimes),
        saturdayTimes: filterDayTimes(data.dowSaturdayTimes),
        sundayTimes: filterDayTimes(data.dowSundayTimes),
      };
      break;

    case 'multiPhase':
      medication.multiPhaseConfig = {
        phases: (data.phases ?? []).map((p) => ({
          id: p.id,
          dose: p.dose,
          durationDays: p.durationDays,
          doseTimes: doseTimesMode === 'multiple' && p.doseTimes
            ? p.doseTimes
                .filter(dt => enabledDoseTimes.includes(dt.time as DoseTimeName))
                .map(dt => ({ time: dt.time as DoseTimeName, dose: dt.dose }))
            : undefined,
        })),
        doseTimesMode: doseTimesMode,
        enabledDoseTimes: enabledDoseTimes,
      };
      break;
  }

  // Add preparations based on mode
  if (data.preparationMode === 'specify' && data.preparations) {
    medication.preparations = data.preparations.map((p: { id: string; strength: number; canBeHalved: boolean }) => ({
      id: p.id,
      strength: p.strength,
      unit: data.unit as 'mg' | 'mcg' | 'mL' | 'units',
      canBeHalved: p.canBeHalved,
    }));
  } else if (data.preparationMode === 'optimise' && optimisedPreps) {
    medication.optimisedPreparations = optimisedPreps;
  }

  return medication;
}
