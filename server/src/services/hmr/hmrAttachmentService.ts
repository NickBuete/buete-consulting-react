/**
 * HMR Attachment Service
 * Extracted from hmrReviewService.ts lines 750-776
 * Handles attachment management for HMR reviews
 */

import { Prisma } from '@prisma/client';
import { withTenantContext } from '../../db/tenant';
import type { HmrAttachmentCreateInput } from '../../validators/hmrReviewSchemas';

/**
 * Create an attachment for an HMR review
 */
export const createAttachmentForReview = async (
  ownerId: number,
  hmrReviewId: number,
  input: HmrAttachmentCreateInput
) => {
  const createData: Prisma.HmrAttachmentCreateInput = {
    hmrReview: { connect: { id: hmrReviewId } },
    fileName: input.fileName,
    mimeType: input.mimeType ?? null,
    storagePath: input.storagePath,
  };

  if (input.uploadedByUserId) {
    createData.uploadedBy = { connect: { id: input.uploadedByUserId } };
  }

  return withTenantContext(ownerId, async (tx) => {
    const review = await tx.hmrReview.findFirst({
      where: { id: hmrReviewId, ownerId },
    });
    if (!review) {
      return null;
    }

    return tx.hmrAttachment.create({ data: createData });
  });
};

/**
 * Delete an attachment from an HMR review
 */
export const deleteAttachmentFromReview = async (
  ownerId: number,
  attachmentId: number
) => {
  return withTenantContext(ownerId, async (tx) => {
    const deleted = await tx.hmrAttachment.deleteMany({
      where: { id: attachmentId, hmrReview: { ownerId } },
    });
    return deleted.count > 0;
  });
};

/**
 * Get attachments for an HMR review
 */
export const getAttachmentsForReview = async (
  ownerId: number,
  hmrReviewId: number
) => {
  return withTenantContext(ownerId, async (tx) => {
    const review = await tx.hmrReview.findFirst({
      where: { id: hmrReviewId, ownerId },
    });
    if (!review) {
      return null;
    }

    return tx.hmrAttachment.findMany({
      where: { hmrReviewId },
      orderBy: { createdAt: 'desc' },
      include: { uploadedBy: true },
    });
  });
};
