import { z } from 'zod';

import { clinicCreateSchema } from './clinicSchemas';

const prescriberBaseSchema = z.object({
  honorific: z.string().optional().nullable(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  providerNumber: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  clinicId: z.number().int().positive().optional(),
  clinic: clinicCreateSchema.optional(),
  notes: z.string().optional().nullable(),
});

export const prescriberCreateSchema = prescriberBaseSchema;

export const prescriberUpdateSchema = prescriberBaseSchema.partial().extend({
  clinicId: z.number().int().positive().nullable().optional(),
  clinic: clinicCreateSchema.optional().nullable().optional(),
});

export type PrescriberCreateInput = z.infer<typeof prescriberCreateSchema>;
export type PrescriberUpdateInput = z.infer<typeof prescriberUpdateSchema>;
