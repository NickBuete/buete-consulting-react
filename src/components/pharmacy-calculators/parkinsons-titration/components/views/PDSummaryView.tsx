import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { Package, Scissors, TrendingUp, TrendingDown, Calendar, Activity } from 'lucide-react';
import type { PDRegimen, PDRegimenDayDose } from '../../../../../types/parkinsonsMedications';
import { generateRegimenSummary, getWeeklySummaries } from '../../../../../utils/pd-calculation';

interface PDSummaryViewProps {
  regimen: PDRegimen;
  calculatedSchedule: PDRegimenDayDose[];
}

export const PDSummaryView: React.FC<PDSummaryViewProps> = ({
  regimen,
  calculatedSchedule,
}) => {
  const summary = useMemo(
    () => generateRegimenSummary({ ...regimen, calculatedSchedule }),
    [regimen, calculatedSchedule]
  );

  const weeklySummaries = useMemo(
    () => getWeeklySummaries(calculatedSchedule),
    [calculatedSchedule]
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

      {/* Weekly progression table */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">Weekly Progression</h4>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left">Week</th>
                {regimen.medications.map(med => (
                  <th
                    key={med.id}
                    className="border border-gray-300 px-3 py-2 text-center"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: med.color }}
                      />
                      {med.medication.genericName}
                    </div>
                  </th>
                ))}
                {regimen.medications.length > 1 && (
                  <th className="border border-gray-300 px-3 py-2 text-center">
                    LED
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {weeklySummaries.map(week => (
                <tr key={week.weekNumber}>
                  <td className="border border-gray-300 px-3 py-2 font-medium">
                    Week {week.weekNumber}
                    <span className="block text-xs text-gray-500">
                      {format(week.startDate, 'MMM d')}
                    </span>
                  </td>
                  {week.medications.map(medSummary => {
                    const med = regimen.medications.find(
                      m => m.id === medSummary.id
                    );
                    return (
                      <td
                        key={medSummary.id}
                        className="border border-gray-300 px-3 py-2 text-center"
                      >
                        <div className="font-medium">
                          {medSummary.averageDailyDose.toFixed(0)}
                          {med?.selectedPreparation.unit}
                        </div>
                        <div className="text-xs text-gray-500">
                          ({medSummary.averageDailyTablets.toFixed(1)} tabs)
                        </div>
                      </td>
                    );
                  })}
                  {regimen.medications.length > 1 && (
                    <td className="border border-gray-300 px-3 py-2 text-center font-medium">
                      {Math.round(week.averageLED)}mg
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
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
        </ul>
      </div>
    </div>
  );
};

export default PDSummaryView;
