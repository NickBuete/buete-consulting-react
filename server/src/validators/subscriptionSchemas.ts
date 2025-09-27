import { z } from 'zod';

const dateSchema = z.coerce.date();

export const subscriptionCreateSchema = z.object({
  plan: z.string().min(1),
  status: z.string().min(1),
  startDate: dateSchema,
  endDate: dateSchema.optional(),
  renewalInfo: z.string().optional(),
});

export const subscriptionUpdateSchema = subscriptionCreateSchema.partial();

export type SubscriptionCreateInput = z.infer<typeof subscriptionCreateSchema>;
export type SubscriptionUpdateInput = z.infer<typeof subscriptionUpdateSchema>;
