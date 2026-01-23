import React, { useState, useMemo, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { AlertTriangle, ChevronLeft, ChevronRight, Calendar, List, BarChart3 } from 'lucide-react';
import { WizardStepper } from '../../ui/WizardStepper';
import { DateInput } from '../../ui/DateInput';
import {
  PDMedicationSelector,
  PDPreparationPicker,
  PDTimeSlotConfig,
  PDDoseEntryGrid,
  PDWeeklyView,
  PDDailyView,
  PDSummaryView,
} from './components';
import { calculateRegimenSchedule } from '../../../utils/pd-calculation';
import {
  REGIMEN_TEMPLATES,
  DEFAULT_PD_TIME_SLOTS,
  createEmptySlotDoses,
  getNextMedicationColor,
  WEEK_DAY_LABELS,
  type PDRegimen,
  type PDRegimenMedication,
  type PDMedication,
  type PDPreparation,
  type PDTimeSlot,
  type RegimenTemplate,
  type WeekStartDay,
} from '../../../types/parkinsonsMedications';

type WizardStep = 'template' | 'time-slots' | 'medications' | 'doses' | 'cross-titration' | 'review';
type ViewMode = 'weekly' | 'daily' | 'summary';

const WIZARD_STEPS: { id: WizardStep; title: string; description: string }[] = [
  { id: 'template', title: 'Regimen Type', description: 'Choose a scenario' },
  { id: 'time-slots', title: 'Time Slots', description: 'Configure dose times' },
  { id: 'medications', title: 'Medications', description: 'Select medications' },
  { id: 'doses', title: 'Doses', description: 'Set starting doses' },
  { id: 'cross-titration', title: 'Titration', description: 'Configure changes' },
  { id: 'review', title: 'Review', description: 'View schedule' },
];

export const ParkinsonsTitrationTool: React.FC = () => {
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<RegimenTemplate>('single-med-titration');

  // Regimen state
  const [regimenName, setRegimenName] = useState('');
  const [timeSlots, setTimeSlots] = useState<PDTimeSlot[]>(DEFAULT_PD_TIME_SLOTS.slice(0, 4));
  const [startDateStr, setStartDateStr] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [endDateStr, setEndDateStr] = useState<string | undefined>();

  // Parsed dates for calculations
  const startDate = useMemo(() => parseISO(startDateStr), [startDateStr]);
  const endDate = useMemo(() => endDateStr ? parseISO(endDateStr) : undefined, [endDateStr]);
  const [allowHalves, setAllowHalves] = useState(true);
  const [maxTabletsPerDose, setMaxTabletsPerDose] = useState(3);
  const [weekStartDay, setWeekStartDay] = useState<WeekStartDay>(1); // Default Monday

  // Medications state
  const [medications, setMedications] = useState<PDRegimenMedication[]>([]);
  const [editingMedIndex, setEditingMedIndex] = useState<number | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Build the regimen object
  const regimen: PDRegimen = useMemo(() => ({
    id: 'regimen-1',
    name: regimenName || REGIMEN_TEMPLATES.find(t => t.id === selectedTemplate)?.name || 'PD Titration',
    timeSlots,
    startDate,
    endDate,
    medications,
    crossTitrationLinks: [], // TODO: Add cross-titration UI
    allowHalves,
    maxTabletsPerDose,
    weekStartDay,
  }), [regimenName, selectedTemplate, timeSlots, startDate, endDate, medications, allowHalves, maxTabletsPerDose, weekStartDay]);

  // Calculate schedule
  const calculatedSchedule = useMemo(() => {
    if (medications.length === 0) return [];
    return calculateRegimenSchedule(regimen);
  }, [regimen, medications]);

  // Navigation
  const currentStepIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);

  const canGoNext = useMemo(() => {
    switch (currentStep) {
      case 'template':
        return true;
      case 'time-slots':
        return timeSlots.length >= 1;
      case 'medications':
        return medications.length >= 1;
      case 'doses':
        return medications.every(m =>
          m.steadySlotDoses?.some(sd => sd.tabletCount > 0) ||
          m.titrationConfig?.startingSlotDoses.some(sd => sd.tabletCount > 0)
        );
      case 'cross-titration':
        return true;
      default:
        return true;
    }
  }, [currentStep, timeSlots, medications]);

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < WIZARD_STEPS.length) {
      // Skip cross-titration if single medication
      if (WIZARD_STEPS[nextIndex].id === 'cross-titration' && medications.length < 2) {
        setCurrentStep('review');
      } else {
        setCurrentStep(WIZARD_STEPS[nextIndex].id);
      }
    }
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      // Skip cross-titration if single medication
      if (WIZARD_STEPS[prevIndex].id === 'cross-titration' && medications.length < 2) {
        setCurrentStep('doses');
      } else {
        setCurrentStep(WIZARD_STEPS[prevIndex].id);
      }
    }
  };

  // Add medication
  const addMedication = useCallback((medication: PDMedication, preparation: PDPreparation) => {
    const usedColors = medications.map(m => m.color);
    const newMed: PDRegimenMedication = {
      id: `med-${Date.now()}`,
      medication,
      selectedPreparation: preparation,
      scheduleMode: 'titrating',
      steadySlotDoses: createEmptySlotDoses(timeSlots),
      titrationConfig: {
        startingSlotDoses: createEmptySlotDoses(timeSlots),
        titrationDirection: 'increase',
        changeAmount: 0.5,
        intervalDays: 7,
        titrationSequence: timeSlots.map(s => s.id),
        incrementsPerSlot: 1,
        maxTabletsPerDose,
        minimumTabletCount: 0,
      },
      color: getNextMedicationColor(usedColors),
      displayOrder: medications.length + 1,
    };
    setMedications(prev => [...prev, newMed]);
  }, [medications, timeSlots, maxTabletsPerDose]);

  // Update medication
  const updateMedication = useCallback((index: number, updates: Partial<PDRegimenMedication>) => {
    setMedications(prev =>
      prev.map((m, i) => (i === index ? { ...m, ...updates } : m))
    );
  }, []);

  // Remove medication
  const removeMedication = useCallback((index: number) => {
    setMedications(prev => prev.filter((_, i) => i !== index));
    if (editingMedIndex === index) {
      setEditingMedIndex(null);
    }
  }, [editingMedIndex]);

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'template':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Regimen Type</h3>
              <p className="text-gray-600">Choose a common scenario or build a custom regimen.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {REGIMEN_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedTemplate === template.id
                      ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900">{template.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  {template.hasCrossTitration && (
                    <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                      Cross-titration
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Regimen Name (optional)
                </label>
                <input
                  type="text"
                  value={regimenName}
                  onChange={e => setRegimenName(e.target.value)}
                  placeholder="e.g., John's Levodopa Titration"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <DateInput
                  value={startDateStr}
                  onChange={setStartDateStr}
                  mode="any"
                />
              </div>
            </div>
          </div>
        );

      case 'time-slots':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Configure Dose Times</h3>
              <p className="text-gray-600">
                Set up 1-8 daily dose times. These will apply to all medications in this regimen.
              </p>
            </div>

            <PDTimeSlotConfig
              slots={timeSlots}
              onSlotsChange={setTimeSlots}
              minSlots={1}
              maxSlots={8}
            />
          </div>
        );

      case 'medications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Medications</h3>
              <p className="text-gray-600">
                Add the medications for this regimen. You can add multiple medications for
                cross-titration scenarios.
              </p>
            </div>

            {/* Current medications list */}
            {medications.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Added Medications</h4>
                {medications.map((med, index) => (
                  <div
                    key={med.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: med.color }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {med.selectedPreparation.brandName} {med.selectedPreparation.strength}
                          {med.selectedPreparation.unit}
                        </p>
                        <p className="text-sm text-gray-500">{med.medication.genericName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={med.scheduleMode}
                        onChange={e =>
                          updateMedication(index, {
                            scheduleMode: e.target.value as PDRegimenMedication['scheduleMode'],
                          })
                        }
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="hold-steady">Hold Steady</option>
                        <option value="titrating">Titrating</option>
                        <option value="discontinuing">Discontinuing</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add medication UI */}
            <MedicationAdder
              onAdd={addMedication}
              excludeIds={medications.map(m => m.medication.id)}
              suggestedCategories={
                REGIMEN_TEMPLATES.find(t => t.id === selectedTemplate)?.roles
                  .flatMap(r => r.suggestedCategories)
              }
            />

            {/* Global settings */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-4">
              <h4 className="font-medium text-gray-700">Global Settings</h4>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allowHalves}
                    onChange={e => setAllowHalves(e.target.checked)}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm text-gray-700">Allow half tablets</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Max tablets per dose:</label>
                  <select
                    value={maxTabletsPerDose}
                    onChange={e => setMaxTabletsPerDose(parseInt(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    {[2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Week starts on:</label>
                  <select
                    value={weekStartDay}
                    onChange={e => setWeekStartDay(parseInt(e.target.value) as WeekStartDay)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    {([0, 1, 2, 3, 4, 5, 6] as WeekStartDay[]).map(day => (
                      <option key={day} value={day}>{WEEK_DAY_LABELS[day]}</option>
                    ))}
                  </select>
                  <span className="text-xs text-gray-500">(for blister packs)</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'doses':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Set Starting Doses</h3>
              <p className="text-gray-600">
                Configure the starting dose for each medication at each time slot.
              </p>
            </div>

            {medications.map((med, index) => (
              <div key={med.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div
                  className="px-4 py-3 flex items-center gap-3"
                  style={{ backgroundColor: `${med.color}20` }}
                >
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: med.color }}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {med.selectedPreparation.brandName} {med.selectedPreparation.strength}
                      {med.selectedPreparation.unit}
                    </p>
                    <p className="text-sm text-gray-600">
                      {med.scheduleMode === 'hold-steady'
                        ? 'Hold Steady'
                        : med.scheduleMode === 'titrating'
                        ? 'Titrating Up'
                        : 'Discontinuing'}
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <PDDoseEntryGrid
                    timeSlots={timeSlots}
                    doses={
                      med.scheduleMode === 'hold-steady'
                        ? med.steadySlotDoses || []
                        : med.titrationConfig?.startingSlotDoses || []
                    }
                    onDosesChange={doses => {
                      if (med.scheduleMode === 'hold-steady') {
                        updateMedication(index, { steadySlotDoses: doses });
                      } else {
                        // Update both starting doses and the titration sequence based on slot settings
                        const titratingSlots = doses
                          .filter(d => d.titrationMode === 'titrate')
                          .sort((a, b) => (a.titrationOrder || 0) - (b.titrationOrder || 0))
                          .map(d => d.slotId);

                        updateMedication(index, {
                          titrationConfig: {
                            ...med.titrationConfig!,
                            startingSlotDoses: doses,
                            titrationSequence: titratingSlots,
                          },
                        });
                      }
                    }}
                    preparation={med.selectedPreparation}
                    allowHalves={allowHalves && med.selectedPreparation.canBeHalved}
                    maxPerDose={maxTabletsPerDose}
                    showTitrationControls={med.scheduleMode !== 'hold-steady'}
                  />

                  {/* Titration config for non-steady medications */}
                  {med.scheduleMode !== 'hold-steady' && (
                    <div className="mt-4 pt-4 border-t border-gray-200 grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Change amount
                        </label>
                        <select
                          value={med.titrationConfig?.changeAmount || 0.5}
                          onChange={e =>
                            updateMedication(index, {
                              titrationConfig: {
                                ...med.titrationConfig!,
                                changeAmount: parseFloat(e.target.value),
                              },
                            })
                          }
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        >
                          {allowHalves && <option value={0.5}>½ tablet</option>}
                          <option value={1}>1 tablet</option>
                          {allowHalves && <option value={1.5}>1½ tablets</option>}
                          <option value={2}>2 tablets</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Change every
                        </label>
                        <select
                          value={med.titrationConfig?.intervalDays || 7}
                          onChange={e =>
                            updateMedication(index, {
                              titrationConfig: {
                                ...med.titrationConfig!,
                                intervalDays: parseInt(e.target.value),
                              },
                            })
                          }
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        >
                          <option value={3}>3 days</option>
                          <option value={5}>5 days</option>
                          <option value={7}>7 days (1 week)</option>
                          <option value={14}>14 days (2 weeks)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Direction
                        </label>
                        <select
                          value={med.titrationConfig?.titrationDirection || 'increase'}
                          onChange={e =>
                            updateMedication(index, {
                              titrationConfig: {
                                ...med.titrationConfig!,
                                titrationDirection: e.target.value as 'increase' | 'decrease',
                              },
                            })
                          }
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        >
                          <option value="increase">Increasing</option>
                          <option value="decrease">Decreasing</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 'cross-titration':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cross-Titration Settings</h3>
              <p className="text-gray-600">
                Configure how medications should change in relation to each other.
              </p>
            </div>
            {/* TODO: Add cross-titration linking UI */}
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
              <p>Cross-titration configuration coming soon.</p>
              <p className="text-sm mt-2">
                For now, medications will titrate independently based on their individual settings.
              </p>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            {/* View mode tabs */}
            <div className="flex items-center gap-2 border-b border-gray-200 pb-4">
              <button
                type="button"
                onClick={() => setViewMode('weekly')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'weekly'
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Calendar className="h-4 w-4" />
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setViewMode('daily')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'daily'
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="h-4 w-4" />
                Daily
              </button>
              <button
                type="button"
                onClick={() => setViewMode('summary')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'summary'
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Summary
              </button>
            </div>

            {/* View content */}
            {viewMode === 'weekly' && calculatedSchedule.length > 0 && (
              <PDWeeklyView
                regimen={regimen}
                calculatedSchedule={calculatedSchedule}
                onDayClick={date => {
                  const index = calculatedSchedule.findIndex(
                    d => d.date.toDateString() === date.toDateString()
                  );
                  if (index >= 0) {
                    setSelectedDayIndex(index);
                    setViewMode('daily');
                  }
                }}
              />
            )}

            {viewMode === 'daily' && calculatedSchedule.length > 0 && (
              <PDDailyView
                regimen={regimen}
                dayDose={calculatedSchedule[selectedDayIndex]}
                previousDayDose={selectedDayIndex > 0 ? calculatedSchedule[selectedDayIndex - 1] : undefined}
                onPreviousDay={() => setSelectedDayIndex(prev => Math.max(0, prev - 1))}
                onNextDay={() =>
                  setSelectedDayIndex(prev => Math.min(calculatedSchedule.length - 1, prev + 1))
                }
                hasPreviousDay={selectedDayIndex > 0}
                hasNextDay={selectedDayIndex < calculatedSchedule.length - 1}
              />
            )}

            {viewMode === 'summary' && (
              <PDSummaryView
                regimen={regimen}
                calculatedSchedule={calculatedSchedule}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Safety warning */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-medium">Clinical Decision Support Tool</p>
          <p>
            This tool is intended to assist healthcare professionals in planning medication
            regimens. Always verify schedules against clinical guidelines and patient-specific
            factors before implementing.
          </p>
        </div>
      </div>

      {/* Wizard stepper */}
      <WizardStepper
        steps={WIZARD_STEPS.map(s => ({ id: s.id, label: s.title, description: s.description }))}
        currentStep={currentStepIndex}
      />

      {/* Step content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {renderStepContent()}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={currentStepIndex === 0}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-5 w-5" />
          Back
        </button>

        {currentStep !== 'review' ? (
          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext}
            className="flex items-center gap-2 px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
          >
            Print Schedule
          </button>
        )}
      </div>
    </div>
  );
};

// Sub-component for adding medications
interface MedicationAdderProps {
  onAdd: (medication: PDMedication, preparation: PDPreparation) => void;
  excludeIds: string[];
  suggestedCategories?: string[];
}

const MedicationAdder: React.FC<MedicationAdderProps> = ({
  onAdd,
  excludeIds,
  suggestedCategories,
}) => {
  const [selectedMed, setSelectedMed] = useState<PDMedication | undefined>();
  const [selectedPrep, setSelectedPrep] = useState<PDPreparation | undefined>();

  const handleAdd = () => {
    if (selectedMed && selectedPrep) {
      onAdd(selectedMed, selectedPrep);
      setSelectedMed(undefined);
      setSelectedPrep(undefined);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-700">Add Medication</h4>

      {!selectedMed ? (
        <PDMedicationSelector
          selectedMedication={selectedMed}
          onSelect={setSelectedMed}
          excludeMedicationIds={excludeIds}
          suggestedCategories={suggestedCategories as any}
        />
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-brand-50 border border-brand-200 rounded-lg flex items-center justify-between">
            <span className="font-medium text-brand-900">
              Selected: {selectedMed.genericName}
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedMed(undefined);
                setSelectedPrep(undefined);
              }}
              className="text-brand-600 hover:text-brand-700 text-sm"
            >
              Change
            </button>
          </div>

          <PDPreparationPicker
            medication={selectedMed}
            selectedPreparation={selectedPrep}
            onSelect={setSelectedPrep}
          />

          {selectedPrep && (
            <button
              type="button"
              onClick={handleAdd}
              className="w-full py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
            >
              Add {selectedPrep.brandName} {selectedPrep.strength}
              {selectedPrep.unit}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ParkinsonsTitrationTool;
