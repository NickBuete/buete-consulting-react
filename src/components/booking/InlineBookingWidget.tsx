/**
 * Inline Booking Widget (Refactored)
 * Reduced from 520 lines to ~120 lines
 *
 * Extracted components:
 * - useBookingWidget hook - State management and data fetching
 * - BookingStepIndicator - Progress indicator
 * - BookingDateStep - Date selection
 * - BookingTimeStep - Time selection
 * - BookingFormStep - Form details
 * - BookingSuccessStep - Success message
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Alert, AlertDescription } from '../ui/Alert';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { inlineBookingSchema } from '../../schemas/booking';
import { useBookingWidget } from '../../hooks/useBookingWidget';
import { BookingStepIndicator } from './BookingStepIndicator';
import { BookingDateStep } from './steps/BookingDateStep';
import { BookingTimeStep } from './steps/BookingTimeStep';
import { BookingFormStep } from './steps/BookingFormStep';
import { BookingSuccessStep } from './steps/BookingSuccessStep';
import type { z } from 'zod';

type BookingFormData = z.infer<typeof inlineBookingSchema>;

interface InlineBookingWidgetProps {
  pharmacistId: number;
  onBookingComplete?: () => void;
  showTitle?: boolean;
}

export const InlineBookingWidget: React.FC<InlineBookingWidgetProps> = ({
  pharmacistId,
  onBookingComplete,
  showTitle = true,
}) => {
  const form = useForm<BookingFormData>({
    resolver: zodResolver(inlineBookingSchema),
  });

  const {
    selectedDate,
    selectedTime,
    bookingStep,
    timeSlots,
    loading,
    error,
    isSubmitting,
    submitError,
    hasAvailability,
    handleDateSelect,
    handleTimeSelect,
    handleBack,
    submitBooking,
    resetBooking,
  } = useBookingWidget({ pharmacistId, onBookingComplete });

  const onSubmit = async (data: BookingFormData) => {
    const result = await submitBooking(data);
    if (result.success) {
      form.reset();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Quick Booking
          </CardTitle>
          <CardDescription>
            Select a date and time to book an appointment
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {/* Step Indicator */}
        {bookingStep !== 'success' && (
          <BookingStepIndicator
            currentStep={bookingStep}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
          />
        )}

        {/* Date Selection Step */}
        {bookingStep === 'date' && (
          <BookingDateStep
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            hasAvailability={hasAvailability}
          />
        )}

        {/* Time Selection Step */}
        {bookingStep === 'time' && selectedDate && (
          <BookingTimeStep
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            timeSlots={timeSlots}
            onTimeSelect={handleTimeSelect}
            onBack={handleBack}
          />
        )}

        {/* Form Step */}
        {bookingStep === 'form' && selectedDate && selectedTime && (
          <BookingFormStep
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            form={form}
            onSubmit={onSubmit}
            onBack={handleBack}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        )}

        {/* Success Step */}
        {bookingStep === 'success' && <BookingSuccessStep onReset={resetBooking} />}
      </CardContent>
    </Card>
  );
};
