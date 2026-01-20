import { useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
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
  Button,
  Checkbox,
  Label,
} from '../ui';
import type {
  MedicationSchedule,
  ScheduleType,
  PreparationMode,
  Preparation,
  DoseTimeName,
  DoseTimesMode,
  TitrationMode,
} from '../../types/doseCalculator';
import { ALL_DOSE_TIMES, DOSE_TIME_LABELS } from '../../types/doseCalculator';
import { optimizePreparations, getUniqueDoses } from '../../utils/doseCalculation';

// Zod schema for preparation
const preparationSchema = z.object({
  id: z.string(),
  strength: z.number().positive('Strength must be positive'),
  canBeHalved: z.boolean(),
});

// Zod schema for dose time value
// Using z.string() due to Zod v4/TypeScript 4.9 compatibility - type is validated at runtime
const doseTimeValueSchema = z.object({
  time: z.string(),
  dose: z.number().nonnegative(),
});

// Zod schema for taper phase (with optional dose times)
const taperPhaseSchema = z.object({
  id: z.string(),
  dose: z.number().nonnegative('Dose must be 0 or greater'),
  durationDays: z.number().int().positive('Duration must be at least 1 day'),
  doseTimes: z.array(doseTimeValueSchema).optional(),
});

// Main medication schema
const medicationSchema = z.object({
  medicationName: z.string().min(1, 'Medication name is required'),
  unit: z.string(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  scheduleType: z.string(),

  // Dose times mode (applies to schedule type configs)
  // Using z.string() due to Zod v4/TypeScript 4.9 compatibility
  doseTimesMode: z.string(),
  enabledDoseTimes: z.array(z.string()).optional(),

  // Linear config
  linearStartingDose: z.number().nonnegative().optional(),
  linearTitrationDirection: z.string().optional(),
  linearChangeAmount: z.number().nonnegative().optional(),
  linearIntervalDays: z.number().int().min(1).optional(),
  linearMinimumDose: z.number().nonnegative().optional(),
  linearMaximumDose: z.number().positive().optional(),
  // Linear config dose times
  linearStartingDoseTimes: z.array(doseTimeValueSchema).optional(),
  linearMaximumDoseTimes: z.array(doseTimeValueSchema).optional(),

  // Cyclic config
  cyclicDose: z.number().nonnegative().optional(),
  cyclicDaysOn: z.number().int().min(1).optional(),
  cyclicDaysOff: z.number().int().min(0).optional(),
  // Cyclic config dose times
  cyclicDoseTimes: z.array(doseTimeValueSchema).optional(),

  // Day of week config
  dowMonday: z.number().nonnegative().optional(),
  dowTuesday: z.number().nonnegative().optional(),
  dowWednesday: z.number().nonnegative().optional(),
  dowThursday: z.number().nonnegative().optional(),
  dowFriday: z.number().nonnegative().optional(),
  dowSaturday: z.number().nonnegative().optional(),
  dowSunday: z.number().nonnegative().optional(),
  // Day of week dose times (each day has its own dose times array)
  dowMondayTimes: z.array(doseTimeValueSchema).optional(),
  dowTuesdayTimes: z.array(doseTimeValueSchema).optional(),
  dowWednesdayTimes: z.array(doseTimeValueSchema).optional(),
  dowThursdayTimes: z.array(doseTimeValueSchema).optional(),
  dowFridayTimes: z.array(doseTimeValueSchema).optional(),
  dowSaturdayTimes: z.array(doseTimeValueSchema).optional(),
  dowSundayTimes: z.array(doseTimeValueSchema).optional(),

  // Multi-phase config
  phases: z.array(taperPhaseSchema).optional(),

  // Preparation config
  preparationMode: z.string(),
  preparations: z.array(preparationSchema).optional(),

  // Titration mode fields for multiple dose times
  linearTitrationMode: z.string().optional(),
  linearTitrationSequence: z.array(z.string()).optional(),
  linearIncrementsPerDoseTime: z.number().int().min(1).optional(),
}).refine(
  (data) => {
    if (data.endDate && data.startDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

type MedicationFormValues = z.infer<typeof medicationSchema>;

interface MedicationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication?: MedicationSchedule;
  onSave: (medication: MedicationSchedule) => void;
}

export const MedicationFormDialog: React.FC<MedicationFormDialogProps> = ({
  open,
  onOpenChange,
  medication,
  onSave,
}) => {
  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: getDefaultValues(),
  });

  const { fields: phaseFields, append: appendPhase, remove: removePhase } = useFieldArray({
    control: form.control,
    name: 'phases',
  });

  const { fields: prepFields, append: appendPrep, remove: removePrep } = useFieldArray({
    control: form.control,
    name: 'preparations',
  });

  const scheduleType = form.watch('scheduleType') as ScheduleType;
  const preparationMode = form.watch('preparationMode') as PreparationMode;
  const unit = form.watch('unit');

  // Calculate unique doses for optimization preview
  const formValues = form.watch();
  const uniqueDoses = useMemo(() => {
    const tempMedication = formValuesToMedication(formValues, medication?.id);
    return getUniqueDoses(tempMedication);
  }, [formValues, medication?.id]);

  // Auto-optimize preparations when in 'optimise' mode
  const optimisedPreps = useMemo(() => {
    if (preparationMode === 'optimise' && uniqueDoses.length > 0) {
      return optimizePreparations(uniqueDoses, unit as 'mg' | 'mcg' | 'mL' | 'units');
    }
    return [];
  }, [preparationMode, uniqueDoses, unit]);

  // Reset form when medication changes or dialog opens
  useEffect(() => {
    if (medication) {
      form.reset(medicationToFormValues(medication));
    } else if (open) {
      form.reset(getDefaultValues());
    }
  }, [medication, open, form]);

  const onSubmit = (data: MedicationFormValues) => {
    const medicationData = formValuesToMedication(data, medication?.id, optimisedPreps);
    onSave(medicationData);
    onOpenChange(false);
  };

  const handleAddPhase = () => {
    appendPhase({
      id: `phase-${Date.now()}`,
      dose: 0,
      durationDays: 7,
    });
  };

  const handleAddPreparation = () => {
    appendPrep({
      id: `prep-${Date.now()}`,
      strength: 0,
      canBeHalved: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => {
          // Prevent closing when clicking on Select dropdown portal
          const target = e.target as HTMLElement;
          if (target.closest('[data-radix-select-content]')) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          // Prevent closing when interacting with Select dropdown portal
          const target = e.target as HTMLElement;
          if (target.closest('[data-radix-select-content]')) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-heading">
            {medication ? 'Edit Medication' : 'Add Medication'}
          </DialogTitle>
          <DialogDescription className="font-body">
            Configure the medication details and dosing schedule
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Medication Name and Unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="medicationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medication Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Prednisolone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper" className="pointer-events-auto">
                        <SelectItem value="mg">mg</SelectItem>
                        <SelectItem value="mcg">mcg</SelectItem>
                        <SelectItem value="mL">mL</SelectItem>
                        <SelectItem value="units">units</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Preparation Configuration - moved here to be after medication name/unit */}
            <div className="border-t pt-4">
              <FormField
                control={form.control}
                name="preparationMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Tablet/Preparation Tracking</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper" className="pointer-events-auto">
                        <SelectItem value="none">None - just show doses</SelectItem>
                        <SelectItem value="specify">Specify Available Preparations</SelectItem>
                        <SelectItem value="optimise">Optimise For Me (compounding)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {preparationMode === 'specify' && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-gray-600">
                    Enter the available tablet/capsule strengths:
                  </p>
                  {prepFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-3">
                      <FormField
                        control={form.control}
                        name={`preparations.${index}.strength`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                step="0.01"
                                placeholder="Strength"
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <span className="text-sm text-gray-500">{unit}</span>
                      <FormField
                        control={form.control}
                        name={`preparations.${index}.canBeHalved`}
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <Label className="text-sm">Can halve</Label>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePrep(index)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddPreparation}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Preparation
                  </Button>
                </div>
              )}

              {preparationMode === 'optimise' && uniqueDoses.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-900">Optimised Preparations</span>
                  </div>
                  <p className="text-sm text-blue-800 mb-2">
                    Based on doses needed ({uniqueDoses.join(', ')} {unit}), we recommend:
                  </p>
                  {optimisedPreps.length > 0 ? (
                    <ul className="text-sm text-blue-900 space-y-1">
                      {optimisedPreps.map((prep, i) => (
                        <li key={i}>• {prep.strength}{prep.unit} tablets/capsules</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-blue-700 italic">
                      Could not determine optimal preparations. Please specify manually.
                    </p>
                  )}
                  <p className="text-xs text-blue-600 mt-2">
                    Max 4 units per dose. Exact strengths compounded (no halving needed).
                  </p>
                </div>
              )}
            </div>

            {/* Schedule Type Selector */}
            <div className="border-t pt-4">
              <FormField
                control={form.control}
                name="scheduleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Schedule Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper" className="pointer-events-auto">
                        <SelectItem value="linear">Linear Titration (increase/decrease/maintain)</SelectItem>
                        <SelectItem value="cyclic">Cyclic Dosing (X days on, Y days off)</SelectItem>
                        <SelectItem value="dayOfWeek">Day-of-Week (different doses per day)</SelectItem>
                        <SelectItem value="multiPhase">Multi-Phase Taper (custom phases)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Schedule Type Specific Fields */}
            <div className="border rounded-lg p-4 bg-gray-50">
              {scheduleType === 'linear' && (
                <LinearConfigFields form={form} />
              )}

              {scheduleType === 'cyclic' && (
                <CyclicConfigFields form={form} />
              )}

              {scheduleType === 'dayOfWeek' && (
                <DayOfWeekConfigFields form={form} />
              )}

              {scheduleType === 'multiPhase' && (
                <MultiPhaseConfigFields
                  form={form}
                  phases={phaseFields}
                  onAddPhase={handleAddPhase}
                  onRemovePhase={removePhase}
                />
              )}
            </div>

            {/* Start/End Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {medication ? 'Save Changes' : 'Add Medication'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Dose Times Selector Component
function DoseTimesSelector({
  form,
}: {
  form: ReturnType<typeof useForm<MedicationFormValues>>;
  scheduleType: ScheduleType;
}) {
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
}

// Starting Dose Times Input for Linear Titration
function LinearStartingDoseTimesInput({
  form,
}: {
  form: ReturnType<typeof useForm<MedicationFormValues>>;
}) {
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
}

// Linear Maximum Dose Times Input (per dose time maximum)
function LinearMaximumDoseTimesInput({
  form,
}: {
  form: ReturnType<typeof useForm<MedicationFormValues>>;
}) {
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
}

// Cyclic Dose Times Input
function CyclicDoseTimesInput({
  form,
}: {
  form: ReturnType<typeof useForm<MedicationFormValues>>;
}) {
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
}

// Linear Titration Config Fields
function LinearConfigFields({ form }: { form: ReturnType<typeof useForm<MedicationFormValues>> }) {
  const doseTimesMode = form.watch('doseTimesMode');

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-700">Linear Titration Settings</h4>

      {/* Dose Times Selector */}
      <DoseTimesSelector form={form} scheduleType="linear" />

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
}

// Titration Mode Settings Component for multiple dose times
function TitrationModeSettings({
  form,
}: {
  form: ReturnType<typeof useForm<MedicationFormValues>>;
}) {
  const titrationMode = form.watch('linearTitrationMode');
  const watchedEnabledDoseTimes = form.watch('enabledDoseTimes');
  const watchedTitrationSequence = form.watch('linearTitrationSequence');
  const titrationDirection = form.watch('linearTitrationDirection');

  const enabledDoseTimes = useMemo(() => watchedEnabledDoseTimes ?? [], [watchedEnabledDoseTimes]);
  const titrationSequence = useMemo(() => watchedTitrationSequence ?? [], [watchedTitrationSequence]);

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

  const handleSequenceChange = (time: string, newPosition: number) => {
    const currentSequence = [...(titrationSequence.length > 0 ? titrationSequence : enabledDoseTimes)];
    const currentPosition = currentSequence.indexOf(time);

    if (currentPosition === -1) return;

    // Remove from current position
    currentSequence.splice(currentPosition, 1);
    // Insert at new position (newPosition is 1-indexed)
    currentSequence.splice(newPosition - 1, 0, time);

    form.setValue('linearTitrationSequence', currentSequence);
  };

  const getPositionForTime = (time: string): number => {
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

      {/* Sequential Settings - only shown if mode is 'sequential' */}
      {titrationMode === 'sequential' && (
        <>
          {/* Titration Sequence */}
          <div className="space-y-2">
            <FormLabel>Titration Sequence (which dose time changes first)</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {enabledDoseTimes.map((time) => (
                <div key={time} className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={enabledDoseTimes.length}
                    className="w-16"
                    value={getPositionForTime(time)}
                    onChange={(e) => handleSequenceChange(time, Number(e.target.value) || 1)}
                  />
                  <span className="text-sm">{DOSE_TIME_LABELS[time as DoseTimeName]}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">Enter 1 for first to change, 2 for second, etc.</p>
          </div>

          {/* Increments Per Dose Time */}
          <FormField
            control={form.control}
            name="linearIncrementsPerDoseTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Increments before moving to next dose time</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    className="w-24"
                    value={field.value || 1}
                    onChange={(e) => field.onChange(Number(e.target.value) || 1)}
                  />
                </FormControl>
                <p className="text-xs text-gray-500">
                  e.g., "2" means: 1N → 2N → 3N → 1M+3N → 2M+3N → ...
                </p>
              </FormItem>
            )}
          />
        </>
      )}
    </div>
  );
}

// Cyclic Dosing Config Fields
function CyclicConfigFields({ form }: { form: ReturnType<typeof useForm<MedicationFormValues>> }) {
  const doseTimesMode = form.watch('doseTimesMode');

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-700">Cyclic Dosing Settings</h4>
      <p className="text-sm text-gray-600">
        e.g., OCP: 21 days taking medication, 7 days off
      </p>

      {/* Dose Times Selector */}
      <DoseTimesSelector form={form} scheduleType="cyclic" />

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
                  placeholder="e.g., 30"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                />
              </FormControl>
              <FormMessage />
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
              <FormMessage />
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
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

// Day-of-Week Config Fields
function DayOfWeekConfigFields({ form }: { form: ReturnType<typeof useForm<MedicationFormValues>> }) {
  const days = [
    { name: 'dowMonday' as const, label: 'Mon' },
    { name: 'dowTuesday' as const, label: 'Tue' },
    { name: 'dowWednesday' as const, label: 'Wed' },
    { name: 'dowThursday' as const, label: 'Thu' },
    { name: 'dowFriday' as const, label: 'Fri' },
    { name: 'dowSaturday' as const, label: 'Sat' },
    { name: 'dowSunday' as const, label: 'Sun' },
  ];

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-700">Day-of-Week Dosing</h4>
      <p className="text-sm text-gray-600">
        Enter dose for each day. Leave blank or 0 for days off (e.g., warfarin dosing).
      </p>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <FormField
            key={day.name}
            control={form.control}
            name={day.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-center block text-xs">{day.label}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    className="text-center text-sm"
                    placeholder="-"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  );
}

// Multi-Phase Taper Config Fields
function MultiPhaseConfigFields({
  form,
  phases,
  onAddPhase,
  onRemovePhase,
}: {
  form: ReturnType<typeof useForm<MedicationFormValues>>;
  phases: { id: string }[];
  onAddPhase: () => void;
  onRemovePhase: (index: number) => void;
}) {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-700">Multi-Phase Taper</h4>
      <p className="text-sm text-gray-600">
        Define each phase of the taper with dose and duration.
      </p>
      <div className="space-y-2">
        {phases.map((field, index) => (
          <div key={field.id} className="flex items-center gap-3 p-2 bg-white rounded border">
            <span className="text-sm text-gray-500 w-16">Phase {index + 1}</span>
            <FormField
              control={form.control}
              name={`phases.${index}.dose`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="Dose"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <span className="text-sm text-gray-500">{form.watch('unit')}</span>
            <span className="text-sm text-gray-500">for</span>
            <FormField
              control={form.control}
              name={`phases.${index}.durationDays`}
              render={({ field }) => (
                <FormItem className="w-20">
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="1"
                      placeholder="Days"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 1)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <span className="text-sm text-gray-500">days</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onRemovePhase(index)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onAddPhase}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Phase
      </Button>
    </div>
  );
}

// Helper functions
function getDefaultValues(): MedicationFormValues {
  return {
    medicationName: '',
    unit: 'mg',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    scheduleType: 'linear',

    // Dose times mode
    doseTimesMode: 'single',
    enabledDoseTimes: ['mane'],

    linearStartingDose: 0,
    linearTitrationDirection: 'decrease',
    linearChangeAmount: 0,
    linearIntervalDays: 7,
    linearMinimumDose: undefined,
    linearMaximumDose: undefined,
    linearStartingDoseTimes: [],
    linearMaximumDoseTimes: [],
    linearTitrationMode: 'together',
    linearTitrationSequence: [],
    linearIncrementsPerDoseTime: 1,

    cyclicDose: 0,
    cyclicDaysOn: 21,
    cyclicDaysOff: 7,
    cyclicDoseTimes: [],

    dowMonday: undefined,
    dowTuesday: undefined,
    dowWednesday: undefined,
    dowThursday: undefined,
    dowFriday: undefined,
    dowSaturday: undefined,
    dowSunday: undefined,
    dowMondayTimes: [],
    dowTuesdayTimes: [],
    dowWednesdayTimes: [],
    dowThursdayTimes: [],
    dowFridayTimes: [],
    dowSaturdayTimes: [],
    dowSundayTimes: [],

    phases: [],

    preparationMode: 'none',
    preparations: [],
  };
}

function medicationToFormValues(medication: MedicationSchedule): MedicationFormValues {
  // Determine dose times mode from the schedule type config
  let doseTimesMode: DoseTimesMode = 'single';
  let enabledDoseTimes: DoseTimeName[] = ['mane'];

  if (medication.linearConfig?.doseTimesMode === 'multiple') {
    doseTimesMode = 'multiple';
    enabledDoseTimes = medication.linearConfig.enabledDoseTimes ?? ['mane'];
  } else if (medication.cyclicConfig?.doseTimesMode === 'multiple') {
    doseTimesMode = 'multiple';
    enabledDoseTimes = medication.cyclicConfig.doseTimes?.map(dt => dt.time) ?? ['mane'];
  } else if (medication.dayOfWeekConfig?.doseTimesMode === 'multiple') {
    doseTimesMode = 'multiple';
    enabledDoseTimes = medication.dayOfWeekConfig.enabledDoseTimes ?? ['mane'];
  } else if (medication.multiPhaseConfig?.doseTimesMode === 'multiple') {
    doseTimesMode = 'multiple';
    enabledDoseTimes = medication.multiPhaseConfig.enabledDoseTimes ?? ['mane'];
  }

  return {
    medicationName: medication.medicationName,
    unit: medication.unit,
    startDate: medication.startDate.toISOString().split('T')[0],
    endDate: medication.endDate ? medication.endDate.toISOString().split('T')[0] : '',
    scheduleType: medication.scheduleType,

    // Dose times mode
    doseTimesMode,
    enabledDoseTimes,

    linearStartingDose: medication.linearConfig?.startingDose ?? 0,
    linearTitrationDirection: medication.linearConfig?.titrationDirection ?? 'decrease',
    linearChangeAmount: medication.linearConfig?.changeAmount ?? 0,
    linearIntervalDays: medication.linearConfig?.intervalDays ?? 7,
    linearMinimumDose: medication.linearConfig?.minimumDose,
    linearMaximumDose: medication.linearConfig?.maximumDose,
    linearStartingDoseTimes: medication.linearConfig?.startingDoseTimes?.map(dt => ({
      time: dt.time,
      dose: dt.dose,
    })) ?? [],
    linearMaximumDoseTimes: medication.linearConfig?.maximumDoseTimes?.map(dt => ({
      time: dt.time,
      dose: dt.dose,
    })) ?? [],
    linearTitrationMode: medication.linearConfig?.titrationMode ?? 'together',
    linearTitrationSequence: medication.linearConfig?.titrationSequence ?? [],
    linearIncrementsPerDoseTime: medication.linearConfig?.incrementsPerDoseTime ?? 1,

    cyclicDose: medication.cyclicConfig?.dose ?? 0,
    cyclicDaysOn: medication.cyclicConfig?.daysOn ?? 21,
    cyclicDaysOff: medication.cyclicConfig?.daysOff ?? 7,
    cyclicDoseTimes: medication.cyclicConfig?.doseTimes?.map(dt => ({
      time: dt.time,
      dose: dt.dose,
    })) ?? [],

    dowMonday: medication.dayOfWeekConfig?.monday,
    dowTuesday: medication.dayOfWeekConfig?.tuesday,
    dowWednesday: medication.dayOfWeekConfig?.wednesday,
    dowThursday: medication.dayOfWeekConfig?.thursday,
    dowFriday: medication.dayOfWeekConfig?.friday,
    dowSaturday: medication.dayOfWeekConfig?.saturday,
    dowSunday: medication.dayOfWeekConfig?.sunday,
    dowMondayTimes: medication.dayOfWeekConfig?.mondayTimes?.map(dt => ({ time: dt.time, dose: dt.dose })) ?? [],
    dowTuesdayTimes: medication.dayOfWeekConfig?.tuesdayTimes?.map(dt => ({ time: dt.time, dose: dt.dose })) ?? [],
    dowWednesdayTimes: medication.dayOfWeekConfig?.wednesdayTimes?.map(dt => ({ time: dt.time, dose: dt.dose })) ?? [],
    dowThursdayTimes: medication.dayOfWeekConfig?.thursdayTimes?.map(dt => ({ time: dt.time, dose: dt.dose })) ?? [],
    dowFridayTimes: medication.dayOfWeekConfig?.fridayTimes?.map(dt => ({ time: dt.time, dose: dt.dose })) ?? [],
    dowSaturdayTimes: medication.dayOfWeekConfig?.saturdayTimes?.map(dt => ({ time: dt.time, dose: dt.dose })) ?? [],
    dowSundayTimes: medication.dayOfWeekConfig?.sundayTimes?.map(dt => ({ time: dt.time, dose: dt.dose })) ?? [],

    phases: medication.multiPhaseConfig?.phases.map(p => ({
      id: p.id,
      dose: p.dose,
      durationDays: p.durationDays,
      doseTimes: p.doseTimes?.map(dt => ({ time: dt.time, dose: dt.dose })),
    })) ?? [],

    preparationMode: medication.preparationMode,
    preparations: medication.preparations?.map(p => ({
      id: p.id,
      strength: p.strength,
      canBeHalved: p.canBeHalved,
    })) ?? [],
  };
}

function formValuesToMedication(
  data: MedicationFormValues,
  existingId?: string,
  optimisedPreps?: Preparation[]
): MedicationSchedule {
  const medication: MedicationSchedule = {
    id: existingId || `med-${Date.now()}`,
    medicationName: data.medicationName,
    unit: data.unit as 'mg' | 'mcg' | 'mL' | 'units',
    startDate: new Date(data.startDate),
    endDate: data.endDate ? new Date(data.endDate) : undefined,
    scheduleType: data.scheduleType as ScheduleType,
    preparationMode: data.preparationMode as PreparationMode,
    doseTimesMode: data.doseTimesMode as DoseTimesMode,
    enabledDoseTimes: data.enabledDoseTimes as DoseTimeName[],
  };

  const doseTimesMode = data.doseTimesMode as DoseTimesMode;
  const enabledDoseTimes = data.enabledDoseTimes as DoseTimeName[];

  // Add config based on schedule type
  switch (data.scheduleType) {
    case 'linear':
      medication.linearConfig = {
        startingDose: data.linearStartingDose ?? 0,
        titrationDirection: (data.linearTitrationDirection as 'increase' | 'decrease' | 'maintain') ?? 'decrease',
        changeAmount: data.linearChangeAmount ?? 0,
        intervalDays: data.linearIntervalDays ?? 7,
        minimumDose: data.linearMinimumDose,
        maximumDose: data.linearMaximumDose,
        doseTimesMode: doseTimesMode,
        enabledDoseTimes: enabledDoseTimes,
        startingDoseTimes: doseTimesMode === 'multiple'
          ? (data.linearStartingDoseTimes ?? [])
              .filter(dt => enabledDoseTimes.includes(dt.time as DoseTimeName))
              .map(dt => ({
                time: dt.time as DoseTimeName,
                dose: dt.dose,
              }))
          : undefined,
        maximumDoseTimes: doseTimesMode === 'multiple'
          ? (data.linearMaximumDoseTimes ?? [])
              .filter(dt => enabledDoseTimes.includes(dt.time as DoseTimeName) && dt.dose > 0)
              .map(dt => ({
                time: dt.time as DoseTimeName,
                dose: dt.dose,
              }))
          : undefined,
        // Enhanced titration settings for multiple dose times
        titrationMode: doseTimesMode === 'multiple'
          ? (data.linearTitrationMode as TitrationMode) ?? 'together'
          : undefined,
        titrationSequence: doseTimesMode === 'multiple' && data.linearTitrationMode === 'sequential'
          ? (data.linearTitrationSequence as DoseTimeName[])
          : undefined,
        incrementsPerDoseTime: doseTimesMode === 'multiple' && data.linearTitrationMode === 'sequential'
          ? data.linearIncrementsPerDoseTime ?? 1
          : undefined,
      };
      break;

    case 'cyclic':
      medication.cyclicConfig = {
        dose: data.cyclicDose ?? 0,
        daysOn: data.cyclicDaysOn ?? 21,
        daysOff: data.cyclicDaysOff ?? 7,
        doseTimesMode: doseTimesMode,
        doseTimes: doseTimesMode === 'multiple'
          ? (data.cyclicDoseTimes ?? [])
              .filter(dt => enabledDoseTimes.includes(dt.time as DoseTimeName))
              .map(dt => ({
                time: dt.time as DoseTimeName,
                dose: dt.dose,
              }))
          : undefined,
      };
      break;

    case 'dayOfWeek':
      const filterDayTimes = (times?: { time: string; dose: number }[]) =>
        doseTimesMode === 'multiple' && times
          ? times.filter(dt => enabledDoseTimes.includes(dt.time as DoseTimeName)).map(dt => ({ time: dt.time as DoseTimeName, dose: dt.dose }))
          : undefined;
      medication.dayOfWeekConfig = {
        monday: data.dowMonday,
        tuesday: data.dowTuesday,
        wednesday: data.dowWednesday,
        thursday: data.dowThursday,
        friday: data.dowFriday,
        saturday: data.dowSaturday,
        sunday: data.dowSunday,
        doseTimesMode: doseTimesMode,
        enabledDoseTimes: enabledDoseTimes,
        mondayTimes: filterDayTimes(data.dowMondayTimes),
        tuesdayTimes: filterDayTimes(data.dowTuesdayTimes),
        wednesdayTimes: filterDayTimes(data.dowWednesdayTimes),
        thursdayTimes: filterDayTimes(data.dowThursdayTimes),
        fridayTimes: filterDayTimes(data.dowFridayTimes),
        saturdayTimes: filterDayTimes(data.dowSaturdayTimes),
        sundayTimes: filterDayTimes(data.dowSundayTimes),
      };
      break;

    case 'multiPhase':
      medication.multiPhaseConfig = {
        phases: (data.phases ?? []).map((p) => ({
          id: p.id,
          dose: p.dose,
          durationDays: p.durationDays,
          doseTimes: doseTimesMode === 'multiple' && p.doseTimes
            ? p.doseTimes
                .filter(dt => enabledDoseTimes.includes(dt.time as DoseTimeName))
                .map(dt => ({ time: dt.time as DoseTimeName, dose: dt.dose }))
            : undefined,
        })),
        doseTimesMode: doseTimesMode,
        enabledDoseTimes: enabledDoseTimes,
      };
      break;
  }

  // Add preparations based on mode
  if (data.preparationMode === 'specify' && data.preparations) {
    medication.preparations = data.preparations.map((p: { id: string; strength: number; canBeHalved: boolean }) => ({
      id: p.id,
      strength: p.strength,
      unit: data.unit as 'mg' | 'mcg' | 'mL' | 'units',
      canBeHalved: p.canBeHalved,
    }));
  } else if (data.preparationMode === 'optimise' && optimisedPreps) {
    medication.optimisedPreparations = optimisedPreps;
  }

  return medication;
}
