import { useForm } from 'react-hook-form';
import { Sun, Utensils, Moon } from 'lucide-react';
import type { DoseTimeName } from '../../../../types/doseCalculator';
import { ALL_DOSE_TIMES } from '../../../../types/doseCalculator';
import { cn } from '../../../../lib/utils';
import type { MedicationFormValues } from '../schema';

interface DoseTimeOption {
  id: DoseTimeName;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  description: string;
}

const DOSE_TIME_OPTIONS: DoseTimeOption[] = [
  {
    id: 'mane',
    label: 'Morning',
    shortLabel: 'M',
    icon: <Sun className="h-4 w-4" />,
    description: 'Mane',
  },
  {
    id: 'lunch',
    label: 'Lunch',
    shortLabel: 'L',
    icon: <Utensils className="h-4 w-4" />,
    description: 'Midday',
  },
  {
    id: 'dinner',
    label: 'Dinner',
    shortLabel: 'D',
    icon: <Utensils className="h-4 w-4" />,
    description: 'Evening',
  },
  {
    id: 'nocte',
    label: 'Bedtime',
    shortLabel: 'N',
    icon: <Moon className="h-4 w-4" />,
    description: 'Nocte',
  },
];

export const DoseTimesSelector = ({
  form,
}: {
  form: ReturnType<typeof useForm<MedicationFormValues>>;
}) => {
  const enabledDoseTimes = form.watch('enabledDoseTimes') ?? ['mane'];

  const handleDoseTimeToggle = (time: DoseTimeName) => {
    const current = enabledDoseTimes ?? [];
    const isEnabled = current.includes(time);

    if (isEnabled) {
      // Don't allow removing the last dose time
      if (current.length > 1) {
        form.setValue('enabledDoseTimes', current.filter(t => t !== time));
        // If we're in multiple mode and only one left, switch to single
        if (current.length === 2) {
          form.setValue('doseTimesMode', 'single');
        }
      }
    } else {
      // Add the time and sort
      const newTimes = [...current, time].sort((a, b) =>
        ALL_DOSE_TIMES.indexOf(a as DoseTimeName) - ALL_DOSE_TIMES.indexOf(b as DoseTimeName)
      );
      form.setValue('enabledDoseTimes', newTimes);
      // If we now have more than one, switch to multiple mode
      if (newTimes.length > 1) {
        form.setValue('doseTimesMode', 'multiple');
      }
    }
  };

  const selectedCount = enabledDoseTimes.length;

  return (
    <div className="space-y-3 mb-4 pb-4 border-b">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Dose Times
        </label>
        <span className="text-xs text-gray-500">
          {selectedCount === 1 ? 'Once daily' : `${selectedCount}x daily`}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {DOSE_TIME_OPTIONS.map((option) => {
          const isSelected = enabledDoseTimes.includes(option.id);
          const isOnlyOneSelected = selectedCount === 1 && isSelected;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleDoseTimeToggle(option.id)}
              disabled={isOnlyOneSelected}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1',
                isSelected
                  ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-brand-300 hover:bg-brand-50',
                isOnlyOneSelected && 'opacity-70 cursor-not-allowed'
              )}
            >
              <span className={cn(
                'transition-colors',
                isSelected ? 'text-white' : 'text-gray-500'
              )}>
                {option.icon}
              </span>
              <span className="font-medium text-sm">{option.label}</span>
              <span className={cn(
                'text-xs ml-1 px-1.5 py-0.5 rounded',
                isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              )}>
                {option.shortLabel}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-500">
        Select which times of day the medication will be taken. Click to toggle.
      </p>
    </div>
  );
};
