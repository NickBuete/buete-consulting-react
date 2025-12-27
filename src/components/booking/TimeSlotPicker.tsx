import React, { useEffect, useState } from 'react';
import { format, addMinutes, parse, isBefore } from 'date-fns';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { Clock } from 'lucide-react';

interface TimeSlot {
  time: string; // HH:mm format
  available: boolean;
}

interface AvailabilitySlot {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface TimeSlotPickerProps {
  pharmacistId: number;
  selectedDate: Date;
  selectedTime: string;
  onSelectTime: (time: string) => void;
  bookingSettings: {
    bufferTimeBefore: number;
    bufferTimeAfter: number;
    defaultDuration: number;
  };
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  pharmacistId,
  selectedDate,
  selectedTime,
  onSelectTime,
  bookingSettings,
}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateTimeSlots = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch availability slots
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
        const response = await fetch(
          `${apiUrl}/api/booking/availability?userId=${pharmacistId}`
        );

        if (!response.ok) {
          throw new Error('Failed to load availability');
        }

        const availabilitySlots: AvailabilitySlot[] = await response.json();

        // Convert selected date to day of week (0 = Monday, 6 = Sunday)
        let dayOfWeek = selectedDate.getDay() - 1;
        if (dayOfWeek === -1) dayOfWeek = 6;

        // Filter slots for selected day
        const daySlots = availabilitySlots.filter(
          (slot) => slot.dayOfWeek === dayOfWeek && slot.isAvailable
        );

        if (daySlots.length === 0) {
          setTimeSlots([]);
          setLoading(false);
          return;
        }

        // Generate time slots based on availability
        const slots: TimeSlot[] = [];
        const slotDuration = bookingSettings.defaultDuration || 60; // minutes

        daySlots.forEach((daySlot) => {
          const startTime = parse(daySlot.startTime, 'HH:mm', selectedDate);
          const endTime = parse(daySlot.endTime, 'HH:mm', selectedDate);

          let currentTime = startTime;

          while (isBefore(currentTime, endTime) || currentTime.getTime() === endTime.getTime()) {
            const slotEndTime = addMinutes(currentTime, slotDuration);

            // Check if slot fits within availability window
            if (isBefore(slotEndTime, endTime) || slotEndTime.getTime() === endTime.getTime()) {
              slots.push({
                time: format(currentTime, 'HH:mm'),
                available: true, // TODO: Check against existing bookings
              });
            }

            // Move to next slot (add duration + buffer)
            currentTime = addMinutes(
              currentTime,
              slotDuration + bookingSettings.bufferTimeBefore + bookingSettings.bufferTimeAfter
            );
          }
        });

        // Sort slots by time
        slots.sort((a, b) => a.time.localeCompare(b.time));

        setTimeSlots(slots);
      } catch (err) {
        console.error('Error generating time slots:', err);
        setError('Unable to load available times');
      } finally {
        setLoading(false);
      }
    };

    generateTimeSlots();
  }, [pharmacistId, selectedDate, bookingSettings]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600 text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

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
              >
                {format(parsedTime, 'h:mm a')}
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
