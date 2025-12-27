/**
 * Booking Form Step
 * Extracted from InlineBookingWidget.tsx lines 339-494
 */

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Textarea } from '../../ui/Textarea';
import { Alert, AlertDescription } from '../../ui/Alert';
import { formatBookingTime } from '../../../utils/booking';
import type { z } from 'zod';
import type { inlineBookingSchema } from '../../../schemas/booking';

type BookingFormData = z.infer<typeof inlineBookingSchema>;

interface BookingFormStepProps {
  selectedDate: Date;
  selectedTime: string;
  form: UseFormReturn<BookingFormData>;
  onSubmit: (data: BookingFormData) => void;
  onBack: () => void;
  isSubmitting: boolean;
  submitError: string | null;
}

export const BookingFormStep: React.FC<BookingFormStepProps> = ({
  selectedDate,
  selectedTime,
  form,
  onSubmit,
  onBack,
  isSubmitting,
  submitError,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">Booking Details</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          Change Time
        </Button>
      </div>

      {/* Selected Appointment Summary */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
        <div className="text-sm text-blue-900">
          <div className="font-medium mb-1">Selected Appointment:</div>
          <div>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</div>
          <div>{formatBookingTime(selectedTime)}</div>
        </div>
      </div>

      {/* Patient Information */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-900">Patient Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="patientFirstName">First Name *</Label>
            <Input
              id="patientFirstName"
              {...register('patientFirstName')}
              className={errors.patientFirstName ? 'border-red-500' : ''}
            />
            {errors.patientFirstName && (
              <p className="text-sm text-red-600 mt-1">{errors.patientFirstName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="patientLastName">Last Name *</Label>
            <Input
              id="patientLastName"
              {...register('patientLastName')}
              className={errors.patientLastName ? 'border-red-500' : ''}
            />
            {errors.patientLastName && (
              <p className="text-sm text-red-600 mt-1">{errors.patientLastName.message}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="patientPhone">Phone *</Label>
            <Input
              id="patientPhone"
              type="tel"
              {...register('patientPhone')}
              className={errors.patientPhone ? 'border-red-500' : ''}
            />
            {errors.patientPhone && (
              <p className="text-sm text-red-600 mt-1">{errors.patientPhone.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="patientEmail">Email (optional)</Label>
            <Input
              id="patientEmail"
              type="email"
              {...register('patientEmail')}
              className={errors.patientEmail ? 'border-red-500' : ''}
            />
            {errors.patientEmail && (
              <p className="text-sm text-red-600 mt-1">{errors.patientEmail.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Referrer Information */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-900">Referrer Information</h4>
        <div>
          <Label htmlFor="referrerName">Referrer Name *</Label>
          <Input
            id="referrerName"
            {...register('referrerName')}
            className={errors.referrerName ? 'border-red-500' : ''}
          />
          {errors.referrerName && (
            <p className="text-sm text-red-600 mt-1">{errors.referrerName.message}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="referrerEmail">Email (optional)</Label>
            <Input
              id="referrerEmail"
              type="email"
              {...register('referrerEmail')}
              className={errors.referrerEmail ? 'border-red-500' : ''}
            />
            {errors.referrerEmail && (
              <p className="text-sm text-red-600 mt-1">{errors.referrerEmail.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="referrerPhone">Phone (optional)</Label>
            <Input
              id="referrerPhone"
              type="tel"
              {...register('referrerPhone')}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="referrerClinic">Clinic Name (optional)</Label>
          <Input id="referrerClinic" {...register('referrerClinic')} />
        </div>
      </div>

      {/* Additional Details */}
      <div className="space-y-4 mb-6">
        <div>
          <Label htmlFor="referralReason">Referral Reason (optional)</Label>
          <Textarea
            id="referralReason"
            {...register('referralReason')}
            placeholder="Briefly describe the reason for referral"
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="notes">Additional Notes (optional)</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Any additional information"
            rows={3}
          />
        </div>
      </div>

      {submitError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          'Confirm Booking'
        )}
      </Button>
    </form>
  );
};
