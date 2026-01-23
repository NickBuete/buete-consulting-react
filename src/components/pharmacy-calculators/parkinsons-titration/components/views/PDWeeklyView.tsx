import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Check, Printer } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import type {
  PDRegimen,
  PDRegimenDayDose,
  DoseChangeType,
} from '../../../../../types/parkinsonsMedications';

interface PDWeeklyViewProps {
  regimen: PDRegimen;
  calculatedSchedule: PDRegimenDayDose[];
  onDayClick?: (date: Date) => void;
}

export const PDWeeklyView: React.FC<PDWeeklyViewProps> = ({
  regimen,
  calculatedSchedule,
  onDayClick,
}) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [checkedDays, setCheckedDays] = useState<Set<string>>(new Set());

  // Calculate week start based on regimen start date and offset
  const weekStart = useMemo(() => {
    const baseStart = startOfWeek(regimen.startDate, { weekStartsOn: 1 }); // Monday
    return addDays(baseStart, weekOffset * 7);
  }, [regimen.startDate, weekOffset]);

  // Get the 7 days of this week
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Get schedule data for this week
  const weekSchedule = useMemo(() => {
    return weekDays.map(date => {
      const dayData = calculatedSchedule.find(d => isSameDay(d.date, date));
      return { date, data: dayData };
    });
  }, [weekDays, calculatedSchedule]);

  // Check if we have data for navigation
  const hasNextWeek = calculatedSchedule.some(d => d.date > weekDays[6]);
  const hasPrevWeek = calculatedSchedule.some(d => d.date < weekDays[0]);

  const handleCheckDay = (date: Date) => {
    const key = format(date, 'yyyy-MM-dd');
    setCheckedDays(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const getChangeIcon = (change: DoseChangeType) => {
    switch (change) {
      case 'increased':
        return <ArrowUp className="h-3 w-3 text-green-600" />;
      case 'decreased':
        return <ArrowDown className="h-3 w-3 text-orange-600" />;
      case 'started':
        return <span className="text-xs text-green-600 font-bold">+</span>;
      case 'stopped':
        return <span className="text-xs text-red-600 font-bold">-</span>;
      default:
        return null;
    }
  };

  const getChangeClass = (change: DoseChangeType) => {
    switch (change) {
      case 'increased':
        return 'bg-green-50';
      case 'decreased':
        return 'bg-orange-50';
      case 'started':
        return 'bg-green-100';
      case 'stopped':
        return 'bg-red-50';
      default:
        return '';
    }
  };

  const weekNumber = Math.floor(weekOffset) + 1;

  return (
    <div className="space-y-4">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Week {weekNumber}: {format(weekStart, 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
          </h3>
          {regimen.name && (
            <p className="text-sm text-gray-500">{regimen.name}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekOffset(prev => prev - 1)}
            disabled={!hasPrevWeek}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset(prev => prev + 1)}
            disabled={!hasNextWeek}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            title="Print schedule"
          >
            <Printer className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Weekly grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700 min-w-[100px]">
                Time
              </th>
              {weekDays.map(day => {
                const isToday = isSameDay(day, new Date());
                const hasData = weekSchedule.find(ws => isSameDay(ws.date, day))?.data;

                return (
                  <th
                    key={day.toISOString()}
                    className={`border border-gray-300 px-3 py-2 text-center font-medium min-w-[90px] ${
                      isToday ? 'bg-brand-100 text-brand-900' : 'text-gray-700'
                    } ${!hasData ? 'bg-gray-50 text-gray-400' : ''}`}
                  >
                    <div>{format(day, 'EEE')}</div>
                    <div className="text-sm">{format(day, 'd')}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {/* Row for each time slot */}
            {regimen.timeSlots.map((slot, slotIndex) => (
              <React.Fragment key={slot.id}>
                {/* Time slot header row */}
                <tr className="bg-gray-50">
                  <td
                    className="border border-gray-300 px-3 py-2 font-medium text-gray-700"
                    rowSpan={regimen.medications.length + 1}
                  >
                    {slot.label}
                    {slot.defaultTime && (
                      <span className="block text-xs text-gray-500">{slot.defaultTime}</span>
                    )}
                  </td>
                </tr>

                {/* Row for each medication at this time slot */}
                {regimen.medications.map(med => (
                  <tr key={`${slot.id}-${med.id}`}>
                    {weekDays.map(day => {
                      const dayData = weekSchedule.find(ws => isSameDay(ws.date, day))?.data;
                      const medDose = dayData?.medicationDoses.find(
                        d => d.medicationId === med.id
                      );
                      const slotDose = medDose?.slotDoses.find(sd => sd.slotId === slot.id);
                      const tabletCount = slotDose?.tabletCount || 0;

                      // Determine if this cell had a change
                      const hasChange = medDose?.changeFromYesterday !== 'unchanged';

                      return (
                        <td
                          key={day.toISOString()}
                          className={`border border-gray-200 px-2 py-1 text-center ${
                            hasChange ? getChangeClass(medDose?.changeFromYesterday || 'unchanged') : ''
                          }`}
                          onClick={() => onDayClick?.(day)}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: med.color }}
                              title={med.medication.genericName}
                            />
                            <span
                              className={`font-medium ${
                                tabletCount > 0 ? 'text-gray-900' : 'text-gray-300'
                              }`}
                            >
                              {tabletCount > 0 ? tabletCount : '-'}
                            </span>
                            {hasChange && getChangeIcon(medDose?.changeFromYesterday || 'unchanged')}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}

            {/* Daily totals row */}
            <tr className="bg-brand-50 font-semibold">
              <td className="border border-gray-300 px-3 py-2 text-brand-900">DAILY</td>
              {weekDays.map(day => {
                const dayData = weekSchedule.find(ws => isSameDay(ws.date, day))?.data;

                return (
                  <td
                    key={day.toISOString()}
                    className="border border-gray-300 px-2 py-2 text-center"
                  >
                    {dayData?.medicationDoses.map(medDose => (
                      <div
                        key={medDose.medicationId}
                        className="flex items-center justify-center gap-1 text-sm"
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: medDose.color }}
                        />
                        <span>{medDose.totalTablets}</span>
                        {medDose.changeFromYesterday !== 'unchanged' &&
                          getChangeIcon(medDose.changeFromYesterday)}
                      </div>
                    ))}
                  </td>
                );
              })}
            </tr>

            {/* LED row if multiple medications */}
            {regimen.medications.length > 1 && (
              <tr className="bg-gray-100">
                <td className="border border-gray-300 px-3 py-2 text-gray-700 text-sm">
                  L-Equiv
                </td>
                {weekDays.map(day => {
                  const dayData = weekSchedule.find(ws => isSameDay(ws.date, day))?.data;
                  const led = dayData?.combinedTotals?.totalLED || 0;

                  return (
                    <td
                      key={day.toISOString()}
                      className="border border-gray-300 px-2 py-1 text-center text-sm text-gray-600"
                    >
                      {led > 0 ? `${Math.round(led)}mg` : '-'}
                    </td>
                  );
                })}
              </tr>
            )}

            {/* Checkbox row */}
            <tr>
              <td className="border border-gray-300 px-3 py-2 text-gray-700 text-sm">
                Completed
              </td>
              {weekDays.map(day => {
                const key = format(day, 'yyyy-MM-dd');
                const isChecked = checkedDays.has(key);
                const hasData = weekSchedule.find(ws => isSameDay(ws.date, day))?.data;

                return (
                  <td
                    key={day.toISOString()}
                    className="border border-gray-300 px-2 py-2 text-center"
                  >
                    {hasData && (
                      <button
                        type="button"
                        onClick={() => handleCheckDay(day)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          isChecked
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {isChecked && <Check className="h-4 w-4 text-white" />}
                      </button>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <span className="font-medium">Legend:</span>
        {regimen.medications.map(med => (
          <div key={med.id} className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: med.color }}
            />
            <span>
              {med.selectedPreparation.brandName} {med.selectedPreparation.strength}
              {med.selectedPreparation.unit}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <ArrowUp className="h-3 w-3 text-green-600" />
          <span>Increased</span>
        </div>
        <div className="flex items-center gap-1">
          <ArrowDown className="h-3 w-3 text-orange-600" />
          <span>Decreased</span>
        </div>
      </div>
    </div>
  );
};

export default PDWeeklyView;
