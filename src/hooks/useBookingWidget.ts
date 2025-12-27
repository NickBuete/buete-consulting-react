/**
 * useBookingWidget Hook
 * Extracted from InlineBookingWidget.tsx
 * Manages multi-step booking widget state and data fetching
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import type { AvailabilitySlot, BookingSettings, BusySlot } from '../types/booking';
import { buildTimeSlots, getBookingDayOfWeek } from '../utils/booking';
import {
  createDirectBooking,
  getAvailabilitySlots,
  getBookingSettings,
  getBusySlots,
} from '../services/booking';

export type BookingStep = 'date' | 'time' | 'form' | 'success';

export interface BookingFormSubmit {
  pharmacistId: number;
  appointmentDate: string;
  appointmentTime: string;
  patientFirstName: string;
  patientLastName: string;
  patientPhone: string;
  patientEmail?: string;
  referrerName: string;
  referrerEmail?: string;
  referrerPhone?: string;
  referrerClinic?: string;
  referralReason?: string;
  notes?: string;
}

export interface UseBookingWidgetOptions {
  pharmacistId: number;
  onBookingComplete?: () => void;
}

export const useBookingWidget = ({ pharmacistId, onBookingComplete }: UseBookingWidgetOptions) => {
  // Data state
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [busySlots, setBusySlots] = useState<BusySlot[]>([]);
  const [bookingSettings, setBookingSettings] = useState<BookingSettings | null>(null);

  // Selection state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<BookingStep>('date');

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Computed time slots for selected date
  const timeSlots = useMemo(
    () =>
      buildTimeSlots({
        availabilitySlots,
        busySlots,
        selectedDate,
        bookingSettings: bookingSettings ?? undefined,
      }),
    [availabilitySlots, busySlots, selectedDate, bookingSettings]
  );

  /**
   * Fetch availability data on mount
   */
  const fetchAvailability = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [availability, settings, busy] = await Promise.all([
        getAvailabilitySlots(),
        getBookingSettings(),
        getBusySlots(),
      ]);
      setAvailabilitySlots(availability);
      setBookingSettings(settings);
      setBusySlots(busy);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability, pharmacistId]);

  /**
   * Check if a date has availability
   */
  const hasAvailability = useCallback(
    (date: Date) => {
      const dayOfWeek = getBookingDayOfWeek(date);
      return availabilitySlots.some(
        (slot) => slot.dayOfWeek === dayOfWeek && slot.isAvailable
      );
    },
    [availabilitySlots]
  );

  /**
   * Handle date selection
   */
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setBookingStep('time');
  }, []);

  /**
   * Handle time slot selection
   */
  const handleTimeSelect = useCallback((time: string) => {
    setSelectedTime(time);
    setBookingStep('form');
  }, []);

  /**
   * Navigate back one step
   */
  const handleBack = useCallback(() => {
    if (bookingStep === 'form') {
      setBookingStep('time');
      setSelectedTime(null);
    } else if (bookingStep === 'time') {
      setBookingStep('date');
      setSelectedDate(null);
    }
  }, [bookingStep]);

  /**
   * Submit booking
   */
  const submitBooking = useCallback(
    async (formData: Omit<BookingFormSubmit, 'pharmacistId' | 'appointmentDate' | 'appointmentTime'>) => {
      if (!selectedDate || !selectedTime) {
        throw new Error('Date and time must be selected');
      }

      try {
        setIsSubmitting(true);
        setSubmitError(null);

        await createDirectBooking({
          pharmacistId,
          appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
          appointmentTime: selectedTime,
          ...formData,
        });

        // Success - move to success step
        setBookingStep('success');

        if (onBookingComplete) {
          onBookingComplete();
        }

        return { success: true };
      } catch (err) {
        console.error('Booking submission error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to submit booking';
        setSubmitError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsSubmitting(false);
      }
    },
    [pharmacistId, selectedDate, selectedTime, onBookingComplete]
  );

  /**
   * Reset to initial state for new booking
   */
  const resetBooking = useCallback(() => {
    setBookingStep('date');
    setSelectedDate(null);
    setSelectedTime(null);
    setSubmitError(null);
  }, []);

  return {
    // Data
    availabilitySlots,
    busySlots,
    bookingSettings,
    timeSlots,

    // Selection state
    selectedDate,
    selectedTime,
    bookingStep,

    // Loading and errors
    loading,
    error,
    isSubmitting,
    submitError,

    // Actions
    hasAvailability,
    handleDateSelect,
    handleTimeSelect,
    handleBack,
    submitBooking,
    resetBooking,
    fetchAvailability,
  };
};
