import React, { useMemo } from 'react';
import { format, getDay } from 'date-fns';
import { Package, Scissors, TrendingUp, TrendingDown, Calendar, Activity } from 'lucide-react';
import type { PDRegimen, PDRegimenDayDose } from '../../../../../types/parkinsonsMedications';
import { generateRegimenSummary } from '../../../../../utils/pd-calculation';
import { WEEK_DAY_SHORT_LABELS, type WeekStartDay } from '../../../../../types/parkinsonsMedications';

interface PDSummaryViewProps {
  regimen: PDRegimen;
  calculatedSchedule: PDRegimenDayDose[];
}

// Helper to group schedule by custom weeks
function groupByCustomWeeks(
  schedule: PDRegimenDayDose[],
  weekStartDay: WeekStartDay
): PDRegimenDayDose[][] {
  if (schedule.length === 0) return [];

  const weeks: PDRegimenDayDose[][] = [];
  let currentWeek: PDRegimenDayDose[] = [];

  for (const dayDose of schedule) {
    const dayOfWeek = getDay(dayDose.date) as WeekStartDay;

    // Start a new week when we hit the weekStartDay (and not the first day)
    if (dayOfWeek === weekStartDay && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentWeek.push(dayDose);
  }

  // Don't forget the last partial week
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
}

// Get ordered day labels starting from weekStartDay
function getOrderedDayLabels(weekStartDay: WeekStartDay): string[] {
  const labels: string[] = [];
  for (let i = 0; i < 7; i++) {
    const day = ((weekStartDay + i) % 7) as WeekStartDay;
    labels.push(WEEK_DAY_SHORT_LABELS[day]);
  }
  return labels;
}

// Format tablet count for display
function formatTabletCount(count: number): string {
  if (count === 0) return '-';
  if (count % 1 === 0) return count.toString();
  // Handle halves: 0.5 -> ½, 1.5 -> 1½, etc.
  const whole = Math.floor(count);
  const fraction = count - whole;
  if (fraction === 0.5) {
    return whole === 0 ? '½' : `${whole}½`;
  }
  return count.toFixed(1);
}

export const PDSummaryView: React.FC<PDSummaryViewProps> = ({
  regimen,
  calculatedSchedule,
}) => {
  const summary = useMemo(
    () => generateRegimenSummary({ ...regimen, calculatedSchedule }),
    [regimen, calculatedSchedule]
  );

  // Group schedule by custom weeks
  const weeklySchedule = useMemo(
    () => groupByCustomWeeks(calculatedSchedule, regimen.weekStartDay),
    [calculatedSchedule, regimen.weekStartDay]
  );

  // Ordered day labels
  const dayLabels = useMemo(
    () => getOrderedDayLabels(regimen.weekStartDay),
    [regimen.weekStartDay]
  );

  if (calculatedSchedule.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No schedule data to display</p>
      </div>
    );
  }

  const startDate = calculatedSchedule[0].date;
  const endDate = calculatedSchedule[calculatedSchedule.length - 1].date;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-50 to-purple-50 border border-brand-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {regimen.name || 'Regimen Summary'}
        </h3>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
            </span>
          </div>
          <div>
            <span className="font-medium">{summary.totalDays}</span> days
          </div>
          <div>
            <span className="font-medium">{regimen.medications.length}</span> medication
            {regimen.medications.length !== 1 ? 's' : ''}
          </div>
          {summary.crossTitrationCount > 0 && (
            <div>
              <span className="font-medium">{summary.crossTitrationCount}</span> cross-titration
              {summary.crossTitrationCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Per-medication summaries */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">Medication Details</h4>

        {regimen.medications.map(med => {
          const medSummary = summary.medications.find(m => m.id === med.id);
          if (!medSummary) return null;

          const isIncreasing = medSummary.endingDose > medSummary.startingDose;
          const isDecreasing = medSummary.endingDose < medSummary.startingDose;

          // Use actual container quantity from preparation, fallback to 100 if not specified
          const tabletsPerBox = med.selectedPreparation.containerQuantity || 100;
          const boxesNeeded = Math.ceil(medSummary.totalTabletsNeeded / tabletsPerBox);

          return (
            <div
              key={med.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Medication header */}
              <div
                className="px-4 py-3 flex items-center gap-3"
                style={{ backgroundColor: `${med.color}20` }}
              >
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: med.color }}
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {med.selectedPreparation.brandName} (
                    {med.medication.genericName})
                  </p>
                  <p className="text-sm text-gray-600">
                    {med.selectedPreparation.strength}
                    {med.selectedPreparation.unit} -{' '}
                    {med.scheduleMode === 'hold-steady'
                      ? 'Hold Steady'
                      : med.scheduleMode === 'titrating'
                      ? 'Titrating'
                      : 'Discontinuing'}
                  </p>
                </div>
                {isIncreasing && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    Increasing
                  </span>
                )}
                {isDecreasing && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-sm">
                    <TrendingDown className="h-4 w-4" />
                    Decreasing
                  </span>
                )}
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                <div>
                  <p className="text-sm text-gray-500">Starting</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {medSummary.startingDose}
                    {med.selectedPreparation.unit}/day
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ending</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {medSummary.endingDose}
                    {med.selectedPreparation.unit}/day
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dose Changes</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {medSummary.changeCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Tablets</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {medSummary.totalTabletsNeeded}
                  </p>
                </div>
              </div>

              {/* Supply requirements */}
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span>
                      <span className="font-medium">{boxesNeeded}</span> box
                      {boxesNeeded !== 1 ? 'es' : ''} needed
                      <span className="text-gray-500"> (approx. {tabletsPerBox}/box)</span>
                    </span>
                  </div>
                  {medSummary.halfTabletsNeeded > 0 && (
                    <div className="flex items-center gap-2">
                      <Scissors className="h-4 w-4 text-gray-500" />
                      <span>
                        <span className="font-medium">{medSummary.halfTabletsNeeded}</span>{' '}
                        half-tablet doses
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cross-titration summary */}
      {regimen.crossTitrationLinks.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Cross-Titration</h4>

          {regimen.crossTitrationLinks.map(link => {
            const increasingMed = regimen.medications.find(
              m => m.id === link.increasingMedId
            );
            const decreasingMed = regimen.medications.find(
              m => m.id === link.decreasingMedId
            );

            return (
              <div
                key={link.id}
                className="p-4 bg-purple-50 border border-purple-200 rounded-lg"
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: decreasingMed?.color }}
                    />
                    <span className="text-orange-700">
                      {decreasingMed?.medication.genericName}
                    </span>
                    <TrendingDown className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="text-gray-400">↔</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-green-700">
                      {increasingMed?.medication.genericName}
                    </span>
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: increasingMed?.color }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Sync mode:{' '}
                  <span className="font-medium">
                    {link.syncMode === 'same-day'
                      ? 'Same day'
                      : link.syncMode === 'alternating'
                      ? 'Alternating'
                      : `Offset by ${link.offsetDays} days`}
                  </span>
                  {link.ratio && (
                    <>
                      {' · '}
                      Ratio: {link.ratio.increaseAmount} increase :{' '}
                      {link.ratio.decreaseAmount} decrease
                    </>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Weekly Blister Pack View */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">Weekly Blister Pack View</h4>
          <span className="text-sm text-gray-500">
            Weeks start on {WEEK_DAY_SHORT_LABELS[regimen.weekStartDay]}
          </span>
        </div>

        {/* Medication Legend */}
        {regimen.medications.length > 1 && (
          <div className="flex flex-wrap gap-4 text-sm">
            {regimen.medications.map(med => (
              <div key={med.id} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: med.color }}
                />
                <span>{med.selectedPreparation.brandName}</span>
              </div>
            ))}
          </div>
        )}

        {/* Weekly tables */}
        <div className="space-y-6">
          {weeklySchedule.map((week, weekIndex) => {
            const weekStart = week[0].date;
            const weekEnd = week[week.length - 1].date;

            return (
              <div key={weekIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Week header */}
                <div className="bg-gray-100 px-4 py-2 font-medium text-gray-900 border-b border-gray-200">
                  Week {weekIndex + 1}: {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border-r border-gray-200 px-3 py-2 text-left font-medium text-gray-700 w-20">
                          Time
                        </th>
                        {dayLabels.map((dayLabel, dayIdx) => {
                          // Find the actual date for this day in the week
                          const dayDate = week.find(d => {
                            const dayOfWeek = getDay(d.date);
                            const expectedDay = (regimen.weekStartDay + dayIdx) % 7;
                            return dayOfWeek === expectedDay;
                          })?.date;

                          return (
                            <th
                              key={dayIdx}
                              className="border-r border-gray-200 px-2 py-2 text-center font-medium text-gray-700 min-w-[60px]"
                            >
                              <div>{dayLabel}</div>
                              {dayDate && (
                                <div className="text-xs font-normal text-gray-500">
                                  {format(dayDate, 'd')}
                                </div>
                              )}
                            </th>
                          );
                        })}
                        <th className="px-2 py-2 text-center font-medium text-gray-700 min-w-[50px]">
                          Daily
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {regimen.timeSlots.map((slot, slotIdx) => (
                        <tr key={slot.id} className={slotIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border-r border-t border-gray-200 px-3 py-2 font-medium text-gray-700">
                            {slot.label}
                          </td>
                          {dayLabels.map((_, dayIdx) => {
                            // Find the day's data
                            const expectedDay = (regimen.weekStartDay + dayIdx) % 7;
                            const dayData = week.find(d => getDay(d.date) === expectedDay);

                            if (!dayData) {
                              return (
                                <td
                                  key={dayIdx}
                                  className="border-r border-t border-gray-200 px-2 py-2 text-center text-gray-300"
                                >
                                  -
                                </td>
                              );
                            }

                            // Get tablet counts for each medication at this slot
                            const cellContent = regimen.medications.map(med => {
                              const medDose = dayData.medicationDoses.find(
                                m => m.medicationId === med.id
                              );
                              const slotDose = medDose?.slotDoses.find(
                                sd => sd.slotId === slot.id
                              );
                              const count = slotDose?.tabletCount || 0;

                              return {
                                medId: med.id,
                                color: med.color,
                                count,
                              };
                            });

                            // Check if any doses changed from previous day
                            const dayIdxInWeek = week.indexOf(dayData);
                            const prevDay = dayIdxInWeek > 0 ? week[dayIdxInWeek - 1] : null;
                            let hasChange = false;
                            if (prevDay) {
                              for (const med of regimen.medications) {
                                const todayMed = dayData.medicationDoses.find(m => m.medicationId === med.id);
                                const prevMed = prevDay.medicationDoses.find(m => m.medicationId === med.id);
                                const todaySlot = todayMed?.slotDoses.find(sd => sd.slotId === slot.id);
                                const prevSlot = prevMed?.slotDoses.find(sd => sd.slotId === slot.id);
                                if ((todaySlot?.tabletCount || 0) !== (prevSlot?.tabletCount || 0)) {
                                  hasChange = true;
                                  break;
                                }
                              }
                            }

                            return (
                              <td
                                key={dayIdx}
                                className={`border-r border-t border-gray-200 px-2 py-2 text-center ${
                                  hasChange ? 'bg-amber-50' : ''
                                }`}
                              >
                                {regimen.medications.length === 1 ? (
                                  // Single medication - just show the count
                                  <span className={`font-medium ${cellContent[0].count === 0 ? 'text-gray-300' : 'text-gray-900'}`}>
                                    {formatTabletCount(cellContent[0].count)}
                                  </span>
                                ) : (
                                  // Multiple medications - show colored counts
                                  <div className="flex flex-col gap-0.5">
                                    {cellContent.map(item => (
                                      <div key={item.medId} className="flex items-center justify-center gap-1">
                                        <span
                                          className="w-2 h-2 rounded-full flex-shrink-0"
                                          style={{ backgroundColor: item.color }}
                                        />
                                        <span className={`text-xs font-medium ${item.count === 0 ? 'text-gray-300' : 'text-gray-900'}`}>
                                          {formatTabletCount(item.count)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                          {/* Daily total for this slot */}
                          <td className="border-t border-gray-200 px-2 py-2 text-center bg-gray-100">
                            {regimen.medications.length === 1 ? (
                              <span className="font-medium text-gray-700">
                                {formatTabletCount(
                                  week.reduce((sum, day) => {
                                    const medDose = day.medicationDoses.find(
                                      m => m.medicationId === regimen.medications[0].id
                                    );
                                    const slotDose = medDose?.slotDoses.find(sd => sd.slotId === slot.id);
                                    return sum + (slotDose?.tabletCount || 0);
                                  }, 0)
                                )}
                              </span>
                            ) : (
                              <div className="flex flex-col gap-0.5">
                                {regimen.medications.map(med => {
                                  const total = week.reduce((sum, day) => {
                                    const medDose = day.medicationDoses.find(m => m.medicationId === med.id);
                                    const slotDose = medDose?.slotDoses.find(sd => sd.slotId === slot.id);
                                    return sum + (slotDose?.tabletCount || 0);
                                  }, 0);
                                  return (
                                    <div key={med.id} className="flex items-center justify-center gap-1">
                                      <span
                                        className="w-2 h-2 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: med.color }}
                                      />
                                      <span className="text-xs font-medium text-gray-700">
                                        {formatTabletCount(total)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {/* Daily totals row */}
                      <tr className="bg-gray-100 font-medium">
                        <td className="border-r border-t border-gray-300 px-3 py-2 text-gray-700">
                          Total
                        </td>
                        {dayLabels.map((_, dayIdx) => {
                          const expectedDay = (regimen.weekStartDay + dayIdx) % 7;
                          const dayData = week.find(d => getDay(d.date) === expectedDay);

                          if (!dayData) {
                            return (
                              <td
                                key={dayIdx}
                                className="border-r border-t border-gray-300 px-2 py-2 text-center text-gray-300"
                              >
                                -
                              </td>
                            );
                          }

                          return (
                            <td
                              key={dayIdx}
                              className="border-r border-t border-gray-300 px-2 py-2 text-center"
                            >
                              {regimen.medications.length === 1 ? (
                                <span className="text-gray-900">
                                  {formatTabletCount(dayData.medicationDoses[0]?.totalTablets || 0)}
                                </span>
                              ) : (
                                <div className="flex flex-col gap-0.5">
                                  {regimen.medications.map(med => {
                                    const medDose = dayData.medicationDoses.find(
                                      m => m.medicationId === med.id
                                    );
                                    return (
                                      <div key={med.id} className="flex items-center justify-center gap-1">
                                        <span
                                          className="w-2 h-2 rounded-full flex-shrink-0"
                                          style={{ backgroundColor: med.color }}
                                        />
                                        <span className="text-xs text-gray-900">
                                          {formatTabletCount(medDose?.totalTablets || 0)}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </td>
                          );
                        })}
                        {/* Week total */}
                        <td className="border-t border-gray-300 px-2 py-2 text-center">
                          {regimen.medications.length === 1 ? (
                            <span className="text-gray-900 font-bold">
                              {formatTabletCount(
                                week.reduce(
                                  (sum, day) => sum + (day.medicationDoses[0]?.totalTablets || 0),
                                  0
                                )
                              )}
                            </span>
                          ) : (
                            <div className="flex flex-col gap-0.5">
                              {regimen.medications.map(med => {
                                const total = week.reduce((sum, day) => {
                                  const medDose = day.medicationDoses.find(m => m.medicationId === med.id);
                                  return sum + (medDose?.totalTablets || 0);
                                }, 0);
                                return (
                                  <div key={med.id} className="flex items-center justify-center gap-1">
                                    <span
                                      className="w-2 h-2 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: med.color }}
                                    />
                                    <span className="text-xs font-bold text-gray-900">
                                      {formatTabletCount(total)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dispensing notes */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-semibold text-amber-900 mb-2">Dispensing Notes</h4>
        <ul className="space-y-1 text-sm text-amber-800">
          {regimen.medications.length > 1 && (
            <li>• Patient will need overlapping supply of multiple medications</li>
          )}
          {summary.medications.some(m => m.endingDose < m.startingDose) && (
            <li>
              • Consider dispensing decreasing medications in smaller quantities to
              avoid wastage
            </li>
          )}
          {summary.medications.some(m => m.halfTabletsNeeded > 0) && (
            <li>• Schedule includes half-tablet doses - ensure patient can halve tablets</li>
          )}
          <li>
            • Review schedule at {Math.ceil(summary.totalDays / 7)} week
            {summary.totalDays > 7 ? 's' : ''} or as clinically indicated
          </li>
          <li>
            • Amber highlighted cells indicate dose changes from previous day
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PDSummaryView;
