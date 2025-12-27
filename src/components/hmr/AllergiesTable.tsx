/**
 * Allergies Table Component
 * Extracted from DataEntryForm.tsx
 * Self-contained table for managing allergy entries
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '../ui';
import { Plus, Trash2 } from 'lucide-react';

export interface AllergyEntry {
  allergen: string;
  reaction: string;
  severity: string;
}

interface AllergiesTableProps {
  initialData?: AllergyEntry[];
  onChange?: (entries: AllergyEntry[]) => void;
}

export const AllergiesTable: React.FC<AllergiesTableProps> = ({
  initialData = [],
  onChange,
}) => {
  const [entries, setEntries] = React.useState<AllergyEntry[]>(initialData);

  const handleChange = (newEntries: AllergyEntry[]) => {
    setEntries(newEntries);
    onChange?.(newEntries);
  };

  const addEntry = () => {
    handleChange([...entries, { allergen: '', reaction: '', severity: '' }]);
  };

  const removeEntry = (index: number) => {
    handleChange(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof AllergyEntry, value: string) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    handleChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Allergies</span>
          <Button type="button" variant="outline" size="sm" onClick={addEntry}>
            <Plus className="w-4 h-4 mr-2" />
            Add Allergy
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No allergies recorded yet.</p>
              <p className="text-sm">Click "Add Allergy" to begin.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Allergen
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reaction
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Severity
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
                          value={entry.allergen}
                          onChange={(e) => updateEntry(index, 'allergen', e.target.value)}
                          placeholder="e.g., Penicillin, Peanuts"
                          className="w-full"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          type="text"
                          value={entry.reaction}
                          onChange={(e) => updateEntry(index, 'reaction', e.target.value)}
                          placeholder="e.g., Rash, Anaphylaxis"
                          className="w-full"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={entry.severity}
                          onChange={(e) => updateEntry(index, 'severity', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                        >
                          <option value="">Select...</option>
                          <option value="Mild">Mild</option>
                          <option value="Moderate">Moderate</option>
                          <option value="Severe">Severe</option>
                        </select>
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
