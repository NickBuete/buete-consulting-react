import React from 'react';
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameDay, isSameMonth } from 'date-fns';

interface CalendarProps {
  mode?: 'single';
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  fromDate?: Date;
  toDate?: Date;
  className?: string;
}

export const Calendar: React.FC<CalendarProps> = ({
  selected,
  onSelect,
  disabled,
  fromDate,
  toDate,
  className = '',
}) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = 'MMMM yyyy';
  const days = [];
  let day = startDate;

  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const isDisabled = (date: Date): boolean => {
    if (disabled && disabled(date)) return true;
    if (fromDate && date < fromDate) return true;
    if (toDate && date > toDate) return true;
    return false;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(addDays(currentMonth, -30));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addDays(currentMonth, 30));
  };

  return (
    <div className={`p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold">{format(currentMonth, dateFormat)}</h2>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded"
        >
          →
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isSelected = selected && isSameDay(day, selected);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const dayDisabled = isDisabled(day);

          return (
            <button
              key={index}
              type="button"
              onClick={() => !dayDisabled && onSelect?.(day)}
              disabled={dayDisabled}
              className={`
                p-2 text-sm rounded-md
                ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-900'}
                ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                ${!isSelected && !dayDisabled && isCurrentMonth ? 'hover:bg-gray-100' : ''}
                ${dayDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
};
