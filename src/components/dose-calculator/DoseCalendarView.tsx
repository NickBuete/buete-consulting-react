import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from '../ui';
import {
  generateCalendarDays,
  getDateRangeForAllMedications,
  formatDose,
  getMedicationColor,
} from '../../utils/doseCalculation';
import type { MedicationSchedule, DoseEntry } from '../../types/doseCalculator';

interface DoseCalendarViewProps {
  medications: MedicationSchedule[];
  calculatedDoses: Map<string, DoseEntry[]>;
}

export const DoseCalendarView: React.FC<DoseCalendarViewProps> = ({
  medications,
  calculatedDoses,
}) => {
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

  // Create medication index map for consistent colors
  const medicationIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    medications.forEach((med, index) => {
      map.set(med.id, index);
    });
    return map;
  }, [medications]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading flex items-center gap-3">
            <span className="text-2xl">📅</span>
            Dosing Calendar
          </CardTitle>
          <div className="flex items-center gap-4">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrevMonth}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="font-heading text-lg min-w-[150px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleNextMonth}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Legend */}
        {medications.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {medications.map((med, index) => (
              <div
                key={med.id}
                className={`px-3 py-1 rounded-md text-sm font-body border-2 ${getMedicationColor(index)}`}
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
              className="text-center text-sm font-semibold text-gray-700 font-heading py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((calDay, index) => (
            <div
              key={index}
              className={`
                min-h-[100px] border rounded-lg p-2
                ${calDay.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                ${calDay.doses.length > 0 ? 'border-gray-300' : 'border-gray-200'}
              `}
            >
              <div
                className={`text-sm font-semibold mb-1 ${
                  calDay.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {format(calDay.date, 'd')}
              </div>

              {calDay.doses.length > 0 && (
                <div className="space-y-1">
                  {calDay.doses.map((dose) => {
                    const medIndex = medicationIndexMap.get(dose.medicationId) ?? 0;
                    return (
                      <div
                        key={dose.medicationId}
                        className={`text-xs p-1 rounded border ${getMedicationColor(medIndex)}`}
                      >
                        <div className="font-semibold truncate" title={dose.medicationName}>
                          {dose.medicationName}
                        </div>
                        <div className="font-body">
                          {formatDose(dose.dose, dose.unit)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
