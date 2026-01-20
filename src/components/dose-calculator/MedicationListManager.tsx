import React, { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from '../ui';
import { MedicationFormDialog } from './MedicationFormDialog';
import { formatDate, getMedicationColor, getScheduleTypeLabel, getScheduleDescription } from '../../utils/doseCalculation';
import type { MedicationSchedule, DoseTimeValue } from '../../types/doseCalculator';
import { DOSE_TIME_SHORT_LABELS } from '../../types/doseCalculator';

interface MedicationListManagerProps {
  medications: MedicationSchedule[];
  onAdd: (medication: MedicationSchedule) => void;
  onEdit: (medication: MedicationSchedule) => void;
  onDelete: (medicationId: string) => void;
}

export const MedicationListManager: React.FC<MedicationListManagerProps> = ({
  medications,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<MedicationSchedule | undefined>();

  const handleAddClick = () => {
    setEditingMedication(undefined);
    setDialogOpen(true);
  };

  const handleEditClick = (medication: MedicationSchedule) => {
    setEditingMedication(medication);
    setDialogOpen(true);
  };

  const handleSave = (medication: MedicationSchedule) => {
    if (editingMedication) {
      onEdit(medication);
    } else {
      onAdd(medication);
    }
  };

  const getPreparationLabel = (med: MedicationSchedule): string | null => {
    if (med.preparationMode === 'none') return null;

    if (med.preparationMode === 'specify' && med.preparations && med.preparations.length > 0) {
      return `Using: ${med.preparations.map(p => `${p.strength}${p.unit}`).join(', ')}`;
    }

    if (med.preparationMode === 'optimise' && med.optimisedPreparations && med.optimisedPreparations.length > 0) {
      return `Optimised: ${med.optimisedPreparations.map(p => `${p.strength}${p.unit}`).join(', ')}`;
    }

    return null;
  };

  // Format dose times values for display
  const formatDoseTimesDisplay = (doseTimes: DoseTimeValue[], unit: string): string => {
    return doseTimes
      .map(dt => `${DOSE_TIME_SHORT_LABELS[dt.time]}:${dt.dose}${unit}`)
      .join(' ');
  };

  // Get dosing frequency label
  const getDosingFrequencyLabel = (med: MedicationSchedule): string | null => {
    // Check for dose times mode in the relevant config
    let doseTimesMode: string | undefined;
    let enabledTimes: string[] | undefined;

    switch (med.scheduleType) {
      case 'linear':
        doseTimesMode = med.linearConfig?.doseTimesMode;
        enabledTimes = med.linearConfig?.enabledDoseTimes;
        break;
      case 'cyclic':
        doseTimesMode = med.cyclicConfig?.doseTimesMode;
        enabledTimes = med.cyclicConfig?.doseTimes?.map(dt => dt.time);
        break;
      case 'multiPhase':
        doseTimesMode = med.multiPhaseConfig?.doseTimesMode;
        enabledTimes = med.multiPhaseConfig?.enabledDoseTimes;
        break;
    }

    if (doseTimesMode !== 'multiple' || !enabledTimes || enabledTimes.length <= 1) {
      return null;
    }

    // Return frequency based on number of times
    const count = enabledTimes.length;
    let label = count === 2 ? 'BD' : count === 3 ? 'TDS' : count === 4 ? 'QID' : `${count}x daily`;

    // Add titration mode indicator for linear schedules with sequential mode
    if (med.scheduleType === 'linear' && med.linearConfig?.titrationMode === 'sequential') {
      label += ' (seq)';
    }

    return label;
  };

  const getStartingDoseLabel = (med: MedicationSchedule): string | null => {
    switch (med.scheduleType) {
      case 'linear':
        if (med.linearConfig) {
          // Check if multiple dose times mode
          if (med.linearConfig.doseTimesMode === 'multiple' && med.linearConfig.startingDoseTimes && med.linearConfig.startingDoseTimes.length > 0) {
            return formatDoseTimesDisplay(med.linearConfig.startingDoseTimes, med.unit);
          }
          return `${med.linearConfig.startingDose}${med.unit}`;
        }
        break;
      case 'cyclic':
        if (med.cyclicConfig) {
          // Check if multiple dose times mode
          if (med.cyclicConfig.doseTimesMode === 'multiple' && med.cyclicConfig.doseTimes && med.cyclicConfig.doseTimes.length > 0) {
            return formatDoseTimesDisplay(med.cyclicConfig.doseTimes, med.unit);
          }
          return `${med.cyclicConfig.dose}${med.unit}`;
        }
        break;
      case 'dayOfWeek':
        if (med.dayOfWeekConfig) {
          const doses = [
            med.dayOfWeekConfig.monday,
            med.dayOfWeekConfig.tuesday,
            med.dayOfWeekConfig.wednesday,
            med.dayOfWeekConfig.thursday,
            med.dayOfWeekConfig.friday,
            med.dayOfWeekConfig.saturday,
            med.dayOfWeekConfig.sunday,
          ].filter((d): d is number => d !== undefined && d > 0);
          if (doses.length > 0) {
            const unique = Array.from(new Set(doses));
            return unique.length === 1 ? `${unique[0]}${med.unit}` : `${Math.min(...unique)}-${Math.max(...unique)}${med.unit}`;
          }
        }
        break;
      case 'multiPhase':
        if (med.multiPhaseConfig && med.multiPhaseConfig.phases.length > 0) {
          const firstPhase = med.multiPhaseConfig.phases[0];
          // Check if phase has multiple dose times
          if (firstPhase.doseTimes && firstPhase.doseTimes.length > 0) {
            return formatDoseTimesDisplay(firstPhase.doseTimes, med.unit);
          }
          return `${firstPhase.dose}${med.unit}`;
        }
        break;
    }
    return null;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-heading flex items-center gap-3">
                <span className="text-2xl">💊</span>
                Medications
              </CardTitle>
              <CardDescription className="font-body">
                Add and manage medication dosing schedules
              </CardDescription>
            </div>
            <Button onClick={handleAddClick} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Medication
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {medications.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-4xl mb-4">💊</div>
              <p className="text-gray-600 font-body mb-4">
                No medications added yet
              </p>
              <Button onClick={handleAddClick} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Medication
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {medications.map((med, index) => (
                <div
                  key={med.id}
                  className={`p-4 rounded-lg border-2 ${getMedicationColor(index)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-heading text-lg font-semibold">
                          {med.medicationName}
                        </h3>
                        <Badge variant="outline" className="font-body">
                          {getScheduleTypeLabel(med.scheduleType)}
                        </Badge>
                        {getDosingFrequencyLabel(med) && (
                          <Badge variant="secondary" className="font-body">
                            {getDosingFrequencyLabel(med)}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm font-body">
                        {getStartingDoseLabel(med) && (
                          <div>
                            <span className="text-gray-600">
                              {med.scheduleType === 'multiPhase' ? 'Starting dose:' : 'Dose:'}
                            </span>{' '}
                            <span className="font-semibold">{getStartingDoseLabel(med)}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600">Schedule:</span>{' '}
                          <span className="font-semibold">{getScheduleDescription(med)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Start date:</span>{' '}
                          <span className="font-semibold">{formatDate(med.startDate)}</span>
                        </div>
                        {med.endDate && (
                          <div>
                            <span className="text-gray-600">End date:</span>{' '}
                            <span className="font-semibold">{formatDate(med.endDate)}</span>
                          </div>
                        )}
                        {med.scheduleType === 'linear' && med.linearConfig?.minimumDose !== undefined && (
                          <div>
                            <span className="text-gray-600">Min dose:</span>{' '}
                            <span className="font-semibold">{med.linearConfig.minimumDose}{med.unit}</span>
                          </div>
                        )}
                        {med.scheduleType === 'linear' && med.linearConfig?.maximumDose !== undefined && (
                          <div>
                            <span className="text-gray-600">Max dose:</span>{' '}
                            <span className="font-semibold">{med.linearConfig.maximumDose}{med.unit}</span>
                          </div>
                        )}
                        {med.scheduleType === 'multiPhase' && med.multiPhaseConfig && (
                          <div>
                            <span className="text-gray-600">Phases:</span>{' '}
                            <span className="font-semibold">{med.multiPhaseConfig.phases.length}</span>
                          </div>
                        )}
                      </div>

                      {getPreparationLabel(med) && (
                        <div className="text-sm font-body mt-2 text-gray-700">
                          <span className="text-gray-600">Preparations:</span>{' '}
                          <span className="font-semibold">{getPreparationLabel(med)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(med)}
                        className="gap-2"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(med.id)}
                        className="gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <MedicationFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        medication={editingMedication}
        onSave={handleSave}
      />
    </>
  );
};
