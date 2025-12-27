import { z } from 'zod';

export const availabilitySlotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/),
  isAvailable: z.boolean().optional(),
});

export const bookingSettingsSchema = z.object({
  bufferTimeBefore: z.number().min(0).max(120).optional(),
  bufferTimeAfter: z.number().min(0).max(120).optional(),
  defaultDuration: z.number().min(15).max(240).optional(),
  allowPublicBooking: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
  bookingUrl: z.string().min(3).max(100).optional(),
  confirmationEmailText: z.string().optional(),
  reminderEmailText: z.string().optional(),
});

export const publicBookingSchema = z.object({
  patientFirstName: z.string().min(1),
  patientLastName: z.string().min(1),
  patientPhone: z.string().min(10),
  patientEmail: z.string().email().optional(),
  referrerName: z.string().min(1),
  referrerEmail: z.string().email().optional(),
  referrerPhone: z.string().optional(),
  referrerClinic: z.string().optional(),
  referralReason: z.string().optional(),
  appointmentDate: z.string(), // ISO date
  appointmentTime: z.string().regex(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/),
  notes: z.string().optional(),
});

export const directBookingSchema = z.object({
  pharmacistId: z.number(),
  patientFirstName: z.string().min(1),
  patientLastName: z.string().min(1),
  patientPhone: z.string().min(10),
  patientEmail: z.string().email().optional(),
  referrerName: z.string().min(1),
  referrerEmail: z.string().email().optional(),
  referrerPhone: z.string().optional(),
  referrerClinic: z.string().optional(),
  referralReason: z.string().optional(),
  appointmentDate: z.string(), // ISO date
  appointmentTime: z.string().regex(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/),
  notes: z.string().optional(),
});

export const rescheduleSchema = z.object({
  appointmentDate: z.string(), // ISO date
  appointmentTime: z.string().regex(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/),
});
