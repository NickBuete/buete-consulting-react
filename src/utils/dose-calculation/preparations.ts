import type {
  MedicationSchedule,
  DoseEntry,
  MedicationUnit,
  Preparation,
  TabletBreakdown,
  PreparationSummary,
  PreparationRequirement,
  DoseTimeEntry,
} from '../../types/doseCalculator';
import { DOSE_TIME_SHORT_LABELS } from '../../types/doseCalculator';

const MAX_UNITS_PER_DOSE = 4; // Maximum number of tablet units per dose

/**
 * Add tablet breakdown to dose entries if preparations are specified
 */
export function addTabletBreakdowns(doseEntries: DoseEntry[], medication: MedicationSchedule): DoseEntry[] {
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

    // Handle multiple dose times - calculate breakdown for each dose time
    if (entry.doseTimes && entry.doseTimes.length > 0) {
      const doseTimesWithBreakdown: DoseTimeEntry[] = entry.doseTimes.map(dt => {
        if (dt.dose === 0) {
          return dt;
        }
        const breakdown = calculateTabletBreakdown(dt.dose, preparations);
        return {
          ...dt,
          tabletBreakdown: breakdown,
        };
      });
      return {
        ...entry,
        doseTimes: doseTimesWithBreakdown,
      };
    }

    // Single dose - original behavior
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
 * Check if a dose can be made from preparations with <=4 units
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

    // Handle multiple dose times
    if (entry.doseTimes && entry.doseTimes.length > 0) {
      for (const doseTime of entry.doseTimes) {
        if (doseTime.dose === 0) continue;

        if (doseTime.tabletBreakdown) {
          for (const breakdown of doseTime.tabletBreakdown) {
            const key = breakdown.preparation.id;
            totals.set(key, (totals.get(key) || 0) + breakdown.quantity);
          }
        } else {
          canAchieveAll = false;
          warnings.push(`Cannot achieve ${doseTime.dose}${entry.unit} dose (${DOSE_TIME_SHORT_LABELS[doseTime.time]}) with available preparations`);
        }
      }
    } else if (entry.tabletBreakdown) {
      // Single dose mode
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
