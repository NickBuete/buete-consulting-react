/**
 * useAvailabilitySlots Hook
 * Data fetching and management for availability slots
 */

import { useState, useEffect, useCallback } from 'react';
import type { AvailabilitySlot } from '../types/booking';
import {
  createAvailabilitySlot,
  deleteAvailabilitySlot,
  getAvailabilitySlots,
  updateAvailabilitySlot,
} from '../services/booking';

interface SlotFormData {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable?: boolean;
}

export const useAvailabilitySlots = () => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAvailabilitySlots();
      setSlots(data);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const createSlot = useCallback(
    async (data: SlotFormData) => {
      try {
        setError(null);
        await createAvailabilitySlot(data);
        await fetchSlots();
      } catch (err) {
        console.error('Error creating slot:', err);
        const message = err instanceof Error ? err.message : 'Failed to create slot';
        setError(message);
        throw err;
      }
    },
    [fetchSlots]
  );

  const updateSlot = useCallback(
    async (slotId: number, data: Partial<SlotFormData>) => {
      try {
        setError(null);
        await updateAvailabilitySlot(slotId, data);
        await fetchSlots();
      } catch (err) {
        console.error('Error updating slot:', err);
        const message = err instanceof Error ? err.message : 'Failed to update slot';
        setError(message);
        throw err;
      }
    },
    [fetchSlots]
  );

  const deleteSlot = useCallback(
    async (slotId: number) => {
      try {
        setError(null);
        await deleteAvailabilitySlot(slotId);
        await fetchSlots();
      } catch (err) {
        console.error('Error deleting slot:', err);
        const message = err instanceof Error ? err.message : 'Failed to delete slot';
        setError(message);
        throw err;
      }
    },
    [fetchSlots]
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
    refetch: fetchSlots,
  };
};
