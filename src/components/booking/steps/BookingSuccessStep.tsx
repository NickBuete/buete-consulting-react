/**
 * Booking Success Step
 * Extracted from InlineBookingWidget.tsx lines 496-516
 */

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '../../ui/Button';

interface BookingSuccessStepProps {
  onReset: () => void;
}

export const BookingSuccessStep: React.FC<BookingSuccessStepProps> = ({ onReset }) => {
  return (
    <div className="text-center py-8">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
      <p className="text-gray-600 mb-6">
        Your appointment has been successfully booked. You will receive a confirmation email
        shortly with details and a reschedule link if needed.
      </p>
      <Button onClick={onReset} variant="outline">
        Book Another Appointment
      </Button>
    </div>
  );
};
