/**
 * PD Schedule Calculator
 * Calculates dose schedules for single medications in Parkinson's disease titrations
 */

import { addDays, isSameDay } from 'date-fns';
import type {
  PDSchedule,
  PDDayDose,
  PDSlotDose,
  PDTitrationConfig,
  PDTimeSlot,
  PDPreparation,
  TitrationDirection,
} from '../../types/parkinsonsMedications';

const MAX_ITERATIONS = 1000;
const DEFAULT_DURATION_DAYS = 90;

/**
 * Calculate the full dose schedule for a single PD medication
 */
export function calculatePDSchedule(schedule: PDSchedule): PDDayDose[] {
  const { scheduleMode, startDate, endDate, timeSlots, selectedPreparation } = schedule;
  const finalDate = endDate || addDays(startDate, DEFAULT_DURATION_DAYS);

  switch (scheduleMode) {
    case 'hold-steady':
      return generateStaticSchedule(
        schedule.steadySlotDoses || createEmptySlotDoses(timeSlots),
        startDate,
        finalDate,
        selectedPreparation
      );

    case 'titrating':
    case 'discontinuing':
      if (!schedule.titrationConfig) {
        // No titration config - treat as static
        return generateStaticSchedule(
          schedule.steadySlotDoses || createEmptySlotDoses(timeSlots),
          startDate,
          finalDate,
          selectedPreparation
        );
      }
      return calculateTitrationSchedule(
        schedule.titrationConfig,
        startDate,
        finalDate,
        selectedPreparation,
        timeSlots
      );

    default:
      return [];
  }
}

/**
 * Generate a static (hold-steady) schedule
 */
function generateStaticSchedule(
  slotDoses: PDSlotDose[],
  startDate: Date,
  endDate: Date,
  prep: PDPreparation
): PDDayDose[] {
  const doses: PDDayDose[] = [];
  let currentDate = new Date(startDate);
  let iterations = 0;

  while (currentDate <= endDate && iterations < MAX_ITERATIONS) {
    doses.push(createDayDose(currentDate, slotDoses, prep));
    currentDate = addDays(currentDate, 1);
    iterations++;
  }

  return doses;
}

/**
 * Calculate a titration schedule with sequential slot changes
 * Supports shared titration orders (multiple slots changing together)
 * and per-slot min/max limits
 */
function calculateTitrationSchedule(
  config: PDTitrationConfig,
  startDate: Date,
  endDate: Date,
  prep: PDPreparation,
  timeSlots: PDTimeSlot[]
): PDDayDose[] {
  const doses: PDDayDose[] = [];
  let currentSlotDoses = config.startingSlotDoses.map(sd => ({ ...sd }));
  let currentDate = new Date(startDate);

  // Get unique titration orders, sorted
  const titratingSlots = currentSlotDoses.filter(sd => sd.titrationMode === 'titrate');
  const uniqueOrders = Array.from(new Set(titratingSlots.map(sd => sd.titrationOrder || 1))).sort((a, b) => a - b);

  if (uniqueOrders.length === 0) {
    // No titrating slots - generate static schedule
    let iterations = 0;
    while (currentDate <= endDate && iterations < MAX_ITERATIONS) {
      doses.push(createDayDose(currentDate, currentSlotDoses, prep));
      currentDate = addDays(currentDate, 1);
      iterations++;
    }
    return doses;
  }

  let daysUntilChange = config.intervalDays;
  let currentOrderIndex = 0;
  let incrementsAtCurrentOrder = 0;
  let iterations = 0;

  while (currentDate <= endDate && iterations < MAX_ITERATIONS) {
    // Record today's dose
    doses.push(createDayDose(currentDate, currentSlotDoses, prep));

    // Move to next day
    currentDate = addDays(currentDate, 1);
    daysUntilChange--;

    // Check if we should titrate
    if (daysUntilChange <= 0) {
      const currentOrder = uniqueOrders[currentOrderIndex];
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

        // Move to next order?
        if (incrementsAtCurrentOrder >= config.incrementsPerSlot) {
          incrementsAtCurrentOrder = 0;
          currentOrderIndex++;

          // Check if all orders are done (all slots at their limits)
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
        // Current order is done, move to next
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

  return doses;
}

/**
 * Check if a slot can still be titrated
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
 * Apply titration to all slots at a given order
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
    // Only titrate slots that match the order and mode
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
 * Create a day dose entry
 */
function createDayDose(
  date: Date,
  slotDoses: PDSlotDose[],
  prep: PDPreparation
): PDDayDose {
  const totalTablets = slotDoses.reduce((sum, sd) => sum + sd.tabletCount, 0);
  const totalDose = totalTablets * prep.strength;

  return {
    date: new Date(date),
    slotDoses: slotDoses.map(sd => ({ ...sd })), // Deep copy
    totalDose,
    totalTablets,
  };
}

/**
 * Create empty slot doses for all time slots
 */
function createEmptySlotDoses(timeSlots: PDTimeSlot[]): PDSlotDose[] {
  return timeSlots.map((slot, index) => ({
    slotId: slot.id,
    tabletCount: 0,
    titrationMode: 'titrate' as const,
    titrationOrder: index + 1,
  }));
}

/**
 * Get the dose for a specific date from a schedule
 */
export function getDoseForDate(
  doses: PDDayDose[],
  date: Date
): PDDayDose | undefined {
  return doses.find(d => isSameDay(d.date, date));
}

/**
 * Find all days where a dose change occurred
 */
export function findChangeDays(
  doses: PDDayDose[]
): { date: Date; changeAmount: number; direction: 'increase' | 'decrease' }[] {
  const changeDays: { date: Date; changeAmount: number; direction: 'increase' | 'decrease' }[] = [];

  for (let i = 1; i < doses.length; i++) {
    const prev = doses[i - 1];
    const curr = doses[i];

    const diff = curr.totalTablets - prev.totalTablets;

    if (diff !== 0) {
      changeDays.push({
        date: curr.date,
        changeAmount: Math.abs(diff),
        direction: diff > 0 ? 'increase' : 'decrease',
      });
    }
  }

  return changeDays;
}

/**
 * Calculate total tablets needed for a schedule
 */
export function calculateTotalTabletsNeeded(doses: PDDayDose[]): number {
  return doses.reduce((sum, d) => sum + d.totalTablets, 0);
}

/**
 * Calculate half tablets needed for a schedule
 */
export function calculateHalfTabletsNeeded(doses: PDDayDose[]): number {
  let halfCount = 0;

  for (const dose of doses) {
    for (const slotDose of dose.slotDoses) {
      // Check if tablet count has a .5
      if (slotDose.tabletCount % 1 !== 0) {
        halfCount++;
      }
    }
  }

  return halfCount;
}

/**
 * Get unique dose levels in a schedule
 */
export function getUniqueDoseLevels(doses: PDDayDose[]): number[] {
  const levels = new Set<number>();

  for (const dose of doses) {
    levels.add(dose.totalDose);
  }

  return Array.from(levels).sort((a, b) => a - b);
}

/**
 * Generate a titration summary
 */
export interface TitrationSummary {
  startingDose: number;
  endingDose: number;
  peakDose: number;
  minimumDose: number;
  totalChanges: number;
  totalDays: number;
  averageDose: number;
}

export function generateTitrationSummary(doses: PDDayDose[]): TitrationSummary {
  if (doses.length === 0) {
    return {
      startingDose: 0,
      endingDose: 0,
      peakDose: 0,
      minimumDose: 0,
      totalChanges: 0,
      totalDays: 0,
      averageDose: 0,
    };
  }

  const changeDays = findChangeDays(doses);
  const allDoses = doses.map(d => d.totalDose);

  return {
    startingDose: doses[0].totalDose,
    endingDose: doses[doses.length - 1].totalDose,
    peakDose: Math.max(...allDoses),
    minimumDose: Math.min(...allDoses),
    totalChanges: changeDays.length,
    totalDays: doses.length,
    averageDose: allDoses.reduce((a, b) => a + b, 0) / allDoses.length,
  };
}

/**
 * Validate a titration configuration
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateTitrationConfig(
  config: PDTitrationConfig,
  prep: PDPreparation,
  allowHalves: boolean
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check change amount
  if (config.changeAmount <= 0) {
    errors.push('Change amount must be greater than 0');
  }

  // Check if halves are being used when not allowed
  if (!allowHalves) {
    if (config.changeAmount % 1 !== 0) {
      errors.push('Half tablets are not allowed, but change amount includes halves');
    }

    for (const sd of config.startingSlotDoses) {
      if (sd.tabletCount % 1 !== 0) {
        errors.push('Half tablets are not allowed, but starting doses include halves');
        break;
      }
    }
  }

  // Check if preparation can be halved
  if (!prep.canBeHalved && config.changeAmount === 0.5) {
    errors.push(`${prep.brandName} ${prep.strength}${prep.unit} cannot be halved`);
  }

  // Check interval
  if (config.intervalDays < 1) {
    errors.push('Interval must be at least 1 day');
  }

  // Check sequence
  if (config.titrationSequence.length === 0) {
    warnings.push('No titration sequence defined - no changes will be made');
  }

  // Check max tablets per dose
  for (const sd of config.startingSlotDoses) {
    if (sd.tabletCount > config.maxTabletsPerDose) {
      warnings.push(`Starting dose for ${sd.slotId} exceeds max tablets per dose`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
