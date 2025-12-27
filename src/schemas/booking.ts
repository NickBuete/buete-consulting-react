import { z } from 'zod';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const optionalEmail = z
  .string()
  .optional()
  .refine((value) => !value || emailRegex.test(value), {
    message: 'Valid email is required',
  });

export const patientSchema = z.object({
  patientFirstName: z.string().min(1, 'First name is required'),
  patientLastName: z.string().min(1, 'Last name is required'),
  patientPhone: z.string().min(10, 'Valid phone number is required'),
  patientEmail: optionalEmail,
});

export const referrerSchema = z.object({
  referrerName: z.string().min(1, 'Referrer name is required'),
  referrerEmail: optionalEmail,
  referrerPhone: z.string().optional(),
  referrerClinic: z.string().optional(),
});

export const publicBookingSchema = patientSchema.merge(referrerSchema).extend({
  patientDateOfBirth: z.string().optional(),
  patientAddressLine1: z.string().optional(),
  patientSuburb: z.string().optional(),
  patientState: z.string().optional(),
  patientPostcode: z.string().optional(),
  appointmentDate: z.string().min(1, 'Please select a date'),
  appointmentTime: z.string().min(1, 'Please select a time'),
  referralReason: z.string().optional(),
  notes: z.string().optional(),
});

export const inlineBookingSchema = patientSchema.merge(referrerSchema).extend({
  referralReason: z.string().optional(),
  notes: z.string().optional(),
});
