import {
  addDays,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import type { CalendarDay, DoseEntry } from '../../types/doseCalculator';

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
