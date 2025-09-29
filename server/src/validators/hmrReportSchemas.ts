import { z } from 'zod';

export const hmrReportUpsertSchema = z.object({
  summary: z.string().trim().min(1).optional(),
  recommendations: z.string().trim().min(1).optional(),
  status: z.enum(['DRAFT', 'READY', 'SIGNED_OFF']).optional(),
});

export const hmrReportGenerateSchema = z.object({
  tone: z.enum(['FORMAL', 'CONVERSATIONAL']).optional(),
  focusAreas: z.array(z.string().trim()).max(10).optional(),
  includeSections: z
    .array(z.enum(['SUMMARY', 'RECOMMENDATIONS', 'MEDICATIONS', 'FOLLOW_UP']))
    .optional(),
});

export type HmrReportUpsertInput = z.infer<typeof hmrReportUpsertSchema>;
export type HmrReportGenerateInput = z.infer<typeof hmrReportGenerateSchema>;
