/**
 * Medical History Table Component
 * Extracted from DataEntryForm.tsx
 * Self-contained table for managing medical history entries
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '../ui';
import { Plus, Trash2 } from 'lucide-react';

export interface MedicalHistoryEntry {
  year: string;
  condition: string;
  notes: string;
}

interface MedicalHistoryTableProps {
  initialData?: MedicalHistoryEntry[];
  onChange?: (entries: MedicalHistoryEntry[]) => void;
}

export const MedicalHistoryTable: React.FC<MedicalHistoryTableProps> = ({
  initialData = [],
  onChange,
}) => {
  const [entries, setEntries] = React.useState<MedicalHistoryEntry[]>(initialData);

  const handleChange = (newEntries: MedicalHistoryEntry[]) => {
    setEntries(newEntries);
    onChange?.(newEntries);
  };

  const addEntry = () => {
    handleChange([...entries, { year: '', condition: '', notes: '' }]);
  };

  const removeEntry = (index: number) => {
    handleChange(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof MedicalHistoryEntry, value: string) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    handleChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Past Medical History</span>
          <Button type="button" variant="outline" size="sm" onClick={addEntry}>
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No medical history entries yet.</p>
              <p className="text-sm">Click "Add Entry" to begin.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Year
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Condition
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {entries.map((entry, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2">
                        <Input
                          type="text"
                          value={entry.year}
                          onChange={(e) => updateEntry(index, 'year', e.target.value)}
                          placeholder="2023"
                          className="w-full"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          type="text"
                          value={entry.condition}
                          onChange={(e) => updateEntry(index, 'condition', e.target.value)}
                          placeholder="e.g., Type 2 Diabetes, Hypertension"
                          className="w-full"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          type="text"
                          value={entry.notes}
                          onChange={(e) => updateEntry(index, 'notes', e.target.value)}
                          placeholder="Additional notes"
                          className="w-full"
                        />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEntry(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
