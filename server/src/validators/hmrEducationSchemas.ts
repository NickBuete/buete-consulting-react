import { z } from 'zod';

export const hmrEducationCreateSchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(200),
  advice: z.string().min(1, 'Advice is required'),
});

export const hmrEducationUpdateSchema = hmrEducationCreateSchema.partial();

export type HmrEducationCreateInput = z.infer<typeof hmrEducationCreateSchema>;
export type HmrEducationUpdateInput = z.infer<typeof hmrEducationUpdateSchema>;
