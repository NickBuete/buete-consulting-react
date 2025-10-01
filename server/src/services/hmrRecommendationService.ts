import { Prisma } from '@prisma/client';
import { withTenantContext } from '../db/tenant';
import type {
  HmrRecommendationCreateInput,
  HmrRecommendationUpdateInput,
} from '../validators/hmrRecommendationSchemas';

export const listRecommendationsForReview = async (ownerId: number, reviewId: number) => {
  return withTenantContext(ownerId, (tx) =>
    tx.hmrRecommendation.findMany({
      where: { ownerId, reviewId },
      orderBy: { createdAt: 'asc' },
    }),
  );
};

export const createRecommendationForReview = async (
  ownerId: number,
  reviewId: number,
  data: HmrRecommendationCreateInput,
) => {
  return withTenantContext(ownerId, async (tx) => {
    const review = await tx.hmrReview.findFirst({ where: { id: reviewId, ownerId } });
    if (!review) {
      return null;
    }

    return tx.hmrRecommendation.create({
      data: {
        ownerId,
        reviewId,
        assessment: data.assessment,
        plan: data.plan,
      },
    });
  });
};

export const updateRecommendationEntry = async (
  ownerId: number,
  id: number,
  data: HmrRecommendationUpdateInput,
) => {
  return withTenantContext(ownerId, async (tx) => {
    const existing = await tx.hmrRecommendation.findFirst({ where: { id, ownerId } });
    if (!existing) {
      return null;
    }

    const updatePayload: Prisma.HmrRecommendationUncheckedUpdateInput = {};
    if (typeof data.assessment !== 'undefined') {
      updatePayload.assessment = data.assessment;
    }
    if (typeof data.plan !== 'undefined') {
      updatePayload.plan = data.plan;
    }

    return tx.hmrRecommendation.update({
      where: { id },
      data: updatePayload,
    });
  });
};

export const deleteRecommendationEntry = async (ownerId: number, id: number) => {
  return withTenantContext(ownerId, async (tx) => {
    const deleted = await tx.hmrRecommendation.deleteMany({ where: { id, ownerId } });
    return deleted.count > 0;
  });
};
