import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAvailabilitySlots,
  createAvailabilitySlot,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
} from '../services/booking';
import type { AvailabilitySlot } from '../types/booking';

/**
 * Hook to fetch availability slots with caching
 */
export const useAvailabilitySlotsQuery = () => {
  return useQuery({
    queryKey: ['availabilitySlots'],
    queryFn: getAvailabilitySlots,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
  });
};

/**
 * Hook to create availability slot
 */
export const useCreateAvailabilitySlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<AvailabilitySlot, 'id' | 'isAvailable'> & { isAvailable?: boolean }) =>
      createAvailabilitySlot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availabilitySlots'] });
    },
  });
};

/**
 * Hook to update availability slot
 */
export const useUpdateAvailabilitySlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<AvailabilitySlot, 'id'>> }) =>
      updateAvailabilitySlot(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availabilitySlots'] });
    },
  });
};

/**
 * Hook to delete availability slot
 */
export const useDeleteAvailabilitySlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteAvailabilitySlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availabilitySlots'] });
    },
  });
};
