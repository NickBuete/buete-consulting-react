import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
} from '../ui';
import type { MedicationSchedule } from '../../types/doseCalculator';

const medicationSchema = z.object({
  medicationName: z.string().min(1, 'Medication name is required'),
  strength: z.number().positive('Strength must be positive'),
  unit: z.string(),
  startingDose: z.number().positive('Starting dose must be positive'),
  titrationDirection: z.string(),
  changeAmount: z.number().nonnegative('Change amount must be 0 or greater'),
  intervalDays: z.number().int().min(1, 'Interval must be at least 1 day'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  minimumDose: z.number().nonnegative().optional(),
  maximumDose: z.number().positive().optional(),
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
    defaultValues: {
      medicationName: '',
      strength: 0,
      unit: 'mg',
      startingDose: 0,
      titrationDirection: 'decrease',
      changeAmount: 0,
      intervalDays: 7,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      minimumDose: undefined,
      maximumDose: undefined,
    },
  });

  // Reset form when medication changes or dialog opens
  useEffect(() => {
    if (medication) {
      form.reset({
        medicationName: medication.medicationName,
        strength: medication.strength,
        unit: medication.unit,
        startingDose: medication.startingDose,
        titrationDirection: medication.titrationDirection,
        changeAmount: medication.changeAmount,
        intervalDays: medication.intervalDays,
        startDate: medication.startDate.toISOString().split('T')[0],
        endDate: medication.endDate ? medication.endDate.toISOString().split('T')[0] : '',
        minimumDose: medication.minimumDose,
        maximumDose: medication.maximumDose,
      });
    } else if (open) {
      form.reset({
        medicationName: '',
        strength: 0,
        unit: 'mg',
        startingDose: 0,
        titrationDirection: 'decrease',
        changeAmount: 0,
        intervalDays: 7,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        minimumDose: undefined,
        maximumDose: undefined,
      });
    }
  }, [medication, open, form]);

  const onSubmit = (data: MedicationFormValues) => {
    const medicationData: MedicationSchedule = {
      id: medication?.id || `med-${Date.now()}`,
      medicationName: data.medicationName,
      strength: data.strength,
      unit: data.unit as 'mg' | 'mcg' | 'mL' | 'units',
      startingDose: data.startingDose,
      titrationDirection: data.titrationDirection as 'increase' | 'decrease' | 'maintain',
      changeAmount: data.changeAmount,
      intervalDays: data.intervalDays,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      minimumDose: data.minimumDose,
      maximumDose: data.maximumDose,
    };

    onSave(medicationData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {medication ? 'Edit Medication' : 'Add Medication'}
          </DialogTitle>
          <DialogDescription className="font-body">
            Configure the medication details and titration schedule
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Medication Name and Strength */}
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

              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="strength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strength</FormLabel>
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
            </div>

            {/* Titration Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="startingDose"
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
                name="titrationDirection"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Direction</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                name="changeAmount"
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

            {/* Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="intervalDays"
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
            </div>

            {/* Optional: End Date and Dose Limits */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-4">
                Optional: Set end date or dose limits
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <FormField
                  control={form.control}
                  name="minimumDose"
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
                  name="maximumDose"
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
