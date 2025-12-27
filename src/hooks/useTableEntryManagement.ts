/**
 * Generic hook for managing table entry CRUD operations
 * Replaces duplicated add/remove/update logic in DataEntryForm and other components
 * Based on useCrudResource.ts pattern with useState + callbacks
 * Integrates with react-hook-form's useFieldArray
 */

import { useState, useCallback } from 'react';

export interface UseTableEntryManagementReturn<T> {
  entries: T[];
  addEntry: (entry: T) => void;
  updateEntry: (index: number, entry: T) => void;
  removeEntry: (index: number) => void;
  setEntries: (entries: T[]) => void;
  clearEntries: () => void;
}

/**
 * Hook for managing an array of table entries with CRUD operations
 * @param initialEntries - Optional initial entries
 * @returns Entries array and CRUD operations
 */
export function useTableEntryManagement<T>(
  initialEntries: T[] = []
): UseTableEntryManagementReturn<T> {
  const [entries, setEntries] = useState<T[]>(initialEntries);

  const addEntry = useCallback((entry: T) => {
    setEntries((prev) => [...prev, entry]);
  }, []);

  const updateEntry = useCallback((index: number, entry: T) => {
    setEntries((prev) => {
      const updated = [...prev];
      updated[index] = entry;
      return updated;
    });
  }, []);

  const removeEntry = useCallback((index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearEntries = useCallback(() => {
    setEntries([]);
  }, []);

  return {
    entries,
    addEntry,
    updateEntry,
    removeEntry,
    setEntries,
    clearEntries,
  };
}
