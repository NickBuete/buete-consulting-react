import React, { useEffect, useMemo } from 'react';
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
import type { MedicationSchedule, ScheduleType, PreparationMode, Preparation } from '../../types/doseCalculator';
import { optimizePreparations, getUniqueDoses } from '../../utils/doseCalculation';

// Zod schema for preparation
const preparationSchema = z.object({
  id: z.string(),
  strength: z.number().positive('Strength must be positive'),
  canBeHalved: z.boolean(),
});

// Zod schema for taper phase
const taperPhaseSchema = z.object({
  id: z.string(),
  dose: z.number().nonnegative('Dose must be 0 or greater'),
  durationDays: z.number().int().positive('Duration must be at least 1 day'),
});

// Main medication schema
const medicationSchema = z.object({
  medicationName: z.string().min(1, 'Medication name is required'),
  unit: z.string(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  scheduleType: z.string(),

  // Linear config
  linearStartingDose: z.number().nonnegative().optional(),
  linearTitrationDirection: z.string().optional(),
  linearChangeAmount: z.number().nonnegative().optional(),
  linearIntervalDays: z.number().int().min(1).optional(),
  linearMinimumDose: z.number().nonnegative().optional(),
  linearMaximumDose: z.number().positive().optional(),

  // Cyclic config
  cyclicDose: z.number().nonnegative().optional(),
  cyclicDaysOn: z.number().int().min(1).optional(),
  cyclicDaysOff: z.number().int().min(0).optional(),

  // Day of week config
  dowMonday: z.number().nonnegative().optional(),
  dowTuesday: z.number().nonnegative().optional(),
  dowWednesday: z.number().nonnegative().optional(),
  dowThursday: z.number().nonnegative().optional(),
  dowFriday: z.number().nonnegative().optional(),
  dowSaturday: z.number().nonnegative().optional(),
  dowSunday: z.number().nonnegative().optional(),

  // Multi-phase config
  phases: z.array(taperPhaseSchema).optional(),

  // Preparation config
  preparationMode: z.string(),
  preparations: z.array(preparationSchema).optional(),
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
                      <SelectContent>
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
                      <SelectContent>
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

            {/* Preparation Configuration */}
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
                      <SelectContent>
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

// Linear Titration Config Fields
function LinearConfigFields({ form }: { form: ReturnType<typeof useForm<MedicationFormValues>> }) {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-700">Linear Titration Settings</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <SelectContent>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
    </div>
  );
}

// Cyclic Dosing Config Fields
function CyclicConfigFields({ form }: { form: ReturnType<typeof useForm<MedicationFormValues>> }) {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-700">Cyclic Dosing Settings</h4>
      <p className="text-sm text-gray-600">
        e.g., OCP: 21 days taking medication, 7 days off
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

    linearStartingDose: 0,
    linearTitrationDirection: 'decrease',
    linearChangeAmount: 0,
    linearIntervalDays: 7,
    linearMinimumDose: undefined,
    linearMaximumDose: undefined,

    cyclicDose: 0,
    cyclicDaysOn: 21,
    cyclicDaysOff: 7,

    dowMonday: undefined,
    dowTuesday: undefined,
    dowWednesday: undefined,
    dowThursday: undefined,
    dowFriday: undefined,
    dowSaturday: undefined,
    dowSunday: undefined,

    phases: [],

    preparationMode: 'none',
    preparations: [],
  };
}

function medicationToFormValues(medication: MedicationSchedule): MedicationFormValues {
  return {
    medicationName: medication.medicationName,
    unit: medication.unit,
    startDate: medication.startDate.toISOString().split('T')[0],
    endDate: medication.endDate ? medication.endDate.toISOString().split('T')[0] : '',
    scheduleType: medication.scheduleType,

    linearStartingDose: medication.linearConfig?.startingDose ?? 0,
    linearTitrationDirection: medication.linearConfig?.titrationDirection ?? 'decrease',
    linearChangeAmount: medication.linearConfig?.changeAmount ?? 0,
    linearIntervalDays: medication.linearConfig?.intervalDays ?? 7,
    linearMinimumDose: medication.linearConfig?.minimumDose,
    linearMaximumDose: medication.linearConfig?.maximumDose,

    cyclicDose: medication.cyclicConfig?.dose ?? 0,
    cyclicDaysOn: medication.cyclicConfig?.daysOn ?? 21,
    cyclicDaysOff: medication.cyclicConfig?.daysOff ?? 7,

    dowMonday: medication.dayOfWeekConfig?.monday,
    dowTuesday: medication.dayOfWeekConfig?.tuesday,
    dowWednesday: medication.dayOfWeekConfig?.wednesday,
    dowThursday: medication.dayOfWeekConfig?.thursday,
    dowFriday: medication.dayOfWeekConfig?.friday,
    dowSaturday: medication.dayOfWeekConfig?.saturday,
    dowSunday: medication.dayOfWeekConfig?.sunday,

    phases: medication.multiPhaseConfig?.phases.map(p => ({
      id: p.id,
      dose: p.dose,
      durationDays: p.durationDays,
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
  };

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
      };
      break;

    case 'cyclic':
      medication.cyclicConfig = {
        dose: data.cyclicDose ?? 0,
        daysOn: data.cyclicDaysOn ?? 21,
        daysOff: data.cyclicDaysOff ?? 7,
      };
      break;

    case 'dayOfWeek':
      medication.dayOfWeekConfig = {
        monday: data.dowMonday,
        tuesday: data.dowTuesday,
        wednesday: data.dowWednesday,
        thursday: data.dowThursday,
        friday: data.dowFriday,
        saturday: data.dowSaturday,
        sunday: data.dowSunday,
      };
      break;

    case 'multiPhase':
      medication.multiPhaseConfig = {
        phases: (data.phases ?? []).map((p: { id: string; dose: number; durationDays: number }) => ({
          id: p.id,
          dose: p.dose,
          durationDays: p.durationDays,
        })),
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
