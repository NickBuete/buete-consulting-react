import React, { useState, useEffect, useMemo } from 'react';
import { format, parse, isValid, subYears, addYears, startOfDay, isBefore, isAfter } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './Select';

interface DateInputProps {
  value?: string; // ISO date string (YYYY-MM-DD)
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  // Constraints
  minDate?: Date;
  maxDate?: Date;
  minYearsFromNow?: number; // e.g., -110 for 110 years in the past
  maxYearsFromNow?: number; // e.g., 2 for 2 years in the future
  // Mode presets
  mode?: 'past-only' | 'future-only' | 'any';
  label?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  className,
  minDate,
  maxDate,
  minYearsFromNow,
  maxYearsFromNow,
  mode = 'any',
  label,
}) => {
  const today = useMemo(() => startOfDay(new Date()), []);

  // Calculate effective min/max dates
  const effectiveMinDate = useMemo(() => {
    if (minDate) return minDate;
    if (minYearsFromNow !== undefined) return subYears(today, Math.abs(minYearsFromNow));
    if (mode === 'future-only') return today;
    return subYears(today, 110); // Default: 110 years back
  }, [minDate, minYearsFromNow, mode, today]);

  const effectiveMaxDate = useMemo(() => {
    if (maxDate) return maxDate;
    if (maxYearsFromNow !== undefined) return addYears(today, maxYearsFromNow);
    if (mode === 'past-only') return today;
    return addYears(today, 5); // Default: 5 years forward
  }, [maxDate, maxYearsFromNow, mode, today]);

  // Generate year options
  const yearOptions = useMemo(() => {
    const startYear = effectiveMinDate.getFullYear();
    const endYear = effectiveMaxDate.getFullYear();
    const years: number[] = [];
    // Go from most recent to oldest for past-only, oldest to most recent for future-only
    if (mode === 'past-only') {
      for (let y = endYear; y >= startYear; y--) {
        years.push(y);
      }
    } else {
      for (let y = startYear; y <= endYear; y++) {
        years.push(y);
      }
    }
    return years;
  }, [effectiveMinDate, effectiveMaxDate, mode]);

  // Parse current value
  const parsedDate = useMemo(() => {
    if (!value) return null;
    const date = parse(value, 'yyyy-MM-dd', new Date());
    return isValid(date) ? date : null;
  }, [value]);

  // Local state for editing
  const [selectedDay, setSelectedDay] = useState<number | null>(parsedDate?.getDate() ?? null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(parsedDate?.getMonth() ?? null);
  const [selectedYear, setSelectedYear] = useState<number | null>(parsedDate?.getFullYear() ?? null);

  // Sync local state when value changes externally
  useEffect(() => {
    if (parsedDate) {
      setSelectedDay(parsedDate.getDate());
      setSelectedMonth(parsedDate.getMonth());
      setSelectedYear(parsedDate.getFullYear());
    }
  }, [parsedDate]);

  // Get days in selected month
  const daysInMonth = useMemo(() => {
    if (selectedMonth === null || selectedYear === null) return 31;
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedMonth, selectedYear]);

  // Generate day options
  const dayOptions = useMemo(() => {
    const days: number[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }
    return days;
  }, [daysInMonth]);

  // Update parent when all parts are selected
  useEffect(() => {
    if (selectedDay !== null && selectedMonth !== null && selectedYear !== null) {
      // Validate day is still valid for the month
      const maxDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const validDay = Math.min(selectedDay, maxDay);

      const newDate = new Date(selectedYear, selectedMonth, validDay);

      // Check date constraints
      if (isBefore(newDate, effectiveMinDate) || isAfter(newDate, effectiveMaxDate)) {
        return; // Don't update if outside bounds
      }

      const isoString = format(newDate, 'yyyy-MM-dd');
      if (isoString !== value) {
        onChange(isoString);
      }
    }
  }, [selectedDay, selectedMonth, selectedYear, value, onChange, effectiveMinDate, effectiveMaxDate]);

  // Auto-adjust day if month changes and day is out of range
  useEffect(() => {
    if (selectedDay !== null && selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [daysInMonth, selectedDay]);

  const handleDayChange = (dayStr: string) => {
    setSelectedDay(parseInt(dayStr));
  };

  const handleMonthChange = (monthStr: string) => {
    setSelectedMonth(parseInt(monthStr));
  };

  const handleYearChange = (yearStr: string) => {
    setSelectedYear(parseInt(yearStr));
  };

  const handleClear = () => {
    setSelectedDay(null);
    setSelectedMonth(null);
    setSelectedYear(null);
    onChange('');
  };

  // Quick preset for today
  const handleSetToday = () => {
    setSelectedDay(today.getDate());
    setSelectedMonth(today.getMonth());
    setSelectedYear(today.getFullYear());
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      <div className="flex items-center gap-2">
        {/* Day selector */}
        <Select
          value={selectedDay?.toString() ?? ''}
          onValueChange={handleDayChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder="Day" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {dayOptions.map((day) => (
              <SelectItem key={day} value={day.toString()}>
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Month selector */}
        <Select
          value={selectedMonth?.toString() ?? ''}
          onValueChange={handleMonthChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((month, index) => (
              <SelectItem key={month} value={index.toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year selector */}
        <Select
          value={selectedYear?.toString() ?? ''}
          onValueChange={handleYearChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {yearOptions.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Calendar icon / Today button */}
        {mode !== 'past-only' && (
          <button
            type="button"
            onClick={handleSetToday}
            className="p-2 text-gray-500 hover:text-brand-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Set to today"
          >
            <CalendarIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Display formatted date */}
      {parsedDate && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {format(parsedDate, 'EEEE, MMMM d, yyyy')}
          </p>
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};
