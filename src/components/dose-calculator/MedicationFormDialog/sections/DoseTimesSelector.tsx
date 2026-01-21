import { useForm } from 'react-hook-form';
import type { DoseTimeName } from '../../../../types/doseCalculator';
import { ALL_DOSE_TIMES, DOSE_TIME_LABELS } from '../../../../types/doseCalculator';
import {
  Checkbox,
  FormLabel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui';
import type { MedicationFormValues } from '../schema';

export const DoseTimesSelector = ({
  form,
}: {
  form: ReturnType<typeof useForm<MedicationFormValues>>;
}) => {
  const doseTimesMode = form.watch('doseTimesMode');
  const enabledDoseTimes = form.watch('enabledDoseTimes') ?? ['mane'];

  const handleModeChange = (mode: string) => {
    form.setValue('doseTimesMode', mode as 'single' | 'multiple');
    // Initialize enabled dose times if switching to multiple
    if (mode === 'multiple' && (!enabledDoseTimes || enabledDoseTimes.length === 0)) {
      form.setValue('enabledDoseTimes', ['mane']);
    }
  };

  const handleDoseTimeToggle = (time: DoseTimeName, checked: boolean) => {
    const current = enabledDoseTimes ?? [];
    if (checked) {
      form.setValue('enabledDoseTimes', [...current, time].sort((a, b) =>
        ALL_DOSE_TIMES.indexOf(a as DoseTimeName) - ALL_DOSE_TIMES.indexOf(b as DoseTimeName)
      ));
    } else {
      // Don't allow removing the last dose time
      if (current.length > 1) {
        form.setValue('enabledDoseTimes', current.filter(t => t !== time));
      }
    }
  };

  return (
    <div className="space-y-3 mb-4 pb-4 border-b">
      <div className="flex items-center justify-between">
        <FormLabel className="text-sm font-medium">Dosing Frequency</FormLabel>
        <Select onValueChange={handleModeChange} value={doseTimesMode || 'single'}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" className="pointer-events-auto">
            <SelectItem value="single">Once daily</SelectItem>
            <SelectItem value="multiple">Multiple times per day</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {doseTimesMode === 'multiple' && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Select which times of day:</p>
          <div className="flex flex-wrap gap-4">
            {ALL_DOSE_TIMES.map((time) => (
              <label key={time} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={enabledDoseTimes?.includes(time) ?? false}
                  onCheckedChange={(checked) => handleDoseTimeToggle(time, !!checked)}
                />
                <span className="text-sm">{DOSE_TIME_LABELS[time]}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
