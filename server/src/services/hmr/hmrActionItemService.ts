/**
 * HMR Action Item Service
 * Extracted from hmrReviewService.ts lines 654-748
 * Handles action item management for HMR reviews
 */

import { ActionPriority, ActionStatus, Prisma } from '@prisma/client';
import { withTenantContext } from '../../db/tenant';
import type {
  HmrActionItemCreateInput,
  HmrActionItemUpdateInput,
} from '../../validators/hmrReviewSchemas';

/**
 * Maps validated action item input to Prisma create format
 */
const mapActionItemCreate = (
  action: HmrActionItemCreateInput
): Prisma.HmrActionItemCreateWithoutHmrReviewInput => {
  const createData: Prisma.HmrActionItemCreateWithoutHmrReviewInput = {
    title: action.title,
    description: action.description ?? null,
    priority: action.priority ?? ActionPriority.MEDIUM,
    status: action.status ?? ActionStatus.OPEN,
    dueDate: action.dueDate ?? null,
    resolutionNotes: action.resolutionNotes ?? null,
  };

  if (action.assignedToUserId) {
    createData.assignee = { connect: { id: action.assignedToUserId } };
  }

  return createData;
};

/**
 * Maps validated action item update input to Prisma update format
 */
const mapActionItemUpdate = (
  input: HmrActionItemUpdateInput
): Prisma.HmrActionItemUpdateInput => {
  const updatePayload: Prisma.HmrActionItemUpdateInput = {};

  if (typeof input.title !== 'undefined') {
    updatePayload.title = input.title;
  }
  if (typeof input.description !== 'undefined') {
    updatePayload.description = input.description ?? null;
  }
  if (typeof input.priority !== 'undefined') {
    updatePayload.priority = input.priority ?? ActionPriority.MEDIUM;
  }
  if (typeof input.status !== 'undefined') {
    updatePayload.status = input.status ?? ActionStatus.OPEN;
    updatePayload.completedAt =
      input.status === ActionStatus.COMPLETED ? new Date() : null;
  }
  if (typeof input.dueDate !== 'undefined') {
    updatePayload.dueDate = input.dueDate ?? null;
  }
  if (typeof input.assignedToUserId !== 'undefined') {
    updatePayload.assignee = input.assignedToUserId
      ? { connect: { id: input.assignedToUserId } }
      : { disconnect: true };
  }
  if (typeof input.resolutionNotes !== 'undefined') {
    updatePayload.resolutionNotes = input.resolutionNotes ?? null;
  }

  return updatePayload;
};

/**
 * Create an action item for an HMR review
 */
export const createActionItemForReview = async (
  ownerId: number,
  hmrReviewId: number,
  input: HmrActionItemCreateInput
) => {
  return withTenantContext(ownerId, async (tx) => {
    const review = await tx.hmrReview.findFirst({
      where: { id: hmrReviewId, ownerId },
    });
    if (!review) {
      return null;
    }

    return tx.hmrActionItem.create({
      data: {
        ...mapActionItemCreate(input),
        hmrReview: { connect: { id: hmrReviewId } },
      },
      include: { assignee: true },
    });
  });
};

/**
 * Update an action item for an HMR review
 */
export const updateActionItemForReview = async (
  ownerId: number,
  actionItemId: number,
  input: HmrActionItemUpdateInput
) => {
  const updatePayload = mapActionItemUpdate(input);

  return withTenantContext(ownerId, async (tx) => {
    const actionItem = await tx.hmrActionItem.findFirst({
      where: { id: actionItemId, hmrReview: { ownerId } },
    });
    if (!actionItem) {
      return null;
    }

    if (
      typeof input.assignedToUserId !== 'undefined' &&
      input.assignedToUserId
    ) {
      const user = await tx.user.findFirst({
        where: { id: input.assignedToUserId },
      });
      if (!user) {
        return null;
      }
    }

    return tx.hmrActionItem.update({
      where: { id: actionItemId },
      data: updatePayload,
      include: { assignee: true },
    });
  });
};

/**
 * Delete an action item from an HMR review
 */
export const deleteActionItemFromReview = async (
  ownerId: number,
  actionItemId: number
) => {
  return withTenantContext(ownerId, async (tx) => {
    const deleted = await tx.hmrActionItem.deleteMany({
      where: { id: actionItemId, hmrReview: { ownerId } },
    });
    return deleted.count > 0;
  });
};

/**
 * Export mapper functions for use in hmrReviewService.ts create operation
 */
export { mapActionItemCreate };
