import React from 'react';
import { Check, Scissors, AlertCircle } from 'lucide-react';
import {
  formatPreparationStrength,
  type PDPreparation,
  type PDMedication,
} from '../../../../types/parkinsonsMedications';

interface PDPreparationPickerProps {
  medication: PDMedication;
  selectedPreparation?: PDPreparation;
  onSelect: (preparation: PDPreparation) => void;
  allowHalves?: boolean;
  disabled?: boolean;
}

export const PDPreparationPicker: React.FC<PDPreparationPickerProps> = ({
  medication,
  selectedPreparation,
  onSelect,
  allowHalves = true,
  disabled = false,
}) => {
  // Group preparations by brand name
  const groupedByBrand = medication.preparations.reduce((acc, prep) => {
    if (!acc[prep.brandName]) {
      acc[prep.brandName] = [];
    }
    acc[prep.brandName].push(prep);
    return acc;
  }, {} as Record<string, PDPreparation[]>);

  // Sort each brand's preparations by strength
  Object.values(groupedByBrand).forEach(preps => {
    preps.sort((a, b) => a.strength - b.strength);
  });

  return (
    <div className={`space-y-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {Object.entries(groupedByBrand).map(([brandName, preparations]) => (
        <div key={brandName} className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">{brandName}</h4>
          <div className="grid gap-2">
            {preparations.map(prep => {
              const isSelected = selectedPreparation?.id === prep.id;

              return (
                <button
                  key={prep.id}
                  type="button"
                  onClick={() => onSelect(prep)}
                  disabled={disabled}
                  className={`relative flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Selection indicator */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? 'border-brand-500 bg-brand-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>

                    {/* Preparation details */}
                    <div className="text-left">
                      <p className={`font-medium ${isSelected ? 'text-brand-900' : 'text-gray-900'}`}>
                        {formatPreparationStrength(prep)}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {prep.formulation.replace('-', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2">
                    {/* Halving badge */}
                    {prep.canBeHalved ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                        <Scissors className="h-3 w-3" />
                        Can halve
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        <AlertCircle className="h-3 w-3" />
                        No halving
                      </span>
                    )}

                    {/* PBS badge */}
                    {prep.pbsListed && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        PBS
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Notes for brand */}
          {preparations.some(p => p.notes) && (
            <div className="text-xs text-gray-500 italic pl-2">
              {preparations
                .filter(p => p.notes)
                .map(p => (
                  <p key={p.id}>
                    {formatPreparationStrength(p)}: {p.notes}
                  </p>
                ))}
            </div>
          )}
        </div>
      ))}

      {/* Warning about halving restrictions */}
      {!allowHalves && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">No halving mode enabled</p>
            <p className="text-amber-700">
              Only whole tablets will be used. Some preparations may not be suitable
              for fine titration adjustments.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDPreparationPicker;
