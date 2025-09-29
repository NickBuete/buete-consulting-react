export interface HmrReport {
  id: number;
  reviewId: number;
  ownerId: number;
  status: 'DRAFT' | 'READY' | 'SIGNED_OFF';
  summary: string | null;
  recommendations: string | null;
  createdAt: string;
  updatedAt: string;
  generatedBy: string | null;
}

export interface HmrReportAuditEntry {
  id: number;
  reportId: number;
  model: string;
  prompt: string;
  completion: string;
  createdAt: string;
}

export interface GenerateHmrReportPayload {
  tone?: 'FORMAL' | 'CONVERSATIONAL';
  focusAreas?: string[];
  includeSections?: Array<'SUMMARY' | 'RECOMMENDATIONS' | 'MEDICATIONS' | 'FOLLOW_UP'>;
}

export interface GenerateHmrReportResponse {
  report: HmrReport;
}
