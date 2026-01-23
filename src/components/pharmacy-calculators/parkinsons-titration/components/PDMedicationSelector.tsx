import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Search, Pill } from 'lucide-react';
import {
  PD_CATEGORY_LABELS,
  getMedicationsGroupedByCategory,
  type PDMedication,
  type PDMedicationCategory,
} from '../../../../types/parkinsonsMedications';

interface PDMedicationSelectorProps {
  selectedMedication?: PDMedication;
  onSelect: (medication: PDMedication) => void;
  suggestedCategories?: PDMedicationCategory[];
  excludeMedicationIds?: string[];
  disabled?: boolean;
}

export const PDMedicationSelector: React.FC<PDMedicationSelectorProps> = ({
  selectedMedication,
  onSelect,
  suggestedCategories,
  excludeMedicationIds = [],
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const defaultCategories: PDMedicationCategory[] = ['levodopa-combination', 'dopamine-agonist'];
  const [expandedCategories, setExpandedCategories] = useState<Set<PDMedicationCategory>>(
    new Set(suggestedCategories || defaultCategories)
  );

  const groupedMedications = useMemo(() => getMedicationsGroupedByCategory(), []);

  const filteredGrouped = useMemo(() => {
    const result: Record<PDMedicationCategory, PDMedication[]> = {
      'levodopa-combination': [],
      'dopamine-agonist': [],
      'mao-b-inhibitor': [],
      'comt-inhibitor': [],
      'anticholinergic': [],
      'amantadine': [],
    };

    const searchLower = searchTerm.toLowerCase();

    for (const [category, meds] of Object.entries(groupedMedications)) {
      const filtered = meds.filter(med => {
        // Exclude specific medications
        if (excludeMedicationIds.includes(med.id)) return false;

        // Search filter
        if (searchTerm) {
          const matchesGeneric = med.genericName.toLowerCase().includes(searchLower);
          const matchesBrand = med.preparations.some(p =>
            p.brandName.toLowerCase().includes(searchLower)
          );
          return matchesGeneric || matchesBrand;
        }

        return true;
      });

      result[category as PDMedicationCategory] = filtered;
    }

    return result;
  }, [groupedMedications, searchTerm, excludeMedicationIds]);

  const toggleCategory = (category: PDMedicationCategory) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const categoryOrder: PDMedicationCategory[] = suggestedCategories?.length
    ? [
        ...suggestedCategories,
        ...(['levodopa-combination', 'dopamine-agonist', 'mao-b-inhibitor', 'comt-inhibitor', 'anticholinergic', 'amantadine'] as PDMedicationCategory[])
          .filter(c => !suggestedCategories.includes(c)),
      ]
    : ['levodopa-combination', 'dopamine-agonist', 'mao-b-inhibitor', 'comt-inhibitor', 'anticholinergic', 'amantadine'];

  return (
    <div className={`space-y-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search medications..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          disabled={disabled}
        />
      </div>

      {/* Category list */}
      <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200">
        {categoryOrder.map(category => {
          const medications = filteredGrouped[category];
          if (medications.length === 0) return null;

          const isExpanded = expandedCategories.has(category);
          const isSuggested = suggestedCategories?.includes(category);

          return (
            <div key={category}>
              {/* Category header */}
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  isSuggested ? 'bg-brand-50' : 'bg-white'
                }`}
                disabled={disabled}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="font-medium text-gray-900">
                    {PD_CATEGORY_LABELS[category]}
                  </span>
                  {isSuggested && (
                    <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                      Suggested
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {medications.length} medication{medications.length !== 1 ? 's' : ''}
                </span>
              </button>

              {/* Medications list */}
              {isExpanded && (
                <div className="bg-gray-50 divide-y divide-gray-100">
                  {medications.map(med => {
                    const isSelected = selectedMedication?.id === med.id;
                    const brandNames = Array.from(new Set(med.preparations.map(p => p.brandName))).join(', ');

                    return (
                      <button
                        key={med.id}
                        type="button"
                        onClick={() => onSelect(med)}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                          isSelected
                            ? 'bg-brand-100 border-l-4 border-brand-500'
                            : 'hover:bg-gray-100 border-l-4 border-transparent'
                        }`}
                        disabled={disabled}
                      >
                        <Pill className={`h-5 w-5 mt-0.5 ${isSelected ? 'text-brand-600' : 'text-gray-400'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${isSelected ? 'text-brand-900' : 'text-gray-900'}`}>
                            {med.genericName}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {brandNames}
                          </p>
                          {med.titrationGuidance && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {med.titrationGuidance}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <span className="text-brand-600 text-sm font-medium">Selected</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No results */}
      {searchTerm && Object.values(filteredGrouped).every(arr => arr.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          <Pill className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p>No medications found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default PDMedicationSelector;
