import { api } from './api';
import type {
  AvailabilitySlot,
  BusySlot,
  PublicBookingInfo,
  PublicBookingSettings,
} from '../types/booking';
import { inlineBookingSchema, publicBookingSchema } from '../schemas/booking';
import type { z } from 'zod';

export type PublicBookingPayload = z.infer<typeof publicBookingSchema>;
export type InlineBookingPayload = z.infer<typeof inlineBookingSchema>;

export interface DirectBookingPayload extends InlineBookingPayload {
  pharmacistId: number;
  appointmentDate: string;
  appointmentTime: string;
}

export interface PublicBookingResponse {
  success: boolean;
  bookingId: number;
  pharmacistName: string;
  appointmentDateTime: string;
  requiresApproval: boolean;
  message: string;
}

export interface DirectBookingResponse {
  success: boolean;
  bookingId: number;
  appointmentDateTime: string;
  requiresApproval: boolean;
  message: string;
}

export interface BookingSettingsResponse extends PublicBookingSettings {
  id?: number;
  userId?: number;
  confirmationEmailText?: string | null;
  reminderEmailText?: string | null;
}

export type BookingSettingsUpdate = Partial<{
  bookingUrl: string;
  bufferTimeBefore: number;
  bufferTimeAfter: number;
  defaultDuration: number;
  allowPublicBooking: boolean;
  requireApproval: boolean;
}>;

export interface RescheduleInfo {
  bookingId: number;
  patient: {
    firstName: string;
    lastName: string;
  };
  pharmacist: {
    name: string;
  };
  currentAppointment: {
    date: string;
    time: string;
  };
  referredBy?: string | null;
}

export interface ReschedulePayload {
  appointmentDate: string;
  appointmentTime: string;
}

export interface RescheduleResponse {
  success: boolean;
  message: string;
  newAppointmentDateTime: string;
}

export const getPublicBookingInfo = async (bookingUrl: string) => {
  const response = await api.get<PublicBookingInfo>(`/booking/public/${bookingUrl}`);
  return response;
};

export const createPublicBooking = async (
  bookingUrl: string,
  payload: PublicBookingPayload,
  referralDocument?: File | null
) => {
  // If there's a file, use FormData
  if (referralDocument) {
    const formData = new FormData();

    // Add all form fields
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    // Add the file
    formData.append('referralDocument', referralDocument);

    // Use uploadFormData method which handles FormData
    const response = await api.uploadFormData<PublicBookingResponse>(
      `/booking/public/${bookingUrl}`,
      formData
    );
    return response;
  }

  // No file, use regular JSON request
  const response = await api.post<PublicBookingResponse>(`/booking/public/${bookingUrl}`, payload);
  return response;
};

export const getAvailabilitySlots = async () => {
  const response = await api.get<AvailabilitySlot[]>('/booking/availability');
  return response;
};

export const createAvailabilitySlot = async (
  payload: Omit<AvailabilitySlot, 'id' | 'isAvailable'> & { isAvailable?: boolean }
) => {
  const response = await api.post<AvailabilitySlot>('/booking/availability', payload);
  return response;
};

export const updateAvailabilitySlot = async (
  id: number,
  payload: Partial<Omit<AvailabilitySlot, 'id'>>
) => {
  const response = await api.patch<AvailabilitySlot>(`/booking/availability/${id}`, payload);
  return response;
};

export const deleteAvailabilitySlot = async (id: number) => {
  await api.delete<void>(`/booking/availability/${id}`);
};

export const getBookingSettings = async () => {
  const response = await api.get<BookingSettingsResponse>('/booking/settings');
  return response;
};

export const updateBookingSettings = async (payload: BookingSettingsUpdate) => {
  const response = await api.patch<BookingSettingsResponse>('/booking/settings', payload);
  return response;
};

export const checkBookingUrlAvailability = async (url: string) => {
  const response = await api.get<{ available: boolean }>(
    `/booking/check-url?url=${encodeURIComponent(url)}`
  );
  return response;
};

export const getBusySlots = async () => {
  const response = await api.get<BusySlot[]>('/booking/busy');
  return response;
};

export const createDirectBooking = async (payload: DirectBookingPayload) => {
  const response = await api.post<DirectBookingResponse>('/booking/direct', payload);
  return response;
};

export const getRescheduleInfo = async (token: string) => {
  const response = await api.get<RescheduleInfo>(`/booking/reschedule/${token}`);
  return response;
};

export const rescheduleBooking = async (token: string, payload: ReschedulePayload) => {
  const response = await api.post<RescheduleResponse>(`/booking/reschedule/${token}`, payload);
  return response;
};
