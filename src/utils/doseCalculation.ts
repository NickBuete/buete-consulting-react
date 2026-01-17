import { addDays, isSameMonth, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameDay, format, getDay, differenceInDays } from 'date-fns';
import type {
  MedicationSchedule,
  DoseEntry,
  CalendarDay,
  MedicationUnit,
  Preparation,
  TabletBreakdown,
  PreparationSummary,
  PreparationRequirement,
} from '../types/doseCalculator';

const MAX_ITERATIONS = 1000; // Safety limit to prevent infinite loops
const DEFAULT_MAINTAIN_DAYS = 90; // Default duration for 'maintain' titration
const MAX_UNITS_PER_DOSE = 4; // Maximum number of tablet units per dose

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

  while (currentDate <= endDate && iterations < MAX_ITERATIONS) {
    iterations++;

    const daysSinceStart = differenceInDays(currentDate, medication.startDate);
    const dayInCycle = daysSinceStart % cycleLength;
    const isOnDay = dayInCycle < config.daysOn;

    doseEntries.push({
      date: new Date(currentDate),
      dose: isOnDay ? config.dose : 0,
      unit: medication.unit,
      medicationId: medication.id,
      medicationName: medication.medicationName,
      isOffDay: !isOnDay,
    });

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

  while (currentDate <= endDate && iterations < MAX_ITERATIONS) {
    iterations++;

    const dayIndex = getDay(currentDate);
    const dose = getDoseForDay(dayIndex);

    doseEntries.push({
      date: new Date(currentDate),
      dose: dose ?? 0,
      unit: medication.unit,
      medicationId: medication.id,
      medicationName: medication.medicationName,
      isOffDay: dose === undefined || dose === 0,
    });

    currentDate = addDays(currentDate, 1);
  }

  return addTabletBreakdowns(doseEntries, medication);
}

/**
 * Calculate doses for multi-phase taper (e.g., SNRI detox)
 */
function calculateMultiPhaseDoses(medication: MedicationSchedule): DoseEntry[] {
  const config = medication.multiPhaseConfig;
  if (!config || config.phases.length === 0) return [];

  const doseEntries: DoseEntry[] = [];
  let currentDate = new Date(medication.startDate);

  for (const phase of config.phases) {
    for (let day = 0; day < phase.durationDays; day++) {
      const doseDate = new Date(currentDate);

      // Stop if we've reached the end date
      if (medication.endDate && doseDate > medication.endDate) {
        return addTabletBreakdowns(doseEntries, medication);
      }

      doseEntries.push({
        date: doseDate,
        dose: phase.dose,
        unit: medication.unit,
        medicationId: medication.id,
        medicationName: medication.medicationName,
        isOffDay: phase.dose === 0,
      });

      currentDate = addDays(currentDate, 1);
    }
  }

  return addTabletBreakdowns(doseEntries, medication);
}

/**
 * Add tablet breakdown to dose entries if preparations are specified
 */
function addTabletBreakdowns(doseEntries: DoseEntry[], medication: MedicationSchedule): DoseEntry[] {
  if (medication.preparationMode === 'none') {
    return doseEntries;
  }

  const preparations = medication.preparationMode === 'specify'
    ? medication.preparations
    : medication.optimisedPreparations;

  if (!preparations || preparations.length === 0) {
    return doseEntries;
  }

  return doseEntries.map(entry => {
    if (entry.isOffDay || entry.dose === 0) {
      return entry;
    }

    const breakdown = calculateTabletBreakdown(entry.dose, preparations);
    return {
      ...entry,
      tabletBreakdown: breakdown,
    };
  });
}

/**
 * Calculate the tablet breakdown for a given dose using available preparations
 */
export function calculateTabletBreakdown(
  targetDose: number,
  preparations: Preparation[]
): TabletBreakdown[] | undefined {
  if (preparations.length === 0) return undefined;

  // Sort preparations by strength descending for greedy approach
  const sortedPreps = [...preparations].sort((a, b) => b.strength - a.strength);

  const result: TabletBreakdown[] = [];
  let remaining = targetDose;
  let totalUnits = 0;

  for (const prep of sortedPreps) {
    if (remaining <= 0) break;

    // Try whole tablets first
    const wholeCount = Math.floor(remaining / prep.strength);
    if (wholeCount > 0 && totalUnits + wholeCount <= MAX_UNITS_PER_DOSE) {
      const useCount = Math.min(wholeCount, MAX_UNITS_PER_DOSE - totalUnits);
      result.push({ preparation: prep, quantity: useCount });
      remaining -= useCount * prep.strength;
      totalUnits += useCount;
    }

    // Try half tablet if possible and needed
    if (prep.canBeHalved && remaining > 0 && remaining >= prep.strength / 2 && totalUnits < MAX_UNITS_PER_DOSE) {
      const halfStrength = prep.strength / 2;
      if (remaining >= halfStrength) {
        result.push({ preparation: prep, quantity: 0.5 });
        remaining -= halfStrength;
        totalUnits += 0.5;
      }
    }
  }

  // Check if we achieved the target dose (within small tolerance for floating point)
  if (Math.abs(remaining) > 0.001) {
    return undefined; // Could not achieve target dose
  }

  return result;
}

/**
 * Optimize preparations for a set of doses (for "Optimise For Me" mode)
 * Returns the minimum set of preparations that can achieve all doses
 */
export function optimizePreparations(
  doses: number[],
  unit: MedicationUnit
): Preparation[] {
  const uniqueDoses = Array.from(new Set(doses.filter(d => d > 0))).sort((a, b) => b - a);

  if (uniqueDoses.length === 0) return [];

  // Try to find optimal preparation set
  // Start with common divisors approach
  const maxDose = Math.max(...uniqueDoses);
  const gcd = findGCD(uniqueDoses);

  // Generate candidate preparation strengths
  const candidates: number[] = [];

  // Add factors of the max dose that work well
  for (let i = 1; i <= Math.sqrt(maxDose); i++) {
    if (maxDose % i === 0) {
      candidates.push(i);
      candidates.push(maxDose / i);
    }
  }

  // Add the GCD and multiples
  if (gcd > 0) {
    candidates.push(gcd);
    for (let mult = 2; mult <= MAX_UNITS_PER_DOSE; mult++) {
      if (gcd * mult <= maxDose) {
        candidates.push(gcd * mult);
      }
    }
  }

  // Add each unique dose as a candidate
  uniqueDoses.forEach(d => candidates.push(d));

  // Remove duplicates and sort
  const uniqueCandidates = Array.from(new Set(candidates)).filter(c => c > 0 && c <= maxDose).sort((a, b) => b - a);

  // Find minimum preparation set using greedy approach
  const bestSet = findMinimalPreparationSet(uniqueDoses, uniqueCandidates);

  return bestSet.map((strength, index) => ({
    id: `opt-${index}`,
    strength,
    unit,
    canBeHalved: false, // Compounded preparations don't need halving - exact strengths are made
  }));
}

/**
 * Find the minimal set of preparations that can achieve all doses
 */
function findMinimalPreparationSet(doses: number[], candidates: number[]): number[] {
  // Try progressively larger sets of preparations
  for (let setSize = 1; setSize <= Math.min(5, candidates.length); setSize++) {
    const result = findPreparationSetOfSize(doses, candidates, setSize);
    if (result) return result;
  }

  // Fallback: return smallest dose as base unit
  const minDose = Math.min(...doses);
  return [minDose];
}

/**
 * Try to find a preparation set of exact size that covers all doses
 */
function findPreparationSetOfSize(doses: number[], candidates: number[], size: number): number[] | null {
  const combinations = getCombinations(candidates, size);

  for (const combo of combinations) {
    if (canCoverAllDoses(doses, combo)) {
      return combo;
    }
  }

  return null;
}

/**
 * Check if a set of preparations can cover all doses
 */
function canCoverAllDoses(doses: number[], preparations: number[]): boolean {
  for (const dose of doses) {
    if (!canMakeDose(dose, preparations)) {
      return false;
    }
  }
  return true;
}

/**
 * Check if a dose can be made from preparations with ≤4 units
 * For optimization (compounding), don't use halves - exact strengths will be made
 */
function canMakeDose(targetDose: number, preparations: number[]): boolean {
  // Dynamic programming approach with unit count limit
  const sortedPreps = [...preparations].sort((a, b) => b - a);

  // Try all combinations up to MAX_UNITS_PER_DOSE (no halves for optimization)
  return tryMakeDose(targetDose, sortedPreps, 0, MAX_UNITS_PER_DOSE, false);
}

function tryMakeDose(target: number, preps: number[], index: number, unitsLeft: number, allowHalves: boolean = false): boolean {
  if (Math.abs(target) < 0.001) return true;
  if (target < 0 || unitsLeft <= 0 || index >= preps.length) return false;

  const prep = preps[index];

  // Try using 0, 1, 2, 3, 4 of this prep (up to unitsLeft)
  for (let count = 0; count <= Math.min(4, unitsLeft); count++) {
    // Whole units
    if (count > 0) {
      const newTarget = target - (prep * count);
      if (newTarget >= 0 && tryMakeDose(newTarget, preps, index + 1, unitsLeft - count, allowHalves)) {
        return true;
      }
    }

    // Try half unit only if allowed (counts as 0.5 units)
    if (allowHalves && count === 0 && unitsLeft >= 0.5) {
      const halfTarget = target - (prep * 0.5);
      if (halfTarget >= 0 && tryMakeDose(halfTarget, preps, index + 1, unitsLeft - 0.5, allowHalves)) {
        return true;
      }
    }
  }

  // Try skipping this prep
  return tryMakeDose(target, preps, index + 1, unitsLeft, allowHalves);
}

/**
 * Generate all combinations of size k from array
 */
function getCombinations<T>(array: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (array.length === 0) return [];

  const result: T[][] = [];
  const first = array[0];
  const rest = array.slice(1);

  // Combinations that include first
  const withFirst = getCombinations(rest, k - 1);
  for (const combo of withFirst) {
    result.push([first, ...combo]);
  }

  // Combinations that don't include first
  const withoutFirst = getCombinations(rest, k);
  result.push(...withoutFirst);

  return result;
}

/**
 * Find GCD of an array of numbers
 */
function findGCD(numbers: number[]): number {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  return numbers.reduce((acc, num) => gcd(acc, Math.round(num)), Math.round(numbers[0]));
}

/**
 * Calculate preparation summary for a medication
 */
export function calculatePreparationSummary(
  medication: MedicationSchedule,
  doseEntries: DoseEntry[]
): PreparationSummary {
  const preparations = medication.preparationMode === 'specify'
    ? medication.preparations
    : medication.optimisedPreparations;

  if (!preparations || preparations.length === 0) {
    return {
      medicationId: medication.id,
      medicationName: medication.medicationName,
      requiredPreparations: [],
      canAchieveAllDoses: true,
      warnings: [],
    };
  }

  const totals = new Map<string, number>();
  const warnings: string[] = [];
  let canAchieveAll = true;

  for (const entry of doseEntries) {
    if (entry.isOffDay || entry.dose === 0) continue;

    if (entry.tabletBreakdown) {
      for (const breakdown of entry.tabletBreakdown) {
        const key = breakdown.preparation.id;
        totals.set(key, (totals.get(key) || 0) + breakdown.quantity);
      }
    } else {
      // Could not calculate breakdown for this dose
      canAchieveAll = false;
      warnings.push(`Cannot achieve ${entry.dose}${entry.unit} dose with available preparations`);
    }
  }

  const requiredPreparations: PreparationRequirement[] = [];
  for (const prep of preparations) {
    const total = totals.get(prep.id) || 0;
    if (total > 0) {
      requiredPreparations.push({
        preparation: prep,
        totalQuantity: total,
      });
    }
  }

  // Remove duplicate warnings
  const uniqueWarnings = Array.from(new Set(warnings));

  return {
    medicationId: medication.id,
    medicationName: medication.medicationName,
    requiredPreparations,
    canAchieveAllDoses: canAchieveAll,
    warnings: uniqueWarnings,
  };
}

/**
 * Get all unique doses from a medication schedule
 */
export function getUniqueDoses(medication: MedicationSchedule): number[] {
  const doses: number[] = [];

  switch (medication.scheduleType) {
    case 'linear':
      if (medication.linearConfig) {
        const config = medication.linearConfig;
        let dose = config.startingDose;

        // Only proceed if we have a valid starting dose
        if (dose > 0) {
          doses.push(dose);
        }

        // Guard against infinite loops: changeAmount must be > 0 for titration
        if (config.changeAmount > 0) {
          if (config.titrationDirection === 'increase') {
            // Need a maximum dose to prevent infinite loop when increasing
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
        // For 'maintain' direction, we just have the starting dose (already added above)
      }
      break;

    case 'cyclic':
      if (medication.cyclicConfig) {
        doses.push(medication.cyclicConfig.dose);
      }
      break;

    case 'dayOfWeek':
      if (medication.dayOfWeekConfig) {
        const config = medication.dayOfWeekConfig;
        [config.monday, config.tuesday, config.wednesday, config.thursday,
          config.friday, config.saturday, config.sunday]
          .forEach(d => { if (d !== undefined && d > 0) doses.push(d); });
      }
      break;

    case 'multiPhase':
      if (medication.multiPhaseConfig) {
        medication.multiPhaseConfig.phases.forEach(phase => {
          if (phase.dose > 0) doses.push(phase.dose);
        });
      }
      break;
  }

  return Array.from(new Set(doses)).filter(d => d > 0);
}

/**
 * Get the overall date range covering all medications
 */
export function getDateRangeForAllMedications(
  calculatedDoses: Map<string, DoseEntry[]>
): { start: Date; end: Date } | null {
  let earliestDate: Date | null = null;
  let latestDate: Date | null = null;

  calculatedDoses.forEach((doses) => {
    if (doses.length === 0) return;

    const firstDose = doses[0];
    const lastDose = doses[doses.length - 1];

    if (!earliestDate || firstDose.date < earliestDate) {
      earliestDate = firstDose.date;
    }

    if (!latestDate || lastDose.date > latestDate) {
      latestDate = lastDose.date;
    }
  });

  if (!earliestDate || !latestDate) {
    return null;
  }

  return { start: earliestDate, end: latestDate };
}

/**
 * Generate calendar days with all medications' doses
 */
export function generateCalendarDays(
  month: Date,
  calculatedDoses: Map<string, DoseEntry[]>
): CalendarDay[] {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays: CalendarDay[] = [];
  let currentDate = calendarStart;

  while (currentDate <= calendarEnd) {
    const dayDoses: DoseEntry[] = [];
    const dateToCheck = new Date(currentDate);

    calculatedDoses.forEach((doses) => {
      const doseForDay = doses.find((dose) => isSameDay(dose.date, dateToCheck));
      if (doseForDay) {
        dayDoses.push(doseForDay);
      }
    });

    calendarDays.push({
      date: dateToCheck,
      doses: dayDoses,
      isCurrentMonth: isSameMonth(dateToCheck, month),
    });

    currentDate = addDays(currentDate, 1);
  }

  return calendarDays;
}

/**
 * Format dose for display
 */
export function formatDose(dose: number, unit: MedicationUnit): string {
  const formattedDose = dose % 1 === 0 ? dose.toString() : dose.toFixed(2);
  return `${formattedDose}${unit}`;
}

/**
 * Format tablet breakdown for display
 */
export function formatTabletBreakdown(breakdown: TabletBreakdown[]): string {
  return breakdown
    .map(b => {
      const qty = b.quantity === 0.5 ? '½' : b.quantity.toString();
      return `${qty}× ${b.preparation.strength}${b.preparation.unit}`;
    })
    .join(' + ');
}

/**
 * Assign a color to a medication based on its index
 */
export function getMedicationColor(index: number): string {
  const colors = [
    'bg-blue-100 border-blue-300 text-blue-900',
    'bg-green-100 border-green-300 text-green-900',
    'bg-purple-100 border-purple-300 text-purple-900',
    'bg-orange-100 border-orange-300 text-orange-900',
    'bg-pink-100 border-pink-300 text-pink-900',
    'bg-indigo-100 border-indigo-300 text-indigo-900',
  ];

  return colors[index % colors.length];
}

/**
 * Get medication color for print (grayscale)
 */
export function getMedicationColorPrint(index: number): string {
  const grayValues = ['50', '100', '150', '200', '250', '300'];
  const grayValue = grayValues[index % grayValues.length];
  return `#${grayValue}${grayValue}${grayValue}`;
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

/**
 * Format a date for display
 */
export function formatDate(date: Date, formatString: string = 'dd/MM/yyyy'): string {
  return format(date, formatString);
}

/**
 * Get all months that should be displayed in the calendar
 */
export function getMonthsInRange(startDate: Date, endDate: Date): Date[] {
  const months: Date[] = [];
  let currentMonth = startOfMonth(startDate);
  const lastMonth = startOfMonth(endDate);

  while (currentMonth <= lastMonth) {
    months.push(new Date(currentMonth));
    currentMonth = addDays(currentMonth, 32);
    currentMonth = startOfMonth(currentMonth);
  }

  return months;
}

/**
 * Get schedule type label for display
 */
export function getScheduleTypeLabel(type: string): string {
  switch (type) {
    case 'linear': return 'Linear Titration';
    case 'cyclic': return 'Cyclic Dosing';
    case 'dayOfWeek': return 'Day-of-Week';
    case 'multiPhase': return 'Multi-Phase Taper';
    default: return type;
  }
}

/**
 * Get schedule description for display in medication list
 */
export function getScheduleDescription(medication: MedicationSchedule): string {
  switch (medication.scheduleType) {
    case 'linear':
      if (medication.linearConfig) {
        const config = medication.linearConfig;
        if (config.titrationDirection === 'maintain') {
          return `Maintain at ${config.startingDose}${medication.unit}`;
        }
        const direction = config.titrationDirection === 'increase' ? '↑' : '↓';
        return `${direction} ${config.changeAmount}${medication.unit} every ${config.intervalDays} day${config.intervalDays > 1 ? 's' : ''}`;
      }
      break;

    case 'cyclic':
      if (medication.cyclicConfig) {
        const config = medication.cyclicConfig;
        return `${config.dose}${medication.unit} for ${config.daysOn} days, then ${config.daysOff} days off`;
      }
      break;

    case 'dayOfWeek':
      if (medication.dayOfWeekConfig) {
        const config = medication.dayOfWeekConfig;
        const doses = [
          config.monday, config.tuesday, config.wednesday, config.thursday,
          config.friday, config.saturday, config.sunday
        ].filter(d => d !== undefined);
        const unique = Array.from(new Set(doses));
        if (unique.length === 1) {
          return `${unique[0]}${medication.unit} daily (variable by day)`;
        }
        return `Variable: ${unique.join('/')}}${medication.unit}`;
      }
      break;

    case 'multiPhase':
      if (medication.multiPhaseConfig && medication.multiPhaseConfig.phases.length > 0) {
        const phases = medication.multiPhaseConfig.phases;
        const first = phases[0];
        const last = phases[phases.length - 1];
        return `${first.dose}${medication.unit} → ${last.dose}${medication.unit} (${phases.length} phases)`;
      }
      break;
  }

  return 'No schedule configured';
}
