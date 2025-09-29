import { Prisma } from '../generated/prisma';
import { withTenantContext } from '../db/tenant';
import type { HmrEducationCreateInput, HmrEducationUpdateInput } from '../validators/hmrEducationSchemas';

export const listEducationForReview = async (ownerId: number, reviewId: number) => {
  return withTenantContext(ownerId, (tx) =>
    tx.hmrEducationAdvice.findMany({
      where: { ownerId, reviewId },
      orderBy: { createdAt: 'asc' },
    }),
  );
};

export const createEducationForReview = async (
  ownerId: number,
  reviewId: number,
  data: HmrEducationCreateInput,
) => {
  return withTenantContext(ownerId, async (tx) => {
    const review = await tx.hmrReview.findFirst({ where: { id: reviewId, ownerId } });
    if (!review) {
      return null;
    }

    return tx.hmrEducationAdvice.create({
      data: {
        ownerId,
        reviewId,
        topic: data.topic,
        advice: data.advice,
      },
    });
  });
};

export const updateEducationEntry = async (ownerId: number, id: number, data: HmrEducationUpdateInput) => {
  return withTenantContext(ownerId, async (tx) => {
    const existing = await tx.hmrEducationAdvice.findFirst({ where: { id, ownerId } });
    if (!existing) {
      return null;
    }

    const updatePayload: Prisma.HmrEducationAdviceUncheckedUpdateInput = {};
    if (typeof data.topic !== 'undefined') {
      updatePayload.topic = data.topic;
    }
    if (typeof data.advice !== 'undefined') {
      updatePayload.advice = data.advice;
    }

    return tx.hmrEducationAdvice.update({
      where: { id },
      data: updatePayload,
    });
  });
};

export const deleteEducationEntry = async (ownerId: number, id: number) => {
  return withTenantContext(ownerId, async (tx) => {
    const deleted = await tx.hmrEducationAdvice.deleteMany({ where: { id, ownerId } });
    return deleted.count > 0;
  });
};
