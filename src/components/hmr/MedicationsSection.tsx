/**
 * Medications Section Component
 * Extracted from DataEntryForm.tsx
 * Self-contained section for managing current medications with autocomplete
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '../ui';
import { Plus, Trash2 } from 'lucide-react';
import { MedicationAutocomplete } from './MedicationAutocomplete';
import { addToKnowledgeBase } from '../../services/medicationKnowledgeBase';

export interface MedicationEntry {
  name: string;
  dose: string;
  frequency: string;
  indication: string;
  notes: string;
}

interface MedicationsSectionProps {
  initialData?: MedicationEntry[];
  onChange?: (medications: MedicationEntry[]) => void;
}

export const MedicationsSection: React.FC<MedicationsSectionProps> = ({
  initialData = [],
  onChange,
}) => {
  const [medications, setMedications] = React.useState<MedicationEntry[]>(initialData);

  const handleChange = (newMedications: MedicationEntry[]) => {
    setMedications(newMedications);
    onChange?.(newMedications);
  };

  const addMedication = () => {
    handleChange([
      ...medications,
      { name: '', dose: '', frequency: '', indication: '', notes: '' },
    ]);
  };

  const removeMedication = (index: number) => {
    handleChange(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (
    index: number,
    field: keyof MedicationEntry,
    value: string
  ) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    handleChange(updated);
  };

  const handleMedicationSelect = (
    index: number,
    selected: {
      name: string;
      genericName?: string;
      form?: string;
      strength?: string;
      route?: string;
      indication?: string;
    }
  ) => {
    const updated = [...medications];
    updated[index] = {
      ...updated[index],
      name: selected.name,
      dose: selected.strength || updated[index].dose,
      indication: selected.indication || updated[index].indication,
    };
    handleChange(updated);

    // Add to knowledge base for future autocomplete
    addToKnowledgeBase({
      name: selected.name,
      genericName: selected.genericName,
      form: selected.form,
      strength: selected.strength,
      route: selected.route,
      indication: selected.indication,
    }).catch((err) => console.error('Failed to add to knowledge base:', err));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Current Medications</span>
          <Button type="button" variant="outline" size="sm" onClick={addMedication}>
            <Plus className="w-4 h-4 mr-2" />
            Add Medication
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {medications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No medications added yet.</p>
              <p className="text-sm">
                Click "Add Medication" to begin recording current medications.
              </p>
            </div>
          ) : (
            medications.map((med, index) => (
              <Card key={index} className="border-gray-200">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-gray-900">
                      Medication #{index + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedication(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        Medication Name *
                      </label>
                      <div className="mt-1">
                        <MedicationAutocomplete
                          value={med.name}
                          onSelect={(selected) =>
                            handleMedicationSelect(index, selected)
                          }
                          onChange={(value) =>
                            updateMedication(index, 'name', value)
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Dose/Strength
                      </label>
                      <Input
                        type="text"
                        value={med.dose}
                        onChange={(e) =>
                          updateMedication(index, 'dose', e.target.value)
                        }
                        placeholder="e.g., 500mg, 10mg/mL"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Frequency
                      </label>
                      <Input
                        type="text"
                        value={med.frequency}
                        onChange={(e) =>
                          updateMedication(index, 'frequency', e.target.value)
                        }
                        placeholder="e.g., BD, TDS, PRN"
                        className="mt-1"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        Indication
                      </label>
                      <Input
                        type="text"
                        value={med.indication}
                        onChange={(e) =>
                          updateMedication(index, 'indication', e.target.value)
                        }
                        placeholder="e.g., Hypertension, Pain relief"
                        className="mt-1"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        Notes
                      </label>
                      <Input
                        type="text"
                        value={med.notes}
                        onChange={(e) =>
                          updateMedication(index, 'notes', e.target.value)
                        }
                        placeholder="Additional notes"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
