/**
 * HMR Audit Service
 * Extracted from hmrReviewService.ts lines 778-808
 * Handles audit logging for HMR reviews
 */

import { Prisma } from '@prisma/client';
import { withTenantContext } from '../../db/tenant';
import type { HmrAuditLogCreateInput } from '../../validators/hmrReviewSchemas';

/**
 * Record an audit log entry for an HMR review
 */
export const recordAuditLog = async (
  ownerId: number,
  hmrReviewId: number,
  input: HmrAuditLogCreateInput
) => {
  const createData: Prisma.HmrAuditLogCreateInput = {
    hmrReview: { connect: { id: hmrReviewId } },
    changeType: input.changeType,
  };

  if (typeof input.oldValue !== 'undefined') {
    createData.oldValue = input.oldValue as Prisma.InputJsonValue;
  }
  if (typeof input.newValue !== 'undefined') {
    createData.newValue = input.newValue as Prisma.InputJsonValue;
  }
  if (input.changedByUserId) {
    createData.changedBy = { connect: { id: input.changedByUserId } };
  }

  return withTenantContext(ownerId, async (tx) => {
    const review = await tx.hmrReview.findFirst({
      where: { id: hmrReviewId, ownerId },
    });
    if (!review) {
      return null;
    }

    return tx.hmrAuditLog.create({ data: createData });
  });
};

/**
 * Get audit logs for an HMR review
 */
export const getAuditLogs = async (ownerId: number, hmrReviewId: number) => {
  return withTenantContext(ownerId, async (tx) => {
    const review = await tx.hmrReview.findFirst({
      where: { id: hmrReviewId, ownerId },
    });
    if (!review) {
      return null;
    }

    return tx.hmrAuditLog.findMany({
      where: { hmrReviewId },
      orderBy: { createdAt: 'desc' },
      include: { changedBy: true },
      take: 50, // Limit to recent 50 logs
    });
  });
};
