import { z } from 'zod';

export const hmrRecommendationCreateSchema = z.object({
  assessment: z.string().min(1, 'Assessment is required'),
  plan: z.string().min(1, 'Plan is required'),
});

export const hmrRecommendationUpdateSchema = hmrRecommendationCreateSchema.partial();

export type HmrRecommendationCreateInput = z.infer<typeof hmrRecommendationCreateSchema>;
export type HmrRecommendationUpdateInput = z.infer<typeof hmrRecommendationUpdateSchema>;
