import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, List, Grid3X3, CalendarDays } from 'lucide-react';
import { format, addMonths, setMonth, setYear, isToday } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui';
import {
  generateCalendarDays,
  getDateRangeForAllMedications,
  formatDose,
  formatTabletBreakdown,
  getMedicationColor,
} from '../../utils/doseCalculation';
import type { MedicationSchedule, DoseEntry, CalendarDay } from '../../types/doseCalculator';
import { DOSE_TIME_SHORT_LABELS } from '../../types/doseCalculator';

type ViewMode = 'compact' | 'detailed';

interface DoseCalendarViewProps {
  medications: MedicationSchedule[];
  calculatedDoses: Map<string, DoseEntry[]>;
}

// Day Detail Dialog Component
const DayDetailDialog: React.FC<{
  day: CalendarDay | null;
  onClose: () => void;
  medicationIndexMap: Map<string, number>;
  hasPreparations: boolean;
}> = ({ day, onClose, medicationIndexMap, hasPreparations }) => {
  if (!day) return null;

  return (
    <Dialog open={!!day} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-brand-600" />
            {format(day.date, 'EEEE, MMMM d, yyyy')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {day.doses.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No medications scheduled for this day</p>
          ) : (
            day.doses.map((dose) => {
              const medIndex = medicationIndexMap.get(dose.medicationId) ?? 0;
              const hasDoseTimes = dose.doseTimes && dose.doseTimes.length > 0;

              return (
                <div
                  key={dose.medicationId}
                  className={`rounded-xl border-2 p-4 ${getMedicationColor(medIndex)}`}
                >
                  <h3 className="font-semibold text-lg mb-2">{dose.medicationName}</h3>

                  {dose.isOffDay ? (
                    <p className="text-gray-500 italic">OFF day</p>
                  ) : hasDoseTimes ? (
                    <div className="space-y-2">
                      {dose.doseTimes!.map((dt) => (
                        <div key={dt.time} className="flex items-center justify-between py-1 border-b border-gray-200 last:border-0">
                          <span className="text-gray-600 font-medium">
                            {DOSE_TIME_SHORT_LABELS[dt.time]}
                          </span>
                          <div className="text-right">
                            <span className="font-semibold text-lg">{formatDose(dt.dose, dose.unit)}</span>
                            {hasPreparations && dt.tabletBreakdown && dt.tabletBreakdown.length > 0 && (
                              <div className="text-sm text-gray-600">
                                {formatTabletBreakdown(dt.tabletBreakdown)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {dose.doseTimes!.length > 1 && (
                        <div className="flex items-center justify-between pt-2 border-t-2 border-gray-300">
                          <span className="text-gray-700 font-medium">Total</span>
                          <span className="font-bold text-lg">{formatDose(dose.dose, dose.unit)}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <span className="font-semibold text-2xl">{formatDose(dose.dose, dose.unit)}</span>
                      {hasPreparations && dose.tabletBreakdown && dose.tabletBreakdown.length > 0 && (
                        <div className="text-sm text-gray-600 mt-1">
                          {formatTabletBreakdown(dose.tabletBreakdown)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const DoseCalendarView: React.FC<DoseCalendarViewProps> = ({
  medications,
  calculatedDoses,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('detailed');
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  // Get the date range and default to the earliest medication start date
  const dateRange = useMemo(() => {
    return getDateRangeForAllMedications(calculatedDoses);
  }, [calculatedDoses]);

  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    return dateRange?.start ? new Date(dateRange.start) : new Date();
  });

  const calendarDays = useMemo(() => {
    return generateCalendarDays(currentMonth, calculatedDoses);
  }, [currentMonth, calculatedDoses]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, -1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const handleMonthChange = (month: string) => {
    setCurrentMonth((prev) => setMonth(prev, parseInt(month)));
  };

  const handleYearChange = (year: string) => {
    setCurrentMonth((prev) => setYear(prev, parseInt(year)));
  };

  const handleJumpToStart = () => {
    if (dateRange?.start) {
      setCurrentMonth(new Date(dateRange.start));
    }
  };

  const handleJumpToEnd = () => {
    if (dateRange?.end) {
      setCurrentMonth(new Date(dateRange.end));
    }
  };

  // Create medication index map for consistent colors
  const medicationIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    medications.forEach((med, index) => {
      map.set(med.id, index);
    });
    return map;
  }, [medications]);

  // Check if any medication has preparation tracking
  const hasPreparations = useMemo(() => {
    return medications.some(
      med => med.preparationMode !== 'none' &&
        ((med.preparations && med.preparations.length > 0) ||
          (med.optimisedPreparations && med.optimisedPreparations.length > 0))
    );
  }, [medications]);

  // Generate year options based on date range
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = dateRange?.start ? new Date(dateRange.start).getFullYear() : currentYear - 1;
    const endYear = dateRange?.end ? new Date(dateRange.end).getFullYear() : currentYear + 2;
    const years: number[] = [];
    for (let y = startYear; y <= endYear; y++) {
      years.push(y);
    }
    return years;
  }, [dateRange]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Tile sizing based on view mode
  const tileClasses = viewMode === 'compact'
    ? 'min-h-[100px] p-2'
    : 'min-h-[140px] md:min-h-[160px] p-3';

  return (
    <Card>
      <CardHeader className="space-y-4">
        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <CardTitle className="font-heading flex items-center gap-3">
            <Calendar className="h-6 w-6 text-brand-600" />
            Dosing Calendar
          </CardTitle>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">View:</span>
            <div className="flex rounded-lg border overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode('compact')}
                className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${
                  viewMode === 'compact'
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
                Compact
              </button>
              <button
                type="button"
                onClick={() => setViewMode('detailed')}
                className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${
                  viewMode === 'detailed'
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="h-4 w-4" />
                Detailed
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Month/Year Selectors */}
          <div className="flex items-center gap-2">
            <Select value={currentMonth.getMonth().toString()} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={month} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={currentMonth.getFullYear().toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[90px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            {dateRange?.start && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleJumpToStart}
                className="text-xs"
              >
                Start
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrevMonth}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Prev</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleNextMonth}
              className="gap-1"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            {dateRange?.end && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleJumpToEnd}
                className="text-xs"
              >
                End
              </Button>
            )}
          </div>
        </div>

        {/* Legend */}
        {medications.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {medications.map((med, index) => (
              <div
                key={med.id}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 ${getMedicationColor(index)}`}
              >
                {med.medicationName}
              </div>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-700 font-heading py-2 bg-gray-50 rounded"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((calDay, index) => {
            const hasDoses = calDay.doses.length > 0;
            const isDayToday = isToday(calDay.date);

            return (
              <button
                type="button"
                key={index}
                onClick={() => hasDoses && setSelectedDay(calDay)}
                className={`
                  ${tileClasses}
                  border rounded-xl text-left transition-all
                  ${calDay.isCurrentMonth ? 'bg-white' : 'bg-gray-50/50'}
                  ${hasDoses ? 'border-gray-300 hover:border-brand-400 hover:shadow-md cursor-pointer' : 'border-gray-200 cursor-default'}
                  ${isDayToday ? 'ring-2 ring-brand-500 ring-offset-1' : ''}
                `}
              >
                {/* Date number */}
                <div
                  className={`text-base font-semibold mb-2 ${
                    calDay.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  } ${isDayToday ? 'text-brand-600' : ''}`}
                >
                  {format(calDay.date, 'd')}
                </div>

                {/* Doses */}
                {hasDoses && (
                  <div className="space-y-1.5">
                    {calDay.doses.map((dose) => {
                      const medIndex = medicationIndexMap.get(dose.medicationId) ?? 0;
                      const hasDoseTimes = dose.doseTimes && dose.doseTimes.length > 0;

                      // Handle OFF days
                      if (dose.isOffDay) {
                        return (
                          <div
                            key={dose.medicationId}
                            className={`text-sm p-1.5 rounded-lg border ${getMedicationColor(medIndex)} opacity-60`}
                          >
                            <div className="font-medium truncate" title={dose.medicationName}>
                              {dose.medicationName}
                            </div>
                            <div className="font-body text-gray-500 italic text-xs">
                              OFF
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={dose.medicationId}
                          className={`text-sm p-1.5 rounded-lg border ${getMedicationColor(medIndex)}`}
                        >
                          <div className="font-medium truncate" title={dose.medicationName}>
                            {dose.medicationName}
                          </div>

                          {hasDoseTimes ? (
                            // Multiple dose times display
                            <div className="font-body text-xs">
                              {viewMode === 'detailed' ? (
                                // Show all dose times in detailed view
                                <>
                                  {dose.doseTimes!.map((dt) => (
                                    <div key={dt.time} className="flex justify-between">
                                      <span className="text-gray-600">{DOSE_TIME_SHORT_LABELS[dt.time]}:</span>
                                      <span className="font-medium">{formatDose(dt.dose, dose.unit)}</span>
                                    </div>
                                  ))}
                                  {dose.doseTimes!.length > 1 && (
                                    <div className="flex justify-between border-t border-gray-200 mt-1 pt-1">
                                      <span className="text-gray-500">Total:</span>
                                      <span className="font-semibold">{formatDose(dose.dose, dose.unit)}</span>
                                    </div>
                                  )}
                                  {/* Tablet breakdown in detailed view */}
                                  {hasPreparations && dose.doseTimes!.some(dt => dt.tabletBreakdown && dt.tabletBreakdown.length > 0) && (
                                    <div className="text-xs text-gray-500 mt-1 border-t border-gray-200 pt-1">
                                      {dose.doseTimes!.map((dt) => (
                                        dt.tabletBreakdown && dt.tabletBreakdown.length > 0 && (
                                          <div key={`${dt.time}-breakdown`}>
                                            {DOSE_TIME_SHORT_LABELS[dt.time]}: {formatTabletBreakdown(dt.tabletBreakdown)}
                                          </div>
                                        )
                                      ))}
                                    </div>
                                  )}
                                </>
                              ) : (
                                // Compact view - just show total
                                <div className="font-medium">
                                  {formatDose(dose.dose, dose.unit)}
                                  <span className="text-gray-500 ml-1">
                                    ({dose.doseTimes!.length}x)
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            // Single dose display
                            <div className="font-body text-xs">
                              <span className="font-medium">{formatDose(dose.dose, dose.unit)}</span>
                              {/* Tablet breakdown */}
                              {viewMode === 'detailed' && hasPreparations && dose.tabletBreakdown && dose.tabletBreakdown.length > 0 && (
                                <div className="text-gray-500 mt-0.5">
                                  {formatTabletBreakdown(dose.tabletBreakdown)}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Click hint */}
        {medications.length > 0 && (
          <p className="text-xs text-gray-400 text-center mt-4">
            Click on a day with medications to see full details
          </p>
        )}
      </CardContent>

      {/* Day Detail Dialog */}
      <DayDetailDialog
        day={selectedDay}
        onClose={() => setSelectedDay(null)}
        medicationIndexMap={medicationIndexMap}
        hasPreparations={hasPreparations}
      />
    </Card>
  );
};
