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
import { formatDate, getMedicationColor } from '../../utils/doseCalculation';
import type { MedicationSchedule } from '../../types/doseCalculator';

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

  const getTitrationLabel = (med: MedicationSchedule): string => {
    if (med.titrationDirection === 'maintain') {
      return 'Maintain dose';
    }
    const direction = med.titrationDirection === 'increase' ? '↑' : '↓';
    return `${direction} ${med.changeAmount}${med.unit} every ${med.intervalDays} day${med.intervalDays > 1 ? 's' : ''}`;
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
                Add and manage medication titration schedules
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
                      <div className="flex items-center gap-3">
                        <h3 className="font-heading text-lg font-semibold">
                          {med.medicationName}
                        </h3>
                        <Badge variant="outline" className="font-body">
                          {med.strength}{med.unit}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm font-body">
                        <div>
                          <span className="text-gray-600">Starting dose:</span>{' '}
                          <span className="font-semibold">{med.startingDose}{med.unit}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Titration:</span>{' '}
                          <span className="font-semibold">{getTitrationLabel(med)}</span>
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
                        {med.minimumDose !== undefined && (
                          <div>
                            <span className="text-gray-600">Min dose:</span>{' '}
                            <span className="font-semibold">{med.minimumDose}{med.unit}</span>
                          </div>
                        )}
                        {med.maximumDose !== undefined && (
                          <div>
                            <span className="text-gray-600">Max dose:</span>{' '}
                            <span className="font-semibold">{med.maximumDose}{med.unit}</span>
                          </div>
                        )}
                      </div>
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
