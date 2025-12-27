import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { TimeSlotPicker } from './TimeSlotPicker';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Alert, AlertDescription } from '../ui/Alert';
import { Loader2 } from 'lucide-react';
import type { AvailabilitySlot, BusySlot, BookingSettings } from '../../types/booking';
import { publicBookingSchema } from '../../schemas/booking';
import { createPublicBooking } from '../../services/booking';
import type { z } from 'zod';

type BookingFormData = z.infer<typeof publicBookingSchema>;

interface BookingFormProps {
  bookingUrl: string;
  pharmacistName: string;
  availabilitySlots: AvailabilitySlot[];
  busySlots: BusySlot[];
  bookingSettings: BookingSettings;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  bookingUrl,
  pharmacistName,
  availabilitySlots,
  busySlots,
  bookingSettings,
}) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(publicBookingSchema),
  });

  // Update form values when date/time are selected
  React.useEffect(() => {
    if (selectedDate) {
      setValue('appointmentDate', format(selectedDate, 'yyyy-MM-dd'));
    }
  }, [selectedDate, setValue]);

  React.useEffect(() => {
    if (selectedTime) {
      setValue('appointmentTime', selectedTime);
    }
  }, [selectedTime, setValue]);

  const onSubmit = async (data: BookingFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      const result = await createPublicBooking(bookingUrl, data);

      // Navigate to confirmation page with booking details
      navigate('/booking/confirmation', {
        state: {
          bookingId: result.bookingId,
          patientName: `${data.patientFirstName} ${data.patientLastName}`,
          patientPhone: data.patientPhone,
          patientEmail: data.patientEmail,
          pharmacistName: result.pharmacistName || pharmacistName,
          appointmentDate: data.appointmentDate,
          appointmentTime: data.appointmentTime,
          requiresApproval: bookingSettings.requireApproval,
        },
      });
    } catch (error) {
      console.error('Booking error:', error);
      setSubmitError(
        error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {submitError && (
        <Alert variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Select Date */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          1. Select a Date
        </h2>
        <AvailabilityCalendar
          availabilitySlots={availabilitySlots}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
        {errors.appointmentDate && (
          <p className="mt-2 text-sm text-red-600">{errors.appointmentDate.message}</p>
        )}
      </div>

      {/* Step 2: Select Time (only show when date is selected) */}
      {selectedDate && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            2. Select a Time
          </h2>
          <TimeSlotPicker
            availabilitySlots={availabilitySlots}
            busySlots={busySlots}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onSelectTime={setSelectedTime}
            bookingSettings={bookingSettings}
          />
          {errors.appointmentTime && (
            <p className="mt-2 text-sm text-red-600">{errors.appointmentTime.message}</p>
          )}
        </div>
      )}

      {/* Step 3: Patient & Referrer Information (only show when time is selected) */}
      {selectedDate && selectedTime && (
        <>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              3. Patient Information
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="patientFirstName">First Name *</Label>
                <Input
                  id="patientFirstName"
                  {...register('patientFirstName')}
                  className={errors.patientFirstName ? 'border-red-500' : ''}
                />
                {errors.patientFirstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.patientFirstName.message}</p>
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
                  <p className="mt-1 text-sm text-red-600">{errors.patientLastName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="patientPhone">Phone Number *</Label>
                <Input
                  id="patientPhone"
                  type="tel"
                  placeholder="0412 345 678"
                  {...register('patientPhone')}
                  className={errors.patientPhone ? 'border-red-500' : ''}
                />
                {errors.patientPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.patientPhone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="patientEmail">Email (Optional)</Label>
                <Input
                  id="patientEmail"
                  type="email"
                  {...register('patientEmail')}
                  className={errors.patientEmail ? 'border-red-500' : ''}
                />
                {errors.patientEmail && (
                  <p className="mt-1 text-sm text-red-600">{String(errors.patientEmail.message)}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              4. Referrer Information
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="referrerName">Referrer Name *</Label>
                <Input
                  id="referrerName"
                  placeholder="Dr. Smith"
                  {...register('referrerName')}
                  className={errors.referrerName ? 'border-red-500' : ''}
                />
                {errors.referrerName && (
                  <p className="mt-1 text-sm text-red-600">{errors.referrerName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="referrerEmail">Referrer Email (Optional)</Label>
                <Input
                  id="referrerEmail"
                  type="email"
                  {...register('referrerEmail')}
                  className={errors.referrerEmail ? 'border-red-500' : ''}
                />
                {errors.referrerEmail && (
                  <p className="mt-1 text-sm text-red-600">{String(errors.referrerEmail.message)}</p>
                )}
              </div>

              <div>
                <Label htmlFor="referrerPhone">Referrer Phone (Optional)</Label>
                <Input
                  id="referrerPhone"
                  type="tel"
                  {...register('referrerPhone')}
                />
              </div>

              <div>
                <Label htmlFor="referrerClinic">Clinic/Organisation (Optional)</Label>
                <Input
                  id="referrerClinic"
                  {...register('referrerClinic')}
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              5. Additional Information
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="referralReason">Reason for Referral (Optional)</Label>
                <Textarea
                  id="referralReason"
                  rows={3}
                  placeholder="Brief description of the reason for this Home Medicines Review"
                  {...register('referralReason')}
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  rows={2}
                  placeholder="Any other information that might be helpful"
                  {...register('notes')}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Book Appointment'
              )}
            </Button>
          </div>
        </>
      )}
    </form>
  );
};
