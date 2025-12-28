import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from '../ui';
import type { PatientDetails } from '../../types/doseCalculator';

const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  address: z.string().min(5, 'Address must be at least 5 characters').max(200, 'Address too long'),
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface PatientDetailsFormProps {
  patient: PatientDetails | null;
  onUpdate: (patient: PatientDetails) => void;
}

export const PatientDetailsForm: React.FC<PatientDetailsFormProps> = ({ patient, onUpdate }) => {
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: patient?.name || '',
      dateOfBirth: patient?.dateOfBirth ? patient.dateOfBirth.toISOString().split('T')[0] : '',
      address: patient?.address || '',
    },
  });

  const onSubmit = (data: PatientFormValues) => {
    onUpdate({
      name: data.name,
      dateOfBirth: new Date(data.dateOfBirth),
      address: data.address,
    });
  };

  // Auto-save on blur
  const handleBlur = () => {
    form.handleSubmit(onSubmit)();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-3">
          <span className="text-2xl">👤</span>
          Patient Details
        </CardTitle>
        <CardDescription className="font-body">
          Enter patient information for the medication schedule
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., John Smith"
                      onBlur={handleBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      onBlur={handleBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="e.g., 123 Main St, Sydney NSW 2000"
                      rows={3}
                      onBlur={handleBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
