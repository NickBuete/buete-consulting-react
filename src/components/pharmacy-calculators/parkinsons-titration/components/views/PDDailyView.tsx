import React from 'react';
import { format } from 'date-fns';
import { ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type {
  PDRegimen,
  PDRegimenDayDose,
  DoseChangeType,
} from '../../../../../types/parkinsonsMedications';

interface PDDailyViewProps {
  regimen: PDRegimen;
  dayDose: PDRegimenDayDose;
  previousDayDose?: PDRegimenDayDose;
  onPreviousDay?: () => void;
  onNextDay?: () => void;
  hasPreviousDay?: boolean;
  hasNextDay?: boolean;
}

export const PDDailyView: React.FC<PDDailyViewProps> = ({
  regimen,
  dayDose,
  previousDayDose,
  onPreviousDay,
  onNextDay,
  hasPreviousDay = true,
  hasNextDay = true,
}) => {
  const getChangeLabel = (change: DoseChangeType): string => {
    switch (change) {
      case 'increased':
        return 'INCREASED';
      case 'decreased':
        return 'DECREASED';
      case 'started':
        return 'STARTED';
      case 'stopped':
        return 'STOPPED';
      default:
        return 'unchanged';
    }
  };

  const getChangeClass = (change: DoseChangeType): string => {
    switch (change) {
      case 'increased':
        return 'text-green-700 bg-green-100';
      case 'decreased':
        return 'text-orange-700 bg-orange-100';
      case 'started':
        return 'text-green-700 bg-green-100';
      case 'stopped':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const getChangeIcon = (change: DoseChangeType) => {
    switch (change) {
      case 'increased':
      case 'started':
        return <ArrowUp className="h-4 w-4" />;
      case 'decreased':
      case 'stopped':
        return <ArrowDown className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Calculate day number in regimen
  const dayNumber = Math.floor(
    (dayDose.date.getTime() - regimen.startDate.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPreviousDay}
          disabled={!hasPreviousDay}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900">
            {format(dayDose.date, 'EEEE, MMMM d, yyyy')}
          </h3>
          <p className="text-sm text-gray-500">
            {regimen.name} - Day {dayNumber}
          </p>
        </div>

        <button
          type="button"
          onClick={onNextDay}
          disabled={!hasNextDay}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Time slot cards */}
      <div className="space-y-4">
        {regimen.timeSlots.map(slot => (
          <div
            key={slot.id}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* Slot header */}
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
              <span className="font-semibold text-gray-900">{slot.label}</span>
              {slot.defaultTime && (
                <span className="text-gray-500 ml-2">({slot.defaultTime})</span>
              )}
            </div>

            {/* Medications at this time */}
            <div className="divide-y divide-gray-100">
              {regimen.medications.map(med => {
                const medDose = dayDose.medicationDoses.find(
                  d => d.medicationId === med.id
                );
                const slotDose = medDose?.slotDoses.find(sd => sd.slotId === slot.id);
                const tabletCount = slotDose?.tabletCount || 0;
                const doseAmount = tabletCount * med.selectedPreparation.strength;

                // Get previous day's dose for comparison
                const prevMedDose = previousDayDose?.medicationDoses.find(
                  d => d.medicationId === med.id
                );
                const prevSlotDose = prevMedDose?.slotDoses.find(sd => sd.slotId === slot.id);
                const prevTabletCount = prevSlotDose?.tabletCount || 0;

                // Determine if this specific slot changed
                let slotChange: DoseChangeType = 'unchanged';
                if (tabletCount > prevTabletCount) {
                  slotChange = prevTabletCount === 0 ? 'started' : 'increased';
                } else if (tabletCount < prevTabletCount) {
                  slotChange = tabletCount === 0 ? 'stopped' : 'decreased';
                }

                return (
                  <div
                    key={med.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: med.color }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {med.selectedPreparation.brandName} {med.selectedPreparation.strength}
                          {med.selectedPreparation.unit}
                        </p>
                        <p className="text-sm text-gray-500">
                          {med.medication.genericName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Dose info */}
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {tabletCount > 0
                            ? `${tabletCount} ${tabletCount === 1 ? 'tablet' : 'tablets'}`
                            : 'None'}
                        </p>
                        {tabletCount > 0 && (
                          <p className="text-sm text-gray-500">
                            ({doseAmount}{med.selectedPreparation.unit})
                          </p>
                        )}
                      </div>

                      {/* Change indicator */}
                      {slotChange !== 'unchanged' && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getChangeClass(
                            slotChange
                          )}`}
                        >
                          {getChangeIcon(slotChange)}
                          {getChangeLabel(slotChange)}
                        </span>
                      )}

                      {/* Checkbox */}
                      <button
                        type="button"
                        className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center"
                      >
                        {/* Interactive checkbox - state would be managed by parent */}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Daily totals */}
      <div className="border-2 border-brand-200 bg-brand-50 rounded-lg p-4">
        <h4 className="font-bold text-brand-900 mb-3">DAILY TOTALS</h4>

        <div className="space-y-2">
          {dayDose.medicationDoses.map(medDose => {
            const med = regimen.medications.find(m => m.id === medDose.medicationId);
            const prevMedDose = previousDayDose?.medicationDoses.find(
              d => d.medicationId === medDose.medicationId
            );
            const tabletDiff = medDose.totalTablets - (prevMedDose?.totalTablets || 0);

            return (
              <div
                key={medDose.medicationId}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: medDose.color }}
                  />
                  <span className="font-medium text-gray-700">
                    {medDose.medicationName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-brand-900">
                    {medDose.totalTablets} tablets ({medDose.totalDose}
                    {med?.selectedPreparation.unit})
                  </span>
                  {tabletDiff !== 0 && (
                    <span
                      className={`text-sm ${
                        tabletDiff > 0 ? 'text-green-600' : 'text-orange-600'
                      }`}
                    >
                      {tabletDiff > 0 ? '+' : ''}
                      {tabletDiff} from yesterday
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Combined LED if multiple medications */}
        {regimen.medications.length > 1 && dayDose.combinedTotals?.totalLED && (
          <div className="mt-4 pt-3 border-t border-brand-200">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Levodopa Equivalent Dose</span>
              <span className="font-bold text-brand-900">
                {Math.round(dayDose.combinedTotals.totalLED)}mg
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDDailyView;
