import { z } from 'zod';

export const clientCreateSchema = z.object({
  name: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(5).max(30).optional(),
  businessDetails: z.string().optional(),
});

export const clientUpdateSchema = clientCreateSchema.partial();

export type ClientCreateInput = z.infer<typeof clientCreateSchema>;
export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>;
