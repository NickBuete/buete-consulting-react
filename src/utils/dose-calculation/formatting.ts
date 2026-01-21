import { format } from 'date-fns';
import type {
  MedicationSchedule,
  MedicationUnit,
  DoseTimeEntry,
  TabletBreakdown,
} from '../../types/doseCalculator';
import { DOSE_TIME_SHORT_LABELS } from '../../types/doseCalculator';

/**
 * Format dose times for display (e.g., "M:10mg L:5mg D:5mg")
 */
export function formatDoseTimes(doseTimes: DoseTimeEntry[], unit: MedicationUnit): string {
  return doseTimes
    .map(dt => `${DOSE_TIME_SHORT_LABELS[dt.time]}:${dt.dose}${unit}`)
    .join(' ');
}

/**
 * Format dose times compactly for calendar (e.g., "M:10 L:5 D:5")
 */
export function formatDoseTimesCompact(doseTimes: DoseTimeEntry[], unit: MedicationUnit): string {
  return doseTimes.map(dt => `${DOSE_TIME_SHORT_LABELS[dt.time]}:${dt.dose}`).join(' ') + unit;
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
 * Format a date for display
 */
export function formatDate(date: Date, formatString: string = 'dd/MM/yyyy'): string {
  return format(date, formatString);
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
          config.friday, config.saturday, config.sunday,
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
