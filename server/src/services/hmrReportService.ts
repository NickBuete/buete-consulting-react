import { Prisma, HmrReportStatus } from '../generated/prisma';
import { withTenantContext } from '../db/tenant';
import type { HmrReportGenerateInput, HmrReportUpsertInput } from '../validators/hmrReportSchemas';

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
  const report = await getReportForReview(ownerId, reviewId);
  if (!report) {
    return null;
  }

  return {
    message: 'Report generation is not yet implemented. This endpoint will integrate with Claude shortly.',
    report,
  };
};
