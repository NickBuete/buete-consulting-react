import { z } from 'zod';

export const medicationCreateSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  form: z.string().optional().nullable(),
  strength: z.string().optional().nullable(),
  route: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const medicationUpdateSchema = medicationCreateSchema.partial();

export type MedicationCreateInput = z.infer<typeof medicationCreateSchema>;
export type MedicationUpdateInput = z.infer<typeof medicationUpdateSchema>;
