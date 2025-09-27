import { z } from 'zod';

export const clinicCreateSchema = z.object({
  name: z.string().min(1, 'Clinic name is required'),
  contactEmail: z.string().email().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  addressLine1: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  suburb: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postcode: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const clinicUpdateSchema = clinicCreateSchema.partial();

export type ClinicCreateInput = z.infer<typeof clinicCreateSchema>;
export type ClinicUpdateInput = z.infer<typeof clinicUpdateSchema>;
