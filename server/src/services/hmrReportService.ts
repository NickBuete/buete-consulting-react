import { Prisma, HmrReportStatus } from '../generated/prisma';
import { withTenantContext } from '../db/tenant';
import type { HmrReportGenerateInput, HmrReportUpsertInput } from '../validators/hmrReportSchemas';
import { buildReportPrompt } from './hmrReportPromptBuilder';
import { invokeClaude } from './ai/claudeClient';

export const getReportForReview = async (ownerId: number, reviewId: number) => {
  return withTenantContext(ownerId, (tx) =>
    tx.hmrReport.findFirst({
      where: { reviewId, ownerId },
    }),
  );
};

export const upsertReportForReview = async (
  ownerId: number,
  reviewId: number,
  data: HmrReportUpsertInput,
) => {
  return withTenantContext(ownerId, async (tx) => {
    const review = await tx.hmrReview.findFirst({ where: { id: reviewId, ownerId } });
    if (!review) {
      return null;
    }

    const createPayload: Prisma.HmrReportUncheckedCreateInput = {
      reviewId,
      ownerId,
      status: data.status ?? HmrReportStatus.DRAFT,
      summary: data.summary ?? null,
      recommendations: data.recommendations ?? null,
      generatedBy: null,
    };

    const updatePayload: Prisma.HmrReportUncheckedUpdateInput = {};
    if (typeof data.status !== 'undefined') {
      updatePayload.status = data.status;
    }
    if (typeof data.summary !== 'undefined') {
      updatePayload.summary = data.summary ?? null;
    }
    if (typeof data.recommendations !== 'undefined') {
      updatePayload.recommendations = data.recommendations ?? null;
    }

    return tx.hmrReport.upsert({
      where: { reviewId },
      update: updatePayload,
      create: createPayload,
    });
  });
};

export const listAuditEntries = async (ownerId: number, reviewId: number) => {
  return withTenantContext(ownerId, async (tx) => {
    const report = await tx.hmrReport.findFirst({ where: { reviewId, ownerId } });
    if (!report) {
      return [];
    }

    return tx.hmrReportAudit.findMany({
      where: { reportId: report.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  });
};

export const recordReportAudit = async (
  ownerId: number,
  reviewId: number,
  modelUsed: string,
  prompt: string,
  completion: string,
) => {
  return withTenantContext(ownerId, async (tx) => {
    const report = await tx.hmrReport.findFirst({ where: { reviewId, ownerId } });
    if (!report) {
      return null;
    }

    return tx.hmrReportAudit.create({
      data: {
        reportId: report.id,
        modelUsed,
        prompt,
        completion,
      },
    });
  });
};

export const generateReportDraft = async (
  ownerId: number,
  reviewId: number,
  _options: HmrReportGenerateInput,
) => {
  const prompt = await buildReportPrompt(reviewId, ownerId);
  if (!prompt) {
    return null;
  }

  let completion = '';
  let parsed: { letter: string; recommendations: string[] } | null = null;

  try {
    const response = await invokeClaude(prompt);
    completion = response.completion;
    parsed = JSON.parse(completion);
  } catch (error) {
    parsed = null;
  }

  if (!parsed || typeof parsed.letter !== 'string' || !Array.isArray(parsed.recommendations)) {
    parsed = {
      letter: completion || 'No draft generated. Please prepare the report manually.',
      recommendations: completion
        ? completion
            .split('\n')
            .filter((line) => line.trim().length > 0)
            .slice(0, 5)
        : [],
    };
  }

  const updatedReport = await upsertReportForReview(ownerId, reviewId, {
    summary: parsed.letter,
    recommendations: parsed.recommendations.map((item) => `- ${item}`).join('\n'),
    status: HmrReportStatus.DRAFT,
  });

  if (!updatedReport) {
    return null;
  }

  if (completion) {
    await recordReportAudit(ownerId, reviewId, process.env.BEDROCK_MODEL_ID ?? 'anthropic.claude-3-5-sonnet-20240620-v1:0', prompt.userPrompt, completion);
  }

  return {
    message: 'Draft generated with Claude. Review before finalising.',
    report: updatedReport,
    recommendations: parsed.recommendations,
  };
};
