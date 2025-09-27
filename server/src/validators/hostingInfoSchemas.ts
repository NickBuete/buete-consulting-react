import { z } from 'zod';

export const hostingInfoCreateSchema = z.object({
  domain: z.string().min(3),
  provider: z.string().min(1),
  credentials: z.string().min(1),
  notes: z.string().optional(),
});

export const hostingInfoUpdateSchema = hostingInfoCreateSchema.partial();

export type HostingInfoCreateInput = z.infer<typeof hostingInfoCreateSchema>;
export type HostingInfoUpdateInput = z.infer<typeof hostingInfoUpdateSchema>;
