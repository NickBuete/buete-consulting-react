import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { DoseTimeName } from '../../../../types/doseCalculator';
import { ALL_DOSE_TIMES, DOSE_TIME_LABELS } from '../../../../types/doseCalculator';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui';
import type { MedicationFormValues } from '../schema';
import { DoseTimesSelector } from './DoseTimesSelector';

// Starting Dose Times Input for Linear Titration
const LinearStartingDoseTimesInput = ({
  form,
}: {
  form: ReturnType<typeof useForm<MedicationFormValues>>;
}) => {
  const watchedEnabledDoseTimes = form.watch('enabledDoseTimes');
  const watchedStartingDoseTimes = form.watch('linearStartingDoseTimes');

  const enabledDoseTimes = useMemo(() => watchedEnabledDoseTimes ?? ['mane'], [watchedEnabledDoseTimes]);
  const startingDoseTimes = useMemo(() => watchedStartingDoseTimes ?? [], [watchedStartingDoseTimes]);

  // Ensure all enabled dose times have an entry (even with dose 0)
  useEffect(() => {
    const current = [...startingDoseTimes];
    let updated = false;

    enabledDoseTimes.forEach(time => {
      if (!current.some(dt => dt.time === time)) {
        current.push({ time: time as DoseTimeName, dose: 0 });
        updated = true;
      }
    });

    if (updated) {
      current.sort((a, b) => ALL_DOSE_TIMES.indexOf(a.time as DoseTimeName) - ALL_DOSE_TIMES.indexOf(b.time as DoseTimeName));
      form.setValue('linearStartingDoseTimes', current);
    }
  }, [enabledDoseTimes, startingDoseTimes, form]);

  const handleDoseChange = (time: DoseTimeName, dose: number) => {
    const current = [...startingDoseTimes];
    const existingIndex = current.findIndex(dt => dt.time === time);
    if (existingIndex >= 0) {
      current[existingIndex] = { time, dose };
    } else {
      current.push({ time, dose });
    }
    // Sort by dose time order
    current.sort((a, b) => ALL_DOSE_TIMES.indexOf(a.time as DoseTimeName) - ALL_DOSE_TIMES.indexOf(b.time as DoseTimeName));
    form.setValue('linearStartingDoseTimes', current);
  };

  const getDoseForTime = (time: string): number => {
    return startingDoseTimes.find(dt => dt.time === time)?.dose ?? 0;
  };

  return (
    <div className="space-y-2">
      <FormLabel className="text-sm">Starting Dose per Time</FormLabel>
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
      <p className="text-xs text-gray-500">Each dose time will titrate by the same change amount</p>
    </div>
  );
};

// Linear Maximum Dose Times Input (per dose time maximum)
const LinearMaximumDoseTimesInput = ({
  form,
}: {
  form: ReturnType<typeof useForm<MedicationFormValues>>;
}) => {
  const enabledDoseTimes = form.watch('enabledDoseTimes') ?? ['mane'];
  const maximumDoseTimes = form.watch('linearMaximumDoseTimes') ?? [];

  const handleDoseChange = (time: DoseTimeName, dose: number) => {
    const current = [...maximumDoseTimes];
    const existingIndex = current.findIndex(dt => dt.time === time);
    if (existingIndex >= 0) {
      if (dose > 0) {
        current[existingIndex] = { time, dose };
      } else {
        // Remove if set to 0 (no limit)
        current.splice(existingIndex, 1);
      }
    } else if (dose > 0) {
      current.push({ time, dose });
    }
    // Sort by dose time order
    current.sort((a, b) => ALL_DOSE_TIMES.indexOf(a.time as DoseTimeName) - ALL_DOSE_TIMES.indexOf(b.time as DoseTimeName));
    form.setValue('linearMaximumDoseTimes', current);
  };

  const getDoseForTime = (time: string): number | undefined => {
    return maximumDoseTimes.find(dt => dt.time === time)?.dose;
  };

  return (
    <div className="space-y-2">
      <FormLabel className="text-sm">Maximum Dose per Time (optional)</FormLabel>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {enabledDoseTimes.map((time) => (
          <FormItem key={time}>
            <FormLabel className="text-xs text-gray-500">{DOSE_TIME_LABELS[time as DoseTimeName]}</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="No limit"
                value={getDoseForTime(time) ?? ''}
                onChange={(e) => handleDoseChange(time as DoseTimeName, e.target.value ? Number(e.target.value) : 0)}
              />
            </FormControl>
          </FormItem>
        ))}
      </div>
      <p className="text-xs text-gray-500">Leave blank for no limit. Schedule stops when all dose times reach their max.</p>
    </div>
  );
};

// Titration Mode Settings Component for multiple dose times
const TitrationModeSettings = ({
  form,
}: {
  form: ReturnType<typeof useForm<MedicationFormValues>>;
}) => {
  const titrationMode = form.watch('linearTitrationMode');
  const watchedEnabledDoseTimes = form.watch('enabledDoseTimes');
  const watchedTitrationSequence = form.watch('linearTitrationSequence');
  const titrationDirection = form.watch('linearTitrationDirection');

  const enabledDoseTimes = useMemo<DoseTimeName[]>(
    () => (watchedEnabledDoseTimes ?? []) as DoseTimeName[],
    [watchedEnabledDoseTimes]
  );
  const titrationSequence = useMemo<DoseTimeName[]>(
    () => (watchedTitrationSequence ?? []) as DoseTimeName[],
    [watchedTitrationSequence]
  );

  // Initialize sequence with enabled dose times if empty
  useEffect(() => {
    if (titrationMode === 'sequential' && titrationSequence.length === 0 && enabledDoseTimes.length > 0) {
      // Default sequence: nocte first, then others in order
      const defaultSequence = [...enabledDoseTimes].sort((a, b) => {
        // nocte first, then mane, then others
        const order: Record<string, number> = { nocte: 0, mane: 1, lunch: 2, dinner: 3 };
        return (order[a] ?? 99) - (order[b] ?? 99);
      });
      form.setValue('linearTitrationSequence', defaultSequence);
    }
  }, [titrationMode, titrationSequence.length, enabledDoseTimes, form]);

  const handleSequenceChange = (time: DoseTimeName, newPosition: number) => {
    const currentSequence = [...(titrationSequence.length > 0 ? titrationSequence : enabledDoseTimes)];
    const currentPosition = currentSequence.indexOf(time);

    if (currentPosition === -1) return;

    // Remove from current position
    currentSequence.splice(currentPosition, 1);
    // Insert at new position (newPosition is 1-indexed)
    currentSequence.splice(newPosition - 1, 0, time);

    form.setValue('linearTitrationSequence', currentSequence);
  };

  const getPositionForTime = (time: DoseTimeName): number => {
    const seq = titrationSequence.length > 0 ? titrationSequence : enabledDoseTimes;
    const idx = seq.indexOf(time);
    return idx >= 0 ? idx + 1 : 1;
  };

  // Only show if direction is increase or decrease (not maintain)
  if (titrationDirection === 'maintain') {
    return null;
  }

  return (
    <div className="space-y-4 border-t pt-4 mt-4">
      <h5 className="font-medium text-gray-600 text-sm">How should doses change?</h5>

      {/* Titration Mode Select */}
      <FormField
        control={form.control}
        name="linearTitrationMode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Titration Mode</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || 'together'}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent position="popper" className="pointer-events-auto">
                <SelectItem value="together">All doses together (e.g., 1 BD → 2 BD → 3 BD)</SelectItem>
                <SelectItem value="sequential">One at a time (e.g., 1 N → 2 N → 2 N + 1 M)</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      {/* Sequential Settings */}
      {titrationMode === 'sequential' && (
        <div className="space-y-3">
          <FormField
            control={form.control}
            name="linearIncrementsPerDoseTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of increments per dose time</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="1"
                    value={field.value || 1}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 1)}
                  />
                </FormControl>
                <p className="text-xs text-gray-500">How many times to adjust each dose before moving to next time</p>
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel>Order of titration</FormLabel>
            <div className="space-y-2">
              {enabledDoseTimes.map((time) => (
                <div key={time} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-20">{DOSE_TIME_LABELS[time]}</span>
                  <Select
                    value={getPositionForTime(time).toString()}
                    onValueChange={(value) => handleSequenceChange(time, Number(value))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" className="pointer-events-auto">
                      {enabledDoseTimes.map((_, idx) => (
                        <SelectItem key={idx} value={(idx + 1).toString()}>
                          {idx + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const LinearConfigFields = ({
  form,
}: {
  form: ReturnType<typeof useForm<MedicationFormValues>>;
}) => {
  const doseTimesMode = form.watch('doseTimesMode');

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-700">Linear Titration Settings</h4>

      {/* Dose Times Selector */}
      <DoseTimesSelector form={form} />

      {/* Starting Dose - single mode */}
      {doseTimesMode !== 'multiple' && (
        <FormField
          control={form.control}
          name="linearStartingDose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Starting Dose</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  placeholder="e.g., 50"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Starting Dose Times - multiple mode */}
      {doseTimesMode === 'multiple' && (
        <LinearStartingDoseTimesInput form={form} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="linearTitrationDirection"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Direction</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || 'decrease'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent position="popper" className="pointer-events-auto">
                  <SelectItem value="decrease">Decrease</SelectItem>
                  <SelectItem value="increase">Increase</SelectItem>
                  <SelectItem value="maintain">Maintain</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="linearChangeAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Change Amount</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  placeholder="e.g., 5"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="linearIntervalDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interval (days)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="1"
                  placeholder="e.g., 7"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 1)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Min/Max Dose - single mode */}
      {doseTimesMode !== 'multiple' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="linearMinimumDose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Dose (optional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="linearMaximumDose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Dose (optional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Maximum Dose per Time - multiple mode */}
      {doseTimesMode === 'multiple' && (
        <LinearMaximumDoseTimesInput form={form} />
      )}

      {/* Titration Mode Settings - only shown for multiple dose times */}
      {doseTimesMode === 'multiple' && (
        <TitrationModeSettings form={form} />
      )}
    </div>
  );
};
