import { addDays, differenceInDays, getDay } from 'date-fns';
import type {
  MedicationSchedule,
  DoseEntry,
  DoseTimeEntry,
  DoseTimeValue,
  DoseTimeName,
} from '../../types/doseCalculator';
import { ALL_DOSE_TIMES } from '../../types/doseCalculator';
import { addTabletBreakdowns } from './preparations';

const MAX_ITERATIONS = 1000; // Safety limit to prevent infinite loops
const DEFAULT_MAINTAIN_DAYS = 90; // Default duration for 'maintain' titration

/**
 * Get total daily dose from dose times array
 */
export function getTotalDailyDose(doseTimes: DoseTimeEntry[]): number {
  return doseTimes.reduce((sum, dt) => sum + dt.dose, 0);
}

/**
 * Calculate the complete dose schedule for a medication based on its schedule type
 */
export function calculateDoseSchedule(medication: MedicationSchedule): DoseEntry[] {
  switch (medication.scheduleType) {
    case 'linear':
      return calculateLinearDoses(medication);
    case 'cyclic':
      return calculateCyclicDoses(medication);
    case 'dayOfWeek':
      return calculateDayOfWeekDoses(medication);
    case 'multiPhase':
      return calculateMultiPhaseDoses(medication);
    default:
      return calculateLinearDoses(medication);
  }
}

/**
 * Calculate doses for linear titration (increase/decrease/maintain)
 */
function calculateLinearDoses(medication: MedicationSchedule): DoseEntry[] {
  const config = medication.linearConfig;
  if (!config) return [];

  // Check if we're using multiple dose times
  const doseTimesMode = config.doseTimesMode || 'single';

  if (doseTimesMode === 'multiple' && config.startingDoseTimes && config.startingDoseTimes.length > 0) {
    return calculateLinearDosesMultipleTimes(medication);
  }

  // Original single-dose logic
  const doseEntries: DoseEntry[] = [];
  let currentDose = config.startingDose;
  let currentDate = new Date(medication.startDate);
  let iterations = 0;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const intervalEndDate = addDays(currentDate, config.intervalDays);

    for (let i = 0; i < config.intervalDays; i++) {
      const doseDate = addDays(currentDate, i);

      if (medication.endDate && doseDate > medication.endDate) {
        return addTabletBreakdowns(doseEntries, medication);
      }

      doseEntries.push({
        date: doseDate,
        dose: currentDose,
        unit: medication.unit,
        medicationId: medication.id,
        medicationName: medication.medicationName,
      });
    }

    if (config.titrationDirection === 'increase') {
      const nextDose = currentDose + config.changeAmount;

      if (config.maximumDose !== undefined && nextDose >= config.maximumDose) {
        currentDose = config.maximumDose;
        currentDate = intervalEndDate;

        for (let i = 0; i < config.intervalDays; i++) {
          const doseDate = addDays(currentDate, i);
          if (medication.endDate && doseDate > medication.endDate) {
            break;
          }
          doseEntries.push({
            date: doseDate,
            dose: currentDose,
            unit: medication.unit,
            medicationId: medication.id,
            medicationName: medication.medicationName,
          });
        }
        break;
      }

      currentDose = nextDose;
    } else if (config.titrationDirection === 'decrease') {
      const nextDose = currentDose - config.changeAmount;
      const minimumDose = config.minimumDose ?? 0;

      if (nextDose <= minimumDose) {
        currentDose = minimumDose;
        currentDate = intervalEndDate;

        for (let i = 0; i < config.intervalDays; i++) {
          const doseDate = addDays(currentDate, i);
          if (medication.endDate && doseDate > medication.endDate) {
            break;
          }
          doseEntries.push({
            date: doseDate,
            dose: currentDose,
            unit: medication.unit,
            medicationId: medication.id,
            medicationName: medication.medicationName,
          });
        }
        break;
      }

      currentDose = nextDose;
    } else {
      // 'maintain' - no change in dose
      if (!medication.endDate) {
        const maintainEndDate = addDays(medication.startDate, DEFAULT_MAINTAIN_DAYS);
        if (intervalEndDate >= maintainEndDate) {
          break;
        }
      }
    }

    currentDate = intervalEndDate;

    if (medication.endDate && currentDate > medication.endDate) {
      break;
    }
  }

  return addTabletBreakdowns(doseEntries, medication);
}

/**
 * Calculate doses for linear titration with multiple dose times
 * Supports both 'together' (synchronized) and 'sequential' modes
 */
function calculateLinearDosesMultipleTimes(medication: MedicationSchedule): DoseEntry[] {
  const config = medication.linearConfig!;
  const enabledDoseTimes = config.enabledDoseTimes ?? [];

  // Filter startingDoseTimes to only include enabled dose times
  const filteredStartingDoseTimes = (config.startingDoseTimes ?? [])
    .filter(dt => enabledDoseTimes.includes(dt.time));

  if (filteredStartingDoseTimes.length === 0) {
    return [];
  }

  const titrationMode = config.titrationMode ?? 'together';

  if (titrationMode === 'sequential') {
    return calculateLinearDosesSequential(medication, filteredStartingDoseTimes);
  }

  return calculateLinearDosesTogether(medication, filteredStartingDoseTimes);
}

/**
 * Calculate doses for linear titration with multiple dose times - together mode
 * All dose times titrate together (synchronized) by the same change amount
 */
function calculateLinearDosesTogether(medication: MedicationSchedule, filteredStartingDoseTimes: DoseTimeValue[]): DoseEntry[] {
  const config = medication.linearConfig!;

  const doseEntries: DoseEntry[] = [];

  // Track current dose for each dose time
  let currentDoseTimes: DoseTimeEntry[] = filteredStartingDoseTimes.map(dt => ({
    time: dt.time,
    dose: dt.dose,
  }));

  // If increasing and all starting doses are 0, start from the first increment
  if (config.titrationDirection === 'increase') {
    const allZero = currentDoseTimes.every(dt => dt.dose === 0);
    if (allZero && config.changeAmount > 0) {
      currentDoseTimes = currentDoseTimes.map(dt => ({
        time: dt.time,
        dose: config.changeAmount,
      }));
    }
  }

  let currentDate = new Date(medication.startDate);
  let iterations = 0;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const intervalEndDate = addDays(currentDate, config.intervalDays);

    for (let i = 0; i < config.intervalDays; i++) {
      const doseDate = addDays(currentDate, i);

      if (medication.endDate && doseDate > medication.endDate) {
        return addTabletBreakdowns(doseEntries, medication);
      }

      doseEntries.push({
        date: doseDate,
        dose: getTotalDailyDose(currentDoseTimes),
        unit: medication.unit,
        medicationId: medication.id,
        medicationName: medication.medicationName,
        doseTimes: currentDoseTimes.map(dt => ({ ...dt })),
      });
    }

    // Update dose times based on titration direction
    const updatedDoseTimes: DoseTimeEntry[] = [];
    let reachedMaxForAny = false;
    let reachedMinForAny = false;

    for (const dt of currentDoseTimes) {
      let newDose = dt.dose;

      if (config.titrationDirection === 'increase') {
        const maxDoseForTime = config.maximumDoseTimes?.find(mdt => mdt.time === dt.time)?.dose
          ?? config.maximumDose;

        if (maxDoseForTime !== undefined) {
          newDose = dt.dose + config.changeAmount;
          if (newDose >= maxDoseForTime) {
            newDose = maxDoseForTime;
            reachedMaxForAny = true;
          }
        } else {
          newDose = dt.dose + config.changeAmount;
        }
      } else if (config.titrationDirection === 'decrease') {
        const minDose = config.minimumDose ?? 0;
        newDose = dt.dose - config.changeAmount;
        if (newDose <= minDose) {
          newDose = minDose;
          reachedMinForAny = true;
        }
      }

      updatedDoseTimes.push({
        time: dt.time,
        dose: newDose,
      });
    }

    // For maintain or when max/min reached
    if (config.titrationDirection === 'maintain' || reachedMaxForAny || reachedMinForAny) {
      if (config.titrationDirection === 'maintain' && !medication.endDate) {
        const maintainEndDate = addDays(medication.startDate, DEFAULT_MAINTAIN_DAYS);
        if (intervalEndDate >= maintainEndDate) {
          break;
        }
      } else {
        // Add one more interval at the final dose
        currentDoseTimes = updatedDoseTimes;
        currentDate = intervalEndDate;

        for (let i = 0; i < config.intervalDays; i++) {
          const doseDate = addDays(currentDate, i);
          if (medication.endDate && doseDate > medication.endDate) {
            break;
          }
          doseEntries.push({
            date: doseDate,
            dose: getTotalDailyDose(currentDoseTimes),
            unit: medication.unit,
            medicationId: medication.id,
            medicationName: medication.medicationName,
            doseTimes: currentDoseTimes.map(dt => ({ ...dt })),
          });
        }
        break;
      }
    }

    currentDoseTimes = updatedDoseTimes;
    currentDate = intervalEndDate;

    if (medication.endDate && currentDate > medication.endDate) {
      break;
    }
  }

  return addTabletBreakdowns(doseEntries, medication);
}

/**
 * Calculate doses for linear titration with multiple dose times - sequential mode
 * Each dose time titrates one at a time based on sequence
 */
function calculateLinearDosesSequential(medication: MedicationSchedule, filteredStartingDoseTimes: DoseTimeValue[]): DoseEntry[] {
  const config = medication.linearConfig!;
  const doseEntries: DoseEntry[] = [];

  // Setup dose times map
  const currentDoseTimes = new Map<DoseTimeName, number>();
  filteredStartingDoseTimes.forEach(dt => {
    currentDoseTimes.set(dt.time as DoseTimeName, dt.dose);
  });

  // Use titration sequence or default to enabled dose times
  const sequence = (config.titrationSequence ?? config.enabledDoseTimes ?? []).length > 0
    ? (config.titrationSequence ?? config.enabledDoseTimes ?? [])
    : ALL_DOSE_TIMES;

  // If increasing and all starting doses are 0, start from the first increment on the first time
  const isIncrease = config.titrationDirection === 'increase';
  if (isIncrease) {
    const allZero = Array.from(currentDoseTimes.values()).every(dose => dose === 0);
    if (allZero && config.changeAmount > 0) {
      // Set the first time in sequence to the change amount
      const firstTime = sequence[0] as DoseTimeName;
      if (currentDoseTimes.has(firstTime)) {
        currentDoseTimes.set(firstTime, config.changeAmount);
      }
    }
  }

  let currentSequenceIndex = 0;
  let currentDate = new Date(medication.startDate);
  let iterations = 0;
  const firstTimeInSeq = sequence[currentSequenceIndex % sequence.length] as DoseTimeName;
  let incrementsOnCurrentTime = (currentDoseTimes.get(firstTimeInSeq) ?? 0) > 0 ? 1 : 0;
  const isDecrease = config.titrationDirection === 'decrease';
  const getMaxDoseForTime = (time: DoseTimeName): number | undefined =>
    config.maximumDoseTimes?.find(mdt => mdt.time === time)?.dose ?? config.maximumDose;
  const hasReachedAllLimits = (): boolean => {
    for (const [time, dose] of Array.from(currentDoseTimes.entries())) {
      if (isIncrease) {
        const maxDose = getMaxDoseForTime(time);
        if (maxDose === undefined || dose < maxDose) {
          return false;
        }
      } else if (isDecrease) {
        const minDose = config.minimumDose ?? 0;
        if (dose > minDose) {
          return false;
        }
      }
    }
    return true;
  };

  while (iterations < MAX_ITERATIONS) {
    iterations++;
    const intervalEndDate = addDays(currentDate, config.intervalDays);

    // Add doses for the current interval
    for (let i = 0; i < config.intervalDays; i++) {
      const doseDate = addDays(currentDate, i);

      if (medication.endDate && doseDate > medication.endDate) {
        return addTabletBreakdowns(doseEntries, medication);
      }

      // Create dose times array
      const doseTimes: DoseTimeEntry[] = Array.from(currentDoseTimes.entries())
        .map(([time, dose]) => ({ time, dose }))
        .sort((a, b) => ALL_DOSE_TIMES.indexOf(a.time) - ALL_DOSE_TIMES.indexOf(b.time));

      doseEntries.push({
        date: doseDate,
        dose: getTotalDailyDose(doseTimes),
        unit: medication.unit,
        medicationId: medication.id,
        medicationName: medication.medicationName,
        doseTimes,
      });
    }

    // Determine which dose time to adjust
    const currentTime = sequence[currentSequenceIndex % sequence.length] as DoseTimeName;
    const currentDose = currentDoseTimes.get(currentTime) ?? 0;
    if (currentDose > 0 && incrementsOnCurrentTime === 0) {
      incrementsOnCurrentTime = 1;
    }

    // Determine increments per dose time
    const incrementsPerTime = config.incrementsPerDoseTime ?? 1;

    let newDose = currentDose;
    let reachedLimit = false;

    if (isIncrease) {
      const maxDoseForTime = getMaxDoseForTime(currentTime);

      newDose = currentDose + config.changeAmount;

      if (maxDoseForTime !== undefined && newDose >= maxDoseForTime) {
        newDose = maxDoseForTime;
        reachedLimit = true;
      }
    } else if (isDecrease) {
      const minDose = config.minimumDose ?? 0;
      newDose = currentDose - config.changeAmount;
      if (newDose <= minDose) {
        newDose = minDose;
        reachedLimit = true;
      }
    }

    currentDoseTimes.set(currentTime, newDose);
    incrementsOnCurrentTime++;

    if ((isIncrease || isDecrease) && hasReachedAllLimits()) {
      // Add one final interval at the max/min doses
      for (let i = 0; i < config.intervalDays; i++) {
        const doseDate = addDays(intervalEndDate, i);
        if (medication.endDate && doseDate > medication.endDate) {
          break;
        }
        const doseTimes: DoseTimeEntry[] = Array.from(currentDoseTimes.entries())
          .map(([time, dose]) => ({ time, dose }))
          .sort((a, b) => ALL_DOSE_TIMES.indexOf(a.time) - ALL_DOSE_TIMES.indexOf(b.time));

        doseEntries.push({
          date: doseDate,
          dose: getTotalDailyDose(doseTimes),
          unit: medication.unit,
          medicationId: medication.id,
          medicationName: medication.medicationName,
          doseTimes,
        });
      }
      break;
    }

    // Check if we should move to next dose time (either reached limit or done increments)
    if (reachedLimit || incrementsOnCurrentTime >= incrementsPerTime) {
      currentSequenceIndex++;
      const newTime = sequence[currentSequenceIndex % sequence.length] as DoseTimeName;
      const newCurrentDose = currentDoseTimes.get(newTime) ?? 0;
      incrementsOnCurrentTime = newCurrentDose > 0 ? 1 : 0;
    }

    currentDate = intervalEndDate;
    if (medication.endDate && currentDate > medication.endDate) break;
  }

  return addTabletBreakdowns(doseEntries, medication);
}

/**
 * Calculate doses for cyclic dosing (X days on, Y days off)
 */
function calculateCyclicDoses(medication: MedicationSchedule): DoseEntry[] {
  const config = medication.cyclicConfig;
  if (!config) return [];

  const doseEntries: DoseEntry[] = [];
  const cycleLength = config.daysOn + config.daysOff;
  let currentDate = new Date(medication.startDate);
  let iterations = 0;

  // Default to 90 days if no end date
  const endDate = medication.endDate || addDays(medication.startDate, DEFAULT_MAINTAIN_DAYS);

  // Check if using multiple dose times
  const doseTimesMode = config.doseTimesMode || 'single';
  const hasDoseTimes = doseTimesMode === 'multiple' && config.doseTimes && config.doseTimes.length > 0;

  while (currentDate <= endDate && iterations < MAX_ITERATIONS) {
    iterations++;

    const daysSinceStart = differenceInDays(currentDate, medication.startDate);
    const dayInCycle = daysSinceStart % cycleLength;
    const isOnDay = dayInCycle < config.daysOn;

    if (hasDoseTimes) {
      const doseTimes: DoseTimeEntry[] = isOnDay
        ? config.doseTimes!.map(dt => ({ time: dt.time, dose: dt.dose }))
        : config.doseTimes!.map(dt => ({ time: dt.time, dose: 0 }));
      const totalDose = isOnDay ? getTotalDailyDose(doseTimes) : 0;

      doseEntries.push({
        date: new Date(currentDate),
        dose: totalDose,
        unit: medication.unit,
        medicationId: medication.id,
        medicationName: medication.medicationName,
        isOffDay: !isOnDay,
        doseTimes: doseTimes,
      });
    } else {
      doseEntries.push({
        date: new Date(currentDate),
        dose: isOnDay ? config.dose : 0,
        unit: medication.unit,
        medicationId: medication.id,
        medicationName: medication.medicationName,
        isOffDay: !isOnDay,
      });
    }

    currentDate = addDays(currentDate, 1);
  }

  return addTabletBreakdowns(doseEntries, medication);
}

/**
 * Calculate doses for day-of-week dosing (e.g., warfarin)
 */
function calculateDayOfWeekDoses(medication: MedicationSchedule): DoseEntry[] {
  const config = medication.dayOfWeekConfig;
  if (!config) return [];

  const doseEntries: DoseEntry[] = [];
  let currentDate = new Date(medication.startDate);
  let iterations = 0;

  // Default to 90 days if no end date
  const endDate = medication.endDate || addDays(medication.startDate, DEFAULT_MAINTAIN_DAYS);

  // Check if using multiple dose times
  const doseTimesMode = config.doseTimesMode || 'single';
  const hasDoseTimes = doseTimesMode === 'multiple';

  // Map day index (0=Sunday, 1=Monday, ..., 6=Saturday) to config
  const getDoseForDay = (dayIndex: number): number | undefined => {
    switch (dayIndex) {
      case 0: return config.sunday;
      case 1: return config.monday;
      case 2: return config.tuesday;
      case 3: return config.wednesday;
      case 4: return config.thursday;
      case 5: return config.friday;
      case 6: return config.saturday;
      default: return undefined;
    }
  };

  // Get dose times for a specific day
  const getDoseTimesForDay = (dayIndex: number): DoseTimeValue[] | undefined => {
    switch (dayIndex) {
      case 0: return config.sundayTimes;
      case 1: return config.mondayTimes;
      case 2: return config.tuesdayTimes;
      case 3: return config.wednesdayTimes;
      case 4: return config.thursdayTimes;
      case 5: return config.fridayTimes;
      case 6: return config.saturdayTimes;
      default: return undefined;
    }
  };

  while (currentDate <= endDate && iterations < MAX_ITERATIONS) {
    iterations++;

    const dayIndex = getDay(currentDate);

    if (hasDoseTimes) {
      const dayDoseTimes = getDoseTimesForDay(dayIndex);
      if (dayDoseTimes && dayDoseTimes.length > 0) {
        const doseTimes = dayDoseTimes.map(dt => ({ time: dt.time, dose: dt.dose }));
        const totalDose = getTotalDailyDose(doseTimes);
        doseEntries.push({
          date: new Date(currentDate),
          dose: totalDose,
          unit: medication.unit,
          medicationId: medication.id,
          medicationName: medication.medicationName,
          doseTimes: doseTimes,
        });
      } else {
        doseEntries.push({
          date: new Date(currentDate),
          dose: 0,
          unit: medication.unit,
          medicationId: medication.id,
          medicationName: medication.medicationName,
          isOffDay: true,
          doseTimes: config.enabledDoseTimes?.map(time => ({ time, dose: 0 })) ?? [],
        });
      }
    } else {
      const doseForDay = getDoseForDay(dayIndex);
      doseEntries.push({
        date: new Date(currentDate),
        dose: doseForDay || 0,
        unit: medication.unit,
        medicationId: medication.id,
        medicationName: medication.medicationName,
        isOffDay: !doseForDay,
      });
    }

    currentDate = addDays(currentDate, 1);
  }

  return addTabletBreakdowns(doseEntries, medication);
}

/**
 * Calculate doses for multi-phase taper
 */
function calculateMultiPhaseDoses(medication: MedicationSchedule): DoseEntry[] {
  const config = medication.multiPhaseConfig;
  if (!config || !config.phases || config.phases.length === 0) return [];

  const doseEntries: DoseEntry[] = [];
  let currentDate = new Date(medication.startDate);
  let iterations = 0;

  // Check if using multiple dose times
  const doseTimesMode = config.doseTimesMode || 'single';
  const hasDoseTimes = doseTimesMode === 'multiple' && config.enabledDoseTimes && config.enabledDoseTimes.length > 0;

  for (const phase of config.phases) {
    if (iterations >= MAX_ITERATIONS) break;

    for (let day = 0; day < phase.durationDays; day++) {
      if (iterations >= MAX_ITERATIONS) break;
      iterations++;

      if (medication.endDate && currentDate > medication.endDate) {
        return addTabletBreakdowns(doseEntries, medication);
      }

      if (hasDoseTimes && phase.doseTimes && phase.doseTimes.length > 0) {
        const doseTimes = phase.doseTimes.map(dt => ({ time: dt.time, dose: dt.dose }));
        doseEntries.push({
          date: new Date(currentDate),
          dose: getTotalDailyDose(doseTimes),
          unit: medication.unit,
          medicationId: medication.id,
          medicationName: medication.medicationName,
          doseTimes: doseTimes,
        });
      } else {
        doseEntries.push({
          date: new Date(currentDate),
          dose: phase.dose,
          unit: medication.unit,
          medicationId: medication.id,
          medicationName: medication.medicationName,
        });
      }

      currentDate = addDays(currentDate, 1);
    }
  }

  return addTabletBreakdowns(doseEntries, medication);
}

/**
 * Get all unique doses from a medication schedule
 * Includes doses from all dose times when in multiple mode
 */
export function getUniqueDoses(medication: MedicationSchedule): number[] {
  const doses: number[] = [];

  switch (medication.scheduleType) {
    case 'linear':
      if (medication.linearConfig) {
        const config = medication.linearConfig;

        // Check if using multiple dose times
        if (config.doseTimesMode === 'multiple' && config.startingDoseTimes && config.startingDoseTimes.length > 0) {
          // Collect all starting doses from dose times
          const startingDoses = config.startingDoseTimes.map(dt => dt.dose);

          // For each dose time, calculate the titration range
          for (const startDose of startingDoses) {
            let dose = startDose;
            if (dose > 0) doses.push(dose);

            if (config.changeAmount > 0) {
              if (config.titrationDirection === 'increase' && config.maximumDose !== undefined) {
                while (dose < config.maximumDose) {
                  dose += config.changeAmount;
                  if (dose > config.maximumDose) dose = config.maximumDose;
                  doses.push(dose);
                  if (dose >= config.maximumDose) break;
                }
              } else if (config.titrationDirection === 'decrease') {
                const minDose = config.minimumDose ?? 0;
                while (dose > minDose) {
                  dose -= config.changeAmount;
                  if (dose < minDose) dose = minDose;
                  doses.push(dose);
                  if (dose <= minDose) break;
                }
              }
            }
          }
        } else {
          // Original single dose logic
          let dose = config.startingDose;

          if (dose > 0) {
            doses.push(dose);
          }

          if (config.changeAmount > 0) {
            if (config.titrationDirection === 'increase') {
              if (config.maximumDose !== undefined) {
                while (dose < config.maximumDose) {
                  dose += config.changeAmount;
                  if (dose > config.maximumDose) {
                    dose = config.maximumDose;
                  }
                  doses.push(dose);
                  if (dose >= config.maximumDose) break;
                }
              }
            } else if (config.titrationDirection === 'decrease') {
              const minDose = config.minimumDose ?? 0;
              while (dose > minDose) {
                dose -= config.changeAmount;
                if (dose < minDose) {
                  dose = minDose;
                }
                doses.push(dose);
                if (dose <= minDose) break;
              }
            }
          }
        }
      }
      break;

    case 'cyclic':
      if (medication.cyclicConfig) {
        const config = medication.cyclicConfig;
        if (config.doseTimesMode === 'multiple' && config.doseTimes && config.doseTimes.length > 0) {
          config.doseTimes.forEach(dt => { if (dt.dose > 0) doses.push(dt.dose); });
        } else {
          doses.push(config.dose);
        }
      }
      break;

    case 'dayOfWeek':
      if (medication.dayOfWeekConfig) {
        const config = medication.dayOfWeekConfig;

        if (config.doseTimesMode === 'multiple') {
          // Collect doses from all day's dose times
          const allDayTimes = [
            config.mondayTimes, config.tuesdayTimes, config.wednesdayTimes,
            config.thursdayTimes, config.fridayTimes, config.saturdayTimes, config.sundayTimes,
          ];
          allDayTimes.forEach(dayTimes => {
            if (dayTimes) {
              dayTimes.forEach(dt => { if (dt.dose > 0) doses.push(dt.dose); });
            }
          });
        } else {
          [config.monday, config.tuesday, config.wednesday, config.thursday,
            config.friday, config.saturday, config.sunday]
            .forEach(d => { if (d !== undefined && d > 0) doses.push(d); });
        }
      }
      break;

    case 'multiPhase':
      if (medication.multiPhaseConfig) {
        const config = medication.multiPhaseConfig;
        config.phases.forEach(phase => {
          if (config.doseTimesMode === 'multiple' && phase.doseTimes && phase.doseTimes.length > 0) {
            phase.doseTimes.forEach(dt => { if (dt.dose > 0) doses.push(dt.dose); });
          } else {
            if (phase.dose > 0) doses.push(phase.dose);
          }
        });
      }
      break;
  }

  return Array.from(new Set(doses)).filter(d => d > 0);
}

/**
 * Check if a medication schedule is complete
 */
export function isMedicationComplete(medication: MedicationSchedule, doses: DoseEntry[]): boolean {
  if (doses.length === 0) return false;

  const lastDose = doses[doses.length - 1];

  // Check based on schedule type
  if (medication.scheduleType === 'linear' && medication.linearConfig) {
    const config = medication.linearConfig;

    if (config.titrationDirection === 'decrease') {
      const minimumDose = config.minimumDose ?? 0;
      return lastDose.dose <= minimumDose;
    }

    if (config.titrationDirection === 'increase') {
      if (config.maximumDose !== undefined) {
        return lastDose.dose >= config.maximumDose;
      }
    }
  }

  // Check if reached end date
  if (medication.endDate) {
    return lastDose.date >= medication.endDate;
  }

  return false;
}
