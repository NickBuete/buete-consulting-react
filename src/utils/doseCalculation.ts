import { addDays, isSameMonth, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameDay, format } from 'date-fns';
import type { MedicationSchedule, DoseEntry, CalendarDay, MedicationUnit } from '../types/doseCalculator';

const MAX_ITERATIONS = 1000; // Safety limit to prevent infinite loops
const DEFAULT_MAINTAIN_DAYS = 90; // Default duration for 'maintain' titration

/**
 * Calculate the complete dose schedule for a medication based on its titration parameters
 */
export function calculateDoseSchedule(medication: MedicationSchedule): DoseEntry[] {
  const doseEntries: DoseEntry[] = [];
  let currentDose = medication.startingDose;
  let currentDate = new Date(medication.startDate);
  let iterations = 0;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    // Calculate the end date for this interval
    const intervalEndDate = addDays(currentDate, medication.intervalDays);

    // Add dose entries for each day in this interval
    for (let i = 0; i < medication.intervalDays; i++) {
      const doseDate = addDays(currentDate, i);

      // Check if we've reached the manual end date
      if (medication.endDate && doseDate > medication.endDate) {
        return doseEntries;
      }

      doseEntries.push({
        date: doseDate,
        dose: currentDose,
        unit: medication.unit,
        medicationId: medication.id,
        medicationName: medication.medicationName,
      });
    }

    // Apply titration change for next interval
    if (medication.titrationDirection === 'increase') {
      currentDose += medication.changeAmount;

      // Check if we've reached maximum dose
      if (medication.maximumDose !== undefined && currentDose >= medication.maximumDose) {
        currentDose = medication.maximumDose;
        // Stop after reaching max dose
        break;
      }
    } else if (medication.titrationDirection === 'decrease') {
      currentDose -= medication.changeAmount;

      // Check if we've reached minimum dose (default 0)
      const minimumDose = medication.minimumDose ?? 0;
      if (currentDose <= minimumDose) {
        currentDose = minimumDose;
        // Stop after reaching min dose
        break;
      }
    } else {
      // 'maintain' - no change in dose
      // Stop after DEFAULT_MAINTAIN_DAYS if no endDate specified
      if (!medication.endDate) {
        const maintainEndDate = addDays(medication.startDate, DEFAULT_MAINTAIN_DAYS);
        if (intervalEndDate >= maintainEndDate) {
          break;
        }
      }
    }

    // Move to next interval
    currentDate = intervalEndDate;

    // Safety check: if we've reached the end date, stop
    if (medication.endDate && currentDate > medication.endDate) {
      break;
    }
  }

  return doseEntries;
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
    const dateToCheck = new Date(currentDate); // Create a copy to avoid closure issues

    // Collect all doses for this day from all medications
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
  // Remove unnecessary decimal places
  const formattedDose = dose % 1 === 0 ? dose.toString() : dose.toFixed(2);
  return `${formattedDose}${unit}`;
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

  // Check if reached minimum dose (for decrease)
  if (medication.titrationDirection === 'decrease') {
    const minimumDose = medication.minimumDose ?? 0;
    return lastDose.dose <= minimumDose;
  }

  // Check if reached maximum dose (for increase)
  if (medication.titrationDirection === 'increase') {
    if (medication.maximumDose !== undefined) {
      return lastDose.dose >= medication.maximumDose;
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
    currentMonth = addDays(currentMonth, 32); // Move to next month
    currentMonth = startOfMonth(currentMonth); // Normalize to start of month
  }

  return months;
}
