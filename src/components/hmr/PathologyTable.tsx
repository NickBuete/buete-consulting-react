/**
 * Pathology Results Table Component
 * Extracted from DataEntryForm.tsx
 * Self-contained table for managing pathology test results
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '../ui';
import { Plus, Trash2 } from 'lucide-react';

export interface PathologyEntry {
  date: string;
  test: string;
  result: string;
  notes: string;
}

interface PathologyTableProps {
  initialData?: PathologyEntry[];
  onChange?: (entries: PathologyEntry[]) => void;
}

export const PathologyTable: React.FC<PathologyTableProps> = ({
  initialData = [],
  onChange,
}) => {
  const [entries, setEntries] = React.useState<PathologyEntry[]>(initialData);

  const handleChange = (newEntries: PathologyEntry[]) => {
    setEntries(newEntries);
    onChange?.(newEntries);
  };

  const addEntry = () => {
    handleChange([...entries, { date: '', test: '', result: '', notes: '' }]);
  };

  const removeEntry = (index: number) => {
    handleChange(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof PathologyEntry, value: string) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    handleChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Pathology Results</span>
          <Button type="button" variant="outline" size="sm" onClick={addEntry}>
            <Plus className="w-4 h-4 mr-2" />
            Add Result
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No pathology results recorded yet.</p>
              <p className="text-sm">Click "Add Result" to begin.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Result
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
                          type="date"
                          value={entry.date}
                          onChange={(e) => updateEntry(index, 'date', e.target.value)}
                          className="w-full"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          type="text"
                          value={entry.test}
                          onChange={(e) => updateEntry(index, 'test', e.target.value)}
                          placeholder="e.g., HbA1c, Lipid Panel"
                          className="w-full"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          type="text"
                          value={entry.result}
                          onChange={(e) => updateEntry(index, 'result', e.target.value)}
                          placeholder="e.g., 7.2%, 5.5 mmol/L"
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
