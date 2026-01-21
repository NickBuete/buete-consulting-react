import { useForm } from 'react-hook-form';
import type { DoseTimeName } from '../../../../types/doseCalculator';
import { ALL_DOSE_TIMES, DOSE_TIME_LABELS } from '../../../../types/doseCalculator';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
} from '../../../ui';
import type { MedicationFormValues } from '../schema';
import { DoseTimesSelector } from './DoseTimesSelector';

// Cyclic Dose Times Input
const CyclicDoseTimesInput = ({
  form,
}: {
  form: ReturnType<typeof useForm<MedicationFormValues>>;
}) => {
  const enabledDoseTimes = form.watch('enabledDoseTimes') ?? ['mane'];
  const cyclicDoseTimes = form.watch('cyclicDoseTimes') ?? [];

  const handleDoseChange = (time: DoseTimeName, dose: number) => {
    const current = [...cyclicDoseTimes];
    const existingIndex = current.findIndex(dt => dt.time === time);
    if (existingIndex >= 0) {
      current[existingIndex] = { time, dose };
    } else {
      current.push({ time, dose });
    }
    current.sort((a, b) => ALL_DOSE_TIMES.indexOf(a.time as DoseTimeName) - ALL_DOSE_TIMES.indexOf(b.time as DoseTimeName));
    form.setValue('cyclicDoseTimes', current);
  };

  const getDoseForTime = (time: string): number => {
    return cyclicDoseTimes.find(dt => dt.time === time)?.dose ?? 0;
  };

  return (
    <div className="space-y-2">
      <FormLabel className="text-sm">Dose per Time</FormLabel>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {enabledDoseTimes.map((time) => (
          <FormItem key={time}>
            <FormLabel className="text-xs text-gray-500">{DOSE_TIME_LABELS[time as DoseTimeName]}</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="0"
                value={getDoseForTime(time) || ''}
                onChange={(e) => handleDoseChange(time as DoseTimeName, e.target.value ? Number(e.target.value) : 0)}
              />
            </FormControl>
          </FormItem>
        ))}
      </div>
    </div>
  );
};

export const CyclicConfigFields = ({
  form,
}: {
  form: ReturnType<typeof useForm<MedicationFormValues>>;
}) => {
  const doseTimesMode = form.watch('doseTimesMode');

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-700">Cyclic Dosing Settings</h4>

      {/* Dose Times Selector */}
      <DoseTimesSelector form={form} />

      {/* Dose - single mode */}
      {doseTimesMode !== 'multiple' && (
        <FormField
          control={form.control}
          name="cyclicDose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dose</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  placeholder="e.g., 10"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}

      {/* Dose Times - multiple mode */}
      {doseTimesMode === 'multiple' && (
        <CyclicDoseTimesInput form={form} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="cyclicDaysOn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Days On</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="1"
                  placeholder="e.g., 21"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 1)}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cyclicDaysOff"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Days Off</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="0"
                  placeholder="e.g., 7"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
