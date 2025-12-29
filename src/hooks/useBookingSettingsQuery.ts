import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBookingSettings, updateBookingSettings, type BookingSettingsUpdate } from '../services/booking';

/**
 * Hook to fetch booking settings with caching
 */
export const useBookingSettings = () => {
  return useQuery({
    queryKey: ['bookingSettings'],
    queryFn: getBookingSettings,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to update booking settings with automatic cache invalidation
 */
export const useUpdateBookingSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BookingSettingsUpdate) => updateBookingSettings(data),
    onSuccess: () => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: ['bookingSettings'] });
    },
  });
};
