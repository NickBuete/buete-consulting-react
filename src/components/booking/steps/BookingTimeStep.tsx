/**
 * Booking Time Selection Step
 * Extracted from InlineBookingWidget.tsx lines 283-337
 */

import React from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Alert, AlertDescription } from '../../ui/Alert';
import { formatBookingTime } from '../../../utils/booking';
import type { TimeSlot } from '../../../types/booking';

interface BookingTimeStepProps {
  selectedDate: Date;
  selectedTime: string | null;
  timeSlots: TimeSlot[];
  onTimeSelect: (time: string) => void;
  onBack: () => void;
}

export const BookingTimeStep: React.FC<BookingTimeStepProps> = ({
  selectedDate,
  selectedTime,
  timeSlots,
  onTimeSelect,
  onBack,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">
          Select a Time for {format(selectedDate, 'EEEE, MMMM d')}
        </h3>
        <Button variant="ghost" size="sm" onClick={onBack}>
          Change Date
        </Button>
      </div>

      {timeSlots.length === 0 ? (
        <Alert>
          <AlertDescription>
            No available time slots for this date
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
          {timeSlots.map((slot) => {
            const label = slot.available
              ? formatBookingTime(slot.time)
              : slot.isBusy
              ? 'Busy'
              : formatBookingTime(slot.time);

            return (
              <button
                key={slot.time}
                onClick={() => onTimeSelect(slot.time)}
                disabled={!slot.available}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  !slot.available
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : selectedTime === slot.time
                    ? 'bg-blue-50 border-blue-600 text-blue-900'
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                }`}
                aria-label={
                  slot.available
                    ? `Select ${formatBookingTime(slot.time)}`
                    : slot.isBusy
                    ? 'Busy'
                    : `Unavailable ${formatBookingTime(slot.time)}`
                }
              >
                <Clock className="h-4 w-4 mx-auto mb-1" />
                <div className="text-sm font-medium">{label}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
