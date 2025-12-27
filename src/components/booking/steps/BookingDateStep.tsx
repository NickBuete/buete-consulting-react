/**
 * Booking Date Selection Step
 * Extracted from InlineBookingWidget.tsx lines 248-281
 */

import React from 'react';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';

interface BookingDateStepProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  hasAvailability: (date: Date) => boolean;
  daysToShow?: number;
}

export const BookingDateStep: React.FC<BookingDateStepProps> = ({
  selectedDate,
  onDateSelect,
  hasAvailability,
  daysToShow = 14,
}) => {
  // Generate next N days for quick selection
  const availableDates = Array.from({ length: daysToShow }, (_, i) => addDays(new Date(), i));

  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-3">Select a Date</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {availableDates.map((date) => {
          const isAvailable = hasAvailability(date);
          const isPast = date < startOfDay(new Date());
          const isToday = isSameDay(date, new Date());
          const isSelected = selectedDate && isSameDay(selectedDate, date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => isAvailable && !isPast && onDateSelect(date)}
              disabled={!isAvailable || isPast}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                !isAvailable || isPast
                  ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  : isSelected
                  ? 'bg-blue-50 border-blue-600 text-blue-900'
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
              }`}
            >
              <div className="text-xs text-gray-500">
                {isToday ? 'Today' : format(date, 'EEE')}
              </div>
              <div className="text-lg font-semibold">{format(date, 'd')}</div>
              <div className="text-xs">{format(date, 'MMM')}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
