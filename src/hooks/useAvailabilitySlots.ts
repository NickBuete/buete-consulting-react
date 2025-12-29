/**
 * Availability Slots Hook (Legacy API)
 * This is a wrapper around the raw API calls for backward compatibility
 * For new code, use useAvailabilitySlotsQuery from './useAvailabilitySlotsQuery.ts'
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getAvailabilitySlots,
  createAvailabilitySlot,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
} from '../services/booking';
import type { AvailabilitySlot } from '../types/booking';

export const useAvailabilitySlots = () => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSlots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAvailabilitySlots();
      setSlots(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load slots');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const createSlot = useCallback(
    async (data: Omit<AvailabilitySlot, 'id' | 'isAvailable'> & { isAvailable?: boolean }) => {
      try {
        await createAvailabilitySlot(data);
        await loadSlots();
      } catch (err) {
        throw err;
      }
    },
    [loadSlots]
  );

  const updateSlot = useCallback(
    async (id: number, data: Partial<Omit<AvailabilitySlot, 'id'>>) => {
      try {
        await updateAvailabilitySlot(id, data);
        await loadSlots();
      } catch (err) {
        throw err;
      }
    },
    [loadSlots]
  );

  const deleteSlot = useCallback(
    async (id: number) => {
      try {
        await deleteAvailabilitySlot(id);
        await loadSlots();
      } catch (err) {
        throw err;
      }
    },
    [loadSlots]
  );

  const toggleSlotAvailability = useCallback(
    async (slot: AvailabilitySlot) => {
      await updateSlot(slot.id, { isAvailable: !slot.isAvailable });
    },
    [updateSlot]
  );

  return {
    slots,
    loading,
    error,
    createSlot,
    updateSlot,
    deleteSlot,
    toggleSlotAvailability,
    refresh: loadSlots,
  };
};
