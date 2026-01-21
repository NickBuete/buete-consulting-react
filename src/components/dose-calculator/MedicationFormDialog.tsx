import { useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
} from '../../types/doseCalculator';
import { optimizePreparations, getUniqueDoses } from '../../utils/doseCalculation';
import { medicationSchema, type MedicationFormValues } from './MedicationFormDialog/schema';
import { formValuesToMedication, getDefaultValues, medicationToFormValues } from './MedicationFormDialog/mappers';
import { LinearConfigFields } from './MedicationFormDialog/sections/LinearSection';
import { CyclicConfigFields } from './MedicationFormDialog/sections/CyclicSection';
import { DayOfWeekConfigFields } from './MedicationFormDialog/sections/DayOfWeekSection';
import { MultiPhaseConfigFields } from './MedicationFormDialog/sections/MultiPhaseSection';


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
