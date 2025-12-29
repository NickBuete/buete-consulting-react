import { useQuery } from '@tanstack/react-query';
import { getPublicBookingInfo } from '../services/booking';

/**
 * Hook to fetch public booking info with automatic caching
 * Reduces API calls by caching for 5 minutes
 */
export const useBookingInfo = (bookingUrl: string) => {
  return useQuery({
    queryKey: ['bookingInfo', bookingUrl],
    queryFn: () => getPublicBookingInfo(bookingUrl),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!bookingUrl, // Only fetch if bookingUrl exists
  });
};
