import React, { useEffect, useState } from 'react';
import { format, addMinutes, parse, isBefore, isSameDay } from 'date-fns';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Clock } from 'lucide-react';
import type { AvailabilitySlot, BusySlot, BookingSettings } from '../../types/booking';
import { getBookingDayOfWeek } from '../../utils/booking';

interface TimeSlot {
  time: string; // HH:mm format
  available: boolean;
  isBusy?: boolean;
}

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
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    const dayOfWeek = getBookingDayOfWeek(selectedDate);
    const daySlots = availabilitySlots.filter(
      (slot) => slot.dayOfWeek === dayOfWeek && slot.isAvailable
    );

    if (daySlots.length === 0) {
      setTimeSlots([]);
      return;
    }

    const parsedBusySlots = busySlots.map((slot) => ({
      start: new Date(slot.start),
      end: new Date(slot.end),
    }));

    const hasConflict = (slotStart: Date, slotEnd: Date) =>
      parsedBusySlots.some((busy) => {
        const bufferedStart = addMinutes(busy.start, -bookingSettings.bufferTimeBefore);
        const bufferedEnd = addMinutes(busy.end, bookingSettings.bufferTimeAfter);
        return slotStart < bufferedEnd && slotEnd > bufferedStart;
      });

    const slots: TimeSlot[] = [];
    const slotDuration = bookingSettings.defaultDuration || 60;
    const now = new Date();
    const isToday = isSameDay(selectedDate, now);

    daySlots.forEach((daySlot) => {
      const startTime = parse(daySlot.startTime, 'HH:mm', selectedDate);
      const endTime = parse(daySlot.endTime, 'HH:mm', selectedDate);

      let currentTime = startTime;

      while (isBefore(currentTime, endTime) || currentTime.getTime() === endTime.getTime()) {
        const slotEndTime = addMinutes(currentTime, slotDuration);

        if (isBefore(slotEndTime, endTime) || slotEndTime.getTime() === endTime.getTime()) {
          const isBusy = hasConflict(currentTime, slotEndTime);
          const isPast = isToday && isBefore(currentTime, now);

          slots.push({
            time: format(currentTime, 'HH:mm'),
            available: !isBusy && !isPast,
            isBusy,
          });
        }

        currentTime = addMinutes(
          currentTime,
          slotDuration + bookingSettings.bufferTimeBefore + bookingSettings.bufferTimeAfter
        );
      }
    });

    slots.sort((a, b) => a.time.localeCompare(b.time));
    setTimeSlots(slots);
  }, [availabilitySlots, busySlots, selectedDate, bookingSettings]);

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
            const parsedTime = parse(slot.time, 'HH:mm', new Date());

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
                    ? `Select ${format(parsedTime, 'h:mm a')}`
                    : slot.isBusy
                    ? 'Busy'
                    : `Unavailable ${format(parsedTime, 'h:mm a')}`
                }
              >
                {slot.available
                  ? format(parsedTime, 'h:mm a')
                  : slot.isBusy
                  ? 'Busy'
                  : format(parsedTime, 'h:mm a')}
              </Button>
            );
          })}
        </div>

        {selectedTime && (
          <div className="mt-4 p-3 bg-green-50 rounded-md">
            <p className="text-sm text-green-900">
              <strong>Selected:</strong> {format(parse(selectedTime, 'HH:mm', new Date()), 'h:mm a')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
