import React from 'react';
import { Calendar } from '../ui/Calendar';
import { Card, CardContent } from '../ui/Card';
import { addDays, startOfToday } from 'date-fns';
import type { AvailabilitySlot } from '../../types/booking';
import { getBookingDayOfWeek } from '../../utils/booking';

interface AvailabilityCalendarProps {
  availabilitySlots: AvailabilitySlot[];
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  availabilitySlots,
  selectedDate,
  onSelectDate,
}) => {
  // Determine if a date is available based on day of week
  const isDateAvailable = (date: Date): boolean => {
    const today = startOfToday();

    // Disable past dates
    if (date < today) {
      return false;
    }

    // Convert date to day of week (0 = Monday, 6 = Sunday)
    // JavaScript getDay(): 0 = Sunday, 1 = Monday, etc.
    // We need: 0 = Monday, 6 = Sunday
    const dayOfWeek = getBookingDayOfWeek(date);

    // Check if there are any available slots for this day
    const hasAvailableSlots = availabilitySlots.some(
      (slot) => slot.dayOfWeek === dayOfWeek && slot.isAvailable
    );

    return hasAvailableSlots;
  };

  // Disable dates that don't have availability
  const disabledDates = (date: Date): boolean => {
    return !isDateAvailable(date);
  };

  if (availabilitySlots.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-600 text-sm">
            No availability configured. Please contact the pharmacist directly.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelectDate}
          disabled={disabledDates}
          fromDate={startOfToday()}
          toDate={addDays(startOfToday(), 90)} // Show 90 days ahead
          className="rounded-md"
        />
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> Select a highlighted date to view available time slots.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
