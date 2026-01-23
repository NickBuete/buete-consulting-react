/**
 * PD Regimen Calculator
 * Calculates dose schedules for multi-medication regimens with cross-titration support
 */

import { addDays, isSameDay } from 'date-fns';
import type {
  PDRegimen,
  PDRegimenDayDose,
  PDRegimenMedication,
  PDRegimenMedicationDayDose,
  PDDayDose,
  PDSlotDose,
  PDTimeSlot,
  CrossTitrationLink,
  DoseChangeType,
  PDTitrationConfig,
  TitrationDirection,
} from '../../types/parkinsonsMedications';
import {
  LEVODOPA_EQUIVALENT_FACTORS,
  calculateTotalDose,
  calculateTotalTablets,
} from '../../types/parkinsonsMedications';

const MAX_ITERATIONS = 1000;
const DEFAULT_DURATION_DAYS = 90;

/**
 * Calculate complete schedule for a multi-medication regimen
 */
export function calculateRegimenSchedule(regimen: PDRegimen): PDRegimenDayDose[] {
  const { medications, crossTitrationLinks, startDate, endDate, timeSlots } = regimen;
  const finalDate = endDate || addDays(startDate, DEFAULT_DURATION_DAYS);

  // First, calculate individual schedules for each medication
  const individualSchedules = new Map<string, PDDayDose[]>();

  for (const med of medications) {
    const schedule = calculateMedicationSchedule(med, startDate, finalDate, timeSlots);
    individualSchedules.set(med.id, schedule);
  }

  // Apply cross-titration synchronization if any
  for (const link of crossTitrationLinks) {
    applyCrossTitrationSync(individualSchedules, link, medications);
  }

  // Merge into combined daily schedule
  const combinedSchedule: PDRegimenDayDose[] = [];
  let currentDate = new Date(startDate);
  let iterations = 0;

  while (currentDate <= finalDate && iterations < MAX_ITERATIONS) {
    const previousDay = combinedSchedule.length > 0
      ? combinedSchedule[combinedSchedule.length - 1]
      : null;

    const dayDose = createRegimenDayDose(
      currentDate,
      medications,
      individualSchedules,
      previousDay
    );
    combinedSchedule.push(dayDose);

    currentDate = addDays(currentDate, 1);
    iterations++;
  }

  return combinedSchedule;
}

/**
 * Calculate schedule for a single medication within a regimen
 */
function calculateMedicationSchedule(
  med: PDRegimenMedication,
  startDate: Date,
  endDate: Date,
  timeSlots: PDTimeSlot[]
): PDDayDose[] {
  const doses: PDDayDose[] = [];
  let currentDate = new Date(startDate);
  let iterations = 0;

  if (med.scheduleMode === 'hold-steady') {
    // Static doses throughout
    const slotDoses = med.steadySlotDoses || createEmptySlotDoses(timeSlots);

    while (currentDate <= endDate && iterations < MAX_ITERATIONS) {
      doses.push(createDayDose(currentDate, slotDoses, med.selectedPreparation.strength));
      currentDate = addDays(currentDate, 1);
      iterations++;
    }
  } else {
    // Titrating or discontinuing
    const config = med.scheduleMode === 'titrating'
      ? med.titrationConfig
      : med.taperConfig;

    if (!config) {
      // No config - treat as static with zero doses
      const slotDoses = createEmptySlotDoses(timeSlots);
      while (currentDate <= endDate && iterations < MAX_ITERATIONS) {
        doses.push(createDayDose(currentDate, slotDoses, med.selectedPreparation.strength));
        currentDate = addDays(currentDate, 1);
        iterations++;
      }
    } else {
      // Apply titration logic using shared titration orders
      let currentSlotDoses = config.startingSlotDoses.map(sd => ({ ...sd }));
      let daysUntilChange = config.intervalDays;

      // Get unique titration orders from slots marked as 'titrate'
      const titratingSlots = currentSlotDoses.filter(sd => sd.titrationMode === 'titrate');
      const uniqueOrders = Array.from(new Set(titratingSlots.map(sd => sd.titrationOrder || 1))).sort((a, b) => a - b);

      let currentOrderIndex = 0;
      let incrementsAtCurrentOrder = 0;

      while (currentDate <= endDate && iterations < MAX_ITERATIONS) {
        doses.push(createDayDose(currentDate, currentSlotDoses, med.selectedPreparation.strength));

        currentDate = addDays(currentDate, 1);
        daysUntilChange--;

        if (daysUntilChange <= 0 && uniqueOrders.length > 0) {
          const currentOrder = uniqueOrders[currentOrderIndex];

          // Find all slots at the current order
          const slotsAtCurrentOrder = currentSlotDoses.filter(
            sd => sd.titrationMode === 'titrate' && sd.titrationOrder === currentOrder
          );

          // Check if any slot at this order can still be titrated
          const canTitrateAny = slotsAtCurrentOrder.some(sd =>
            canSlotBeTitrated(sd, config.titrationDirection, config.maxTabletsPerDose, config.minimumTabletCount ?? 0)
          );

          if (canTitrateAny) {
            // Apply titration to ALL slots at the current order
            currentSlotDoses = applyTitrationToSlotsAtOrder(
              currentSlotDoses,
              currentOrder,
              config.changeAmount,
              config.titrationDirection,
              config.maxTabletsPerDose,
              config.minimumTabletCount ?? 0
            );

            incrementsAtCurrentOrder++;

            // Move to next order after incrementsPerSlot changes
            if (incrementsAtCurrentOrder >= config.incrementsPerSlot) {
              incrementsAtCurrentOrder = 0;
              currentOrderIndex++;

              // Check if all orders are done
              if (currentOrderIndex >= uniqueOrders.length) {
                // Wrap around if any slot can still be titrated
                const anyCanContinue = currentSlotDoses.some(sd =>
                  sd.titrationMode === 'titrate' &&
                  canSlotBeTitrated(sd, config.titrationDirection, config.maxTabletsPerDose, config.minimumTabletCount ?? 0)
                );
                if (anyCanContinue) {
                  currentOrderIndex = 0;
                }
              }
            }
          } else {
            // Current order is done (all slots at limit), move to next
            currentOrderIndex++;
            if (currentOrderIndex >= uniqueOrders.length) {
              currentOrderIndex = 0;
            }
            incrementsAtCurrentOrder = 0;
          }

          daysUntilChange = config.intervalDays;
        }

        iterations++;
      }
    }
  }

  return doses;
}

/**
 * Apply cross-titration synchronization between two medications
 */
function applyCrossTitrationSync(
  schedules: Map<string, PDDayDose[]>,
  link: CrossTitrationLink,
  medications: PDRegimenMedication[]
): void {
  const increasingSchedule = schedules.get(link.increasingMedId);
  const decreasingSchedule = schedules.get(link.decreasingMedId);

  if (!increasingSchedule || !decreasingSchedule) return;

  const increasingMed = medications.find(m => m.id === link.increasingMedId);
  const decreasingMed = medications.find(m => m.id === link.decreasingMedId);

  if (!increasingMed || !decreasingMed) return;

  // Find all days where the increasing medication changes
  const increaseDays = findChangeDaysInSchedule(increasingSchedule, 'increase');

  for (const { date: increaseDate, index: increaseIndex } of increaseDays) {
    let decreaseDateIndex: number;

    switch (link.syncMode) {
      case 'same-day':
        // Find the same date in decreasing schedule
        decreaseDateIndex = decreasingSchedule.findIndex(d => isSameDay(d.date, increaseDate));
        break;

      case 'offset-days':
        // Find date N days after increase
        const offsetDate = addDays(increaseDate, link.offsetDays || 0);
        decreaseDateIndex = decreasingSchedule.findIndex(d => isSameDay(d.date, offsetDate));
        break;

      case 'alternating':
        // Find next day after increase that isn't already a change day
        const nextDay = addDays(increaseDate, Math.ceil((link.offsetDays || 3) / 2));
        decreaseDateIndex = decreasingSchedule.findIndex(d => isSameDay(d.date, nextDay));
        break;

      default:
        decreaseDateIndex = -1;
    }

    // Apply decrease at the found date
    if (decreaseDateIndex >= 0 && link.ratio) {
      applyDecreaseAtIndex(
        decreasingSchedule,
        decreaseDateIndex,
        link.ratio.decreaseAmount,
        decreasingMed
      );
    }
  }
}

/**
 * Find all days where a change occurred in a schedule
 */
function findChangeDaysInSchedule(
  schedule: PDDayDose[],
  direction: 'increase' | 'decrease'
): { date: Date; index: number }[] {
  const changes: { date: Date; index: number }[] = [];

  for (let i = 1; i < schedule.length; i++) {
    const prev = schedule[i - 1];
    const curr = schedule[i];
    const diff = curr.totalTablets - prev.totalTablets;

    if (direction === 'increase' && diff > 0) {
      changes.push({ date: curr.date, index: i });
    } else if (direction === 'decrease' && diff < 0) {
      changes.push({ date: curr.date, index: i });
    }
  }

  return changes;
}

/**
 * Apply a decrease at a specific index in the schedule
 */
function applyDecreaseAtIndex(
  schedule: PDDayDose[],
  startIndex: number,
  decreaseAmount: number,
  med: PDRegimenMedication
): void {
  // Apply decrease to all days from this index forward
  for (let i = startIndex; i < schedule.length; i++) {
    const day = schedule[i];
    const newSlotDoses = day.slotDoses.map(sd => ({
      ...sd,
      tabletCount: Math.max(0, sd.tabletCount - decreaseAmount / day.slotDoses.length),
    }));

    schedule[i] = createDayDose(day.date, newSlotDoses, med.selectedPreparation.strength);
  }
}

/**
 * Create combined day dose for all medications in regimen
 */
function createRegimenDayDose(
  date: Date,
  medications: PDRegimenMedication[],
  schedules: Map<string, PDDayDose[]>,
  previousDay: PDRegimenDayDose | null
): PDRegimenDayDose {
  const medicationDoses: PDRegimenMedicationDayDose[] = medications.map(med => {
    const schedule = schedules.get(med.id);
    const dayDose = schedule?.find(d => isSameDay(d.date, date));
    const prevMedDose = previousDay?.medicationDoses.find(m => m.medicationId === med.id);

    const changeFromYesterday = determineChangeType(dayDose, prevMedDose);

    return {
      medicationId: med.id,
      medicationName: med.medication.genericName,
      preparationName: `${med.selectedPreparation.brandName} ${med.selectedPreparation.strength}${med.selectedPreparation.unit}`,
      color: med.color,
      slotDoses: dayDose?.slotDoses || [],
      totalDose: dayDose?.totalDose || 0,
      totalTablets: dayDose?.totalTablets || 0,
      changeFromYesterday,
    };
  });

  // Calculate combined totals
  const combinedTotals = calculateCombinedTotals(medicationDoses, medications);

  return {
    date: new Date(date),
    medicationDoses,
    combinedTotals,
  };
}

/**
 * Determine the type of change from yesterday
 */
function determineChangeType(
  current: PDDayDose | undefined,
  previous: PDRegimenMedicationDayDose | undefined
): DoseChangeType {
  const currentTablets = current?.totalTablets || 0;
  const previousTablets = previous?.totalTablets || 0;

  if (!previous && currentTablets > 0) {
    return 'started';
  }
  if (previous && currentTablets === 0 && previousTablets > 0) {
    return 'stopped';
  }
  if (currentTablets > previousTablets) {
    return 'increased';
  }
  if (currentTablets < previousTablets) {
    return 'decreased';
  }
  return 'unchanged';
}

/**
 * Calculate combined totals including levodopa equivalents
 */
function calculateCombinedTotals(
  dayDoses: PDRegimenMedicationDayDose[],
  medications: PDRegimenMedication[]
): PDRegimenDayDose['combinedTotals'] {
  let totalLevodopa = 0;
  let totalDopamineAgonistEquiv = 0;
  let totalLED = 0;

  for (const dose of dayDoses) {
    const med = medications.find(m => m.id === dose.medicationId);
    if (!med) continue;

    const category = med.medication.category;
    const factor = LEVODOPA_EQUIVALENT_FACTORS[med.medication.id] || 1;

    if (category === 'levodopa-combination') {
      totalLevodopa += dose.totalDose;
      totalLED += dose.totalDose * factor;
    } else if (category === 'dopamine-agonist') {
      totalDopamineAgonistEquiv += dose.totalDose * factor;
      totalLED += dose.totalDose * factor;
    } else {
      // MAO-B inhibitors, etc.
      totalLED += dose.totalDose * factor;
    }
  }

  return {
    totalLevodopa,
    totalDopamineAgonist: totalDopamineAgonistEquiv,
    totalLED,
  };
}

/**
 * Check if titration can continue
 */
function canContinueTitrating(
  currentSlotDoses: PDSlotDose[],
  config: PDTitrationConfig
): boolean {
  if (config.targetSlotDoses) {
    const allAtTarget = currentSlotDoses.every(current => {
      const target = config.targetSlotDoses!.find(t => t.slotId === current.slotId);
      if (!target) return true;

      if (config.titrationDirection === 'increase') {
        return current.tabletCount >= target.tabletCount;
      } else {
        return current.tabletCount <= target.tabletCount;
      }
    });

    if (allAtTarget) return false;
  }

  const allAtLimit = currentSlotDoses.every(sd => {
    if (config.titrationDirection === 'increase') {
      return sd.tabletCount >= config.maxTabletsPerDose;
    } else {
      return sd.tabletCount <= (config.minimumTabletCount ?? 0);
    }
  });

  return !allAtLimit;
}

/**
 * Check if a slot can still be titrated based on its limits
 */
function canSlotBeTitrated(
  sd: PDSlotDose,
  direction: TitrationDirection,
  globalMax: number,
  globalMin: number
): boolean {
  const slotMax = sd.maxTablets ?? globalMax;
  const slotMin = sd.minTablets ?? globalMin;

  if (direction === 'increase') {
    return sd.tabletCount < slotMax;
  } else if (direction === 'decrease') {
    return sd.tabletCount > slotMin;
  }
  return false;
}

/**
 * Apply titration to all slots at a given titration order
 * This allows multiple slots with the same order number to change together
 */
function applyTitrationToSlotsAtOrder(
  slotDoses: PDSlotDose[],
  order: number,
  changeAmount: number,
  direction: TitrationDirection,
  globalMax: number,
  globalMin: number
): PDSlotDose[] {
  return slotDoses.map(sd => {
    // Only titrate slots that match the order and are in titrate mode
    if (sd.titrationMode !== 'titrate' || sd.titrationOrder !== order) {
      return sd;
    }

    const slotMax = sd.maxTablets ?? globalMax;
    const slotMin = sd.minTablets ?? globalMin;
    let newCount = sd.tabletCount;

    if (direction === 'increase') {
      newCount = Math.min(sd.tabletCount + changeAmount, slotMax);
    } else if (direction === 'decrease') {
      newCount = Math.max(sd.tabletCount - changeAmount, slotMin);
    }

    return {
      ...sd,
      tabletCount: newCount,
    };
  });
}

/**
 * Create a day dose
 */
function createDayDose(
  date: Date,
  slotDoses: PDSlotDose[],
  strength: number
): PDDayDose {
  const totalTablets = slotDoses.reduce((sum, sd) => sum + sd.tabletCount, 0);
  const totalDose = totalTablets * strength;

  return {
    date: new Date(date),
    slotDoses: slotDoses.map(sd => ({ ...sd })),
    totalDose,
    totalTablets,
  };
}

/**
 * Create empty slot doses
 */
function createEmptySlotDoses(timeSlots: PDTimeSlot[]): PDSlotDose[] {
  return timeSlots.map((slot, index) => ({
    slotId: slot.id,
    tabletCount: 0,
    titrationMode: 'titrate' as const,
    titrationOrder: index + 1,
  }));
}

// ==========================================
// REGIMEN ANALYSIS UTILITIES
// ==========================================

export interface RegimenSummary {
  totalDays: number;
  medications: {
    id: string;
    name: string;
    startingDose: number;
    endingDose: number;
    totalTabletsNeeded: number;
    halfTabletsNeeded: number;
    changeCount: number;
  }[];
  crossTitrationCount: number;
  peakLED: number;
  averageLED: number;
}

/**
 * Generate a summary of the regimen
 */
export function generateRegimenSummary(regimen: PDRegimen): RegimenSummary {
  const schedule = regimen.calculatedSchedule || calculateRegimenSchedule(regimen);

  if (schedule.length === 0) {
    return {
      totalDays: 0,
      medications: [],
      crossTitrationCount: 0,
      peakLED: 0,
      averageLED: 0,
    };
  }

  const medications = regimen.medications.map(med => {
    const medDoses = schedule.map(day =>
      day.medicationDoses.find(d => d.medicationId === med.id)
    );

    const firstDose = medDoses.find(d => d && d.totalTablets > 0);
    const lastDose = [...medDoses].reverse().find(d => d && d.totalTablets > 0);

    let changeCount = 0;
    for (let i = 1; i < medDoses.length; i++) {
      const prev = medDoses[i - 1];
      const curr = medDoses[i];
      if (prev && curr && prev.totalTablets !== curr.totalTablets) {
        changeCount++;
      }
    }

    const totalTabletsNeeded = medDoses.reduce(
      (sum, d) => sum + (d?.totalTablets || 0),
      0
    );

    let halfTabletsNeeded = 0;
    for (const dayDose of medDoses) {
      if (dayDose) {
        for (const sd of dayDose.slotDoses) {
          if (sd.tabletCount % 1 !== 0) {
            halfTabletsNeeded++;
          }
        }
      }
    }

    return {
      id: med.id,
      name: med.medication.genericName,
      startingDose: firstDose?.totalDose || 0,
      endingDose: lastDose?.totalDose || 0,
      totalTabletsNeeded,
      halfTabletsNeeded,
      changeCount,
    };
  });

  const leds = schedule.map(day => day.combinedTotals?.totalLED || 0);
  const peakLED = Math.max(...leds);
  const averageLED = leds.reduce((a, b) => a + b, 0) / leds.length;

  return {
    totalDays: schedule.length,
    medications,
    crossTitrationCount: regimen.crossTitrationLinks.length,
    peakLED,
    averageLED,
  };
}

/**
 * Get weekly summary of a regimen
 */
export interface WeeklySummary {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  medications: {
    id: string;
    name: string;
    averageDailyTablets: number;
    averageDailyDose: number;
  }[];
  averageLED: number;
}

export function getWeeklySummaries(schedule: PDRegimenDayDose[]): WeeklySummary[] {
  const weeks: WeeklySummary[] = [];

  for (let i = 0; i < schedule.length; i += 7) {
    const weekDays = schedule.slice(i, Math.min(i + 7, schedule.length));
    if (weekDays.length === 0) continue;

    const weekNumber = Math.floor(i / 7) + 1;

    // Get unique medication IDs
    const medIds = new Set<string>();
    for (const day of weekDays) {
      for (const medDose of day.medicationDoses) {
        medIds.add(medDose.medicationId);
      }
    }

    const medications = Array.from(medIds).map(medId => {
      const medDoses = weekDays.map(day =>
        day.medicationDoses.find(d => d.medicationId === medId)
      );

      const totalTablets = medDoses.reduce((sum, d) => sum + (d?.totalTablets || 0), 0);
      const totalDose = medDoses.reduce((sum, d) => sum + (d?.totalDose || 0), 0);

      return {
        id: medId,
        name: medDoses[0]?.medicationName || '',
        averageDailyTablets: totalTablets / weekDays.length,
        averageDailyDose: totalDose / weekDays.length,
      };
    });

    const totalLED = weekDays.reduce(
      (sum, day) => sum + (day.combinedTotals?.totalLED || 0),
      0
    );

    weeks.push({
      weekNumber,
      startDate: weekDays[0].date,
      endDate: weekDays[weekDays.length - 1].date,
      medications,
      averageLED: totalLED / weekDays.length,
    });
  }

  return weeks;
}
