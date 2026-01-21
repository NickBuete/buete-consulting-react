import { useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Sparkles, ChevronLeft, ChevronRight, Package } from 'lucide-react';
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
} from '../../ui';
import { WizardStepper, type WizardStep } from '../../ui/WizardStepper';
import { DateInput } from '../../ui/DateInput';
import type {
  MedicationSchedule,
  ScheduleType,
  PreparationMode,
} from '../../../types/doseCalculator';
import { optimizePreparations, getUniqueDoses } from '../../../utils/doseCalculation';
import { medicationSchema, type MedicationFormValues } from './schema';
import { formValuesToMedication, getDefaultValues, medicationToFormValues } from './mappers';
import { LinearConfigFields } from './sections/LinearSection';
import { CyclicConfigFields } from './sections/CyclicSection';
import { DayOfWeekConfigFields } from './sections/DayOfWeekSection';
import { MultiPhaseConfigFields } from './sections/MultiPhaseSection';
import { ScheduleTypeSelector } from './ScheduleTypeSelector';

const WIZARD_STEPS: WizardStep[] = [
  { id: 'basics', label: 'Basics', description: 'Name & type' },
  { id: 'schedule', label: 'Schedule', description: 'Configure doses' },
  { id: 'preparations', label: 'Tablets', description: 'Optional tracking' },
  { id: 'review', label: 'Review', description: 'Confirm & save' },
];

interface MedicationFormWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication?: MedicationSchedule;
  onSave: (medication: MedicationSchedule) => void;
}

export const MedicationFormWizard: React.FC<MedicationFormWizardProps> = ({
  open,
  onOpenChange,
  medication,
  onSave,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

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
  const medicationName = form.watch('medicationName');
  const startDate = form.watch('startDate');

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
      setCurrentStep(0);
    }
  }, [medication, open, form]);

  // Reset step when dialog closes
  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
    }
  }, [open]);

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

  const canGoNext = () => {
    switch (currentStep) {
      case 0: // Basics
        return medicationName.trim().length > 0 && startDate.length > 0;
      case 1: // Schedule
        return true; // Schedule config is optional in most cases
      case 2: // Preparations
        return true; // Preparations are optional
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1 && canGoNext()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Only allow going to completed or current steps
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const getScheduleTypeLabel = () => {
    const labels: Record<ScheduleType, string> = {
      linear: 'Linear Titration',
      cyclic: 'Cyclic Dosing',
      dayOfWeek: 'Day-of-Week',
      multiPhase: 'Multi-Phase',
    };
    return labels[scheduleType] || scheduleType;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('[data-radix-select-content]')) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
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
            {currentStep === 0 && 'Start by entering the medication details'}
            {currentStep === 1 && 'Configure the dosing schedule'}
            {currentStep === 2 && 'Optionally track tablet preparations'}
            {currentStep === 3 && 'Review and save your medication'}
          </DialogDescription>
        </DialogHeader>

        {/* Wizard Stepper */}
        <div className="py-4 border-b">
          <WizardStepper
            steps={WIZARD_STEPS}
            currentStep={currentStep}
            onStepClick={handleStepClick}
            allowNavigation={true}
          />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            {/* Step 1: Basics */}
            {currentStep === 0 && (
              <div className="space-y-6">
                {/* Medication Name and Unit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="medicationName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medication Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Prednisolone" autoFocus />
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

                {/* Start/End Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <DateInput
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select start date"
                            minYearsFromNow={-1}
                            maxYearsFromNow={2}
                          />
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
                          <DateInput
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select end date"
                            minYearsFromNow={-1}
                            maxYearsFromNow={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Schedule Type Selector */}
                <div className="space-y-3">
                  <FormLabel className="text-base font-semibold">Schedule Type</FormLabel>
                  <FormField
                    control={form.control}
                    name="scheduleType"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ScheduleTypeSelector
                            value={field.value as ScheduleType}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Schedule Configuration */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="rounded-xl border-2 border-gray-100 p-5 bg-gray-50/50">
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
              </div>
            )}

            {/* Step 3: Preparations */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <Package className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Tablet Tracking (Optional)</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Add tablet preparations to see how many of each tablet to take for each dose.
                      This is helpful for complex tapers with multiple tablet strengths.
                    </p>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="preparationMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Tracking Mode</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12">
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
                  <div className="space-y-4 p-4 bg-white rounded-xl border">
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
                                  className="h-11"
                                  value={field.value || ''}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <span className="text-sm text-gray-500 w-12">{unit}</span>
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
                              <Label className="text-sm whitespace-nowrap">Can halve</Label>
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removePrep(index)}
                          className="text-red-600 h-11 w-11 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddPreparation}
                      className="gap-2 h-11"
                    >
                      <Plus className="h-4 w-4" />
                      Add Preparation
                    </Button>
                  </div>
                )}

                {preparationMode === 'optimise' && uniqueDoses.length > 0 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-blue-900">Optimised Preparations</span>
                    </div>
                    <p className="text-sm text-blue-800 mb-3">
                      Based on doses needed ({uniqueDoses.join(', ')} {unit}), we recommend:
                    </p>
                    {optimisedPreps.length > 0 ? (
                      <ul className="text-sm text-blue-900 space-y-1.5">
                        {optimisedPreps.map((prep, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                            {prep.strength}{prep.unit} tablets/capsules
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-blue-700 italic">
                        Could not determine optimal preparations. Please specify manually.
                      </p>
                    )}
                    <p className="text-xs text-blue-600 mt-3 pt-3 border-t border-blue-200">
                      Max 4 units per dose. Exact strengths compounded (no halving needed).
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="rounded-xl border-2 border-gray-200 divide-y divide-gray-200 overflow-hidden">
                  {/* Medication Info */}
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{medicationName || 'Unnamed Medication'}</h3>
                        <p className="text-sm text-gray-600">
                          {getScheduleTypeLabel()} • {unit}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(0)}
                        className="text-brand-600"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Date Range</p>
                        <p className="font-medium">
                          {startDate ? new Date(startDate).toLocaleDateString() : 'Not set'}
                          {(() => { const endDate = form.watch('endDate'); return endDate ? ` - ${new Date(endDate).toLocaleDateString()}` : ''; })()}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(0)}
                        className="text-brand-600"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>

                  {/* Schedule Summary */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Schedule Configuration</p>
                        <p className="font-medium">{getScheduleTypeLabel()}</p>
                        {scheduleType === 'linear' && (
                          <p className="text-sm text-gray-600">
                            {form.watch('linearTitrationDirection')} by {form.watch('linearChangeAmount')} {unit} every {form.watch('linearIntervalDays')} days
                          </p>
                        )}
                        {scheduleType === 'cyclic' && (
                          <p className="text-sm text-gray-600">
                            {form.watch('cyclicDaysOn')} days on, {form.watch('cyclicDaysOff')} days off
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(1)}
                        className="text-brand-600"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>

                  {/* Preparations Summary */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Tablet Tracking</p>
                        <p className="font-medium">
                          {preparationMode === 'none' && 'Not tracking'}
                          {preparationMode === 'specify' && `${prepFields.length} preparation(s) specified`}
                          {preparationMode === 'optimise' && `${optimisedPreps.length} optimised preparation(s)`}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(2)}
                        className="text-brand-600"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Footer */}
            <DialogFooter className="flex-col sm:flex-row gap-2 pt-4 border-t">
              <div className="flex gap-2 w-full sm:w-auto">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    className="flex-1 sm:flex-none gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                {currentStep < WIZARD_STEPS.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!canGoNext()}
                    className="flex-1 sm:flex-none gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" className="flex-1 sm:flex-none">
                    {medication ? 'Save Changes' : 'Add Medication'}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
