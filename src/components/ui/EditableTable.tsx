/**
 * Reusable editable table component for dynamic field arrays
 * Integrates with useTableEntryManagement hook
 * Used for medications, allergies, medical history, pathology tables
 */

import React from 'react';
import { Button } from './Button';
import { Table } from './Table';

export interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

export interface EditableTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onAdd?: () => void;
  onEdit?: (index: number, row: T) => void;
  onDelete?: (index: number) => void;
  addButtonText?: string;
  emptyMessage?: string;
  showActions?: boolean;
}

export function EditableTable<T>({
  columns,
  data,
  onAdd,
  onEdit,
  onDelete,
  addButtonText = 'Add Entry',
  emptyMessage = 'No entries yet',
  showActions = true,
}: EditableTableProps<T>) {
  const headers = columns.map((col) => col.header);
  if (showActions) {
    headers.push('Actions');
  }

  const getCellValue = (row: T, column: TableColumn<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    return row[column.accessor];
  };

  return (
    <div className="space-y-4">
      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">{emptyMessage}</div>
      ) : (
        <Table headers={headers}>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map((column, colIndex) => {
                const value = getCellValue(row, column);
                return (
                  <td key={colIndex} className="px-6 py-4 text-sm text-gray-900">
                    {column.render ? column.render(value, row, rowIndex) : String(value ?? '')}
                  </td>
                );
              })}
              {showActions && (
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(rowIndex, row)}
                      >
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(rowIndex)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </Table>
      )}

      {onAdd && (
        <Button onClick={onAdd} type="button">
          {addButtonText}
        </Button>
      )}
    </div>
  );
}
