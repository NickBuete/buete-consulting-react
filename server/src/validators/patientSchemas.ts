import { z } from 'zod';

import { LivingArrangement } from '../generated/prisma';

const livingArrangementEnum = z.nativeEnum(LivingArrangement);

const dateSchema = z.coerce.date();

export const patientCreateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  preferredName: z.string().optional().nullable(),
  clientId: z.number().int().positive().optional(),
  dateOfBirth: dateSchema.optional(),
  contactEmail: z.string().email().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  addressLine1: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  suburb: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postcode: z.string().optional().nullable(),
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),
  medicareNumber: z.string().optional().nullable(),
  livesAlone: z.boolean().optional(),
  livingArrangement: livingArrangementEnum.optional(),
  usesWebster: z.boolean().optional(),
  otherSupports: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const patientUpdateSchema = patientCreateSchema.partial();

export type PatientCreateInput = z.infer<typeof patientCreateSchema>;
export type PatientUpdateInput = z.infer<typeof patientUpdateSchema>;
