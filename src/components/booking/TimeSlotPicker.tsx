import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Clock } from 'lucide-react';
import type { AvailabilitySlot, BusySlot, BookingSettings } from '../../types/booking';
import { buildTimeSlots, formatBookingTime } from '../../utils/booking';

interface TimeSlotPickerProps {
  availabilitySlots: AvailabilitySlot[];
  busySlots: BusySlot[];
  selectedDate: Date;
  selectedTime: string;
  onSelectTime: (time: string) => void;
  bookingSettings: BookingSettings;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  availabilitySlots,
  busySlots,
  selectedDate,
  selectedTime,
  onSelectTime,
  bookingSettings,
}) => {
  const timeSlots = useMemo(
    () =>
      buildTimeSlots({
        availabilitySlots,
        busySlots,
        selectedDate,
        bookingSettings,
      }),
    [availabilitySlots, busySlots, selectedDate, bookingSettings]
  );

  if (timeSlots.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-600 text-sm">
            No available time slots for {format(selectedDate, 'EEEE, MMMM d, yyyy')}.
            Please select a different date.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center mb-4 text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-2" />
          <span>Available times for {format(selectedDate, 'EEEE, MMMM d')}</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {timeSlots.map((slot) => {
            const isSelected = selectedTime === slot.time;
            const label = slot.available
              ? formatBookingTime(slot.time)
              : slot.isBusy
              ? 'Busy'
              : formatBookingTime(slot.time);

            return (
              <Button
                key={slot.time}
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                className={`h-12 ${!slot.available && 'opacity-50 cursor-not-allowed'}`}
                disabled={!slot.available}
                onClick={() => onSelectTime(slot.time)}
                aria-label={
                  slot.available
                    ? `Select ${formatBookingTime(slot.time)}`
                    : slot.isBusy
                    ? 'Busy'
                    : `Unavailable ${formatBookingTime(slot.time)}`
                }
              >
                {label}
              </Button>
            );
          })}
        </div>

        {selectedTime && (
          <div className="mt-4 p-3 bg-green-50 rounded-md">
            <p className="text-sm text-green-900">
              <strong>Selected:</strong> {formatBookingTime(selectedTime)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
