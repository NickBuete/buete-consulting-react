import React, { useEffect, useState } from 'react';
import { Calendar } from '../ui/Calendar';
import { Card, CardContent } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { addDays, startOfToday } from 'date-fns';

interface AvailabilitySlot {
  id: number;
  dayOfWeek: number; // 0 = Monday, 6 = Sunday
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface AvailabilityCalendarProps {
  pharmacistId: number;
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  pharmacistId,
  selectedDate,
  onSelectDate,
}) => {
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
        const response = await fetch(
          `${apiUrl}/api/booking/availability?userId=${pharmacistId}`
        );

        if (!response.ok) {
          throw new Error('Failed to load availability');
        }

        const data = await response.json();
        setAvailabilitySlots(data);
      } catch (err) {
        console.error('Error fetching availability:', err);
        setError('Unable to load available dates');
      } finally {
        setLoading(false);
      }
    };

    if (pharmacistId) {
      fetchAvailability();
    }
  }, [pharmacistId]);

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
    let dayOfWeek = date.getDay() - 1;
    if (dayOfWeek === -1) dayOfWeek = 6; // Sunday

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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-80 w-full" />
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
