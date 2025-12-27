/**
 * HMR Symptom Service
 * Extracted from hmrReviewService.ts lines 594-652
 * Handles symptom management for HMR reviews
 */

import { Prisma, SymptomType } from '@prisma/client';
import { withTenantContext } from '../../db/tenant';
import type { HmrSymptomUpsertInput } from '../../validators/hmrReviewSchemas';

/**
 * Upsert a symptom for an HMR review
 * Creates if doesn't exist, updates if it does
 */
export const upsertSymptomForReview = async (
  ownerId: number,
  hmrReviewId: number,
  input: HmrSymptomUpsertInput
) => {
  const updateData: Prisma.HmrSymptomUpdateInput = {};
  if (typeof input.present !== 'undefined') {
    updateData.present = input.present;
  }
  if (typeof input.severity !== 'undefined') {
    updateData.severity = input.severity ?? null;
  }
  if (typeof input.notes !== 'undefined') {
    updateData.notes = input.notes ?? null;
  }

  return withTenantContext(ownerId, async (tx) => {
    const review = await tx.hmrReview.findFirst({
      where: { id: hmrReviewId, ownerId },
    });
    if (!review) {
      return null;
    }

    return tx.hmrSymptom.upsert({
      where: {
        hmrReviewId_symptom: {
          hmrReviewId,
          symptom: input.symptom,
        },
      },
      update: updateData,
      create: {
        hmrReview: { connect: { id: hmrReviewId } },
        symptom: input.symptom,
        present: input.present ?? false,
        severity: input.severity ?? null,
        notes: input.notes ?? null,
      },
    });
  });
};

/**
 * Delete a symptom from an HMR review
 */
export const deleteSymptomFromReview = async (
  ownerId: number,
  hmrReviewId: number,
  symptom: SymptomType
) => {
  return withTenantContext(ownerId, async (tx) => {
    const deleted = await tx.hmrSymptom.deleteMany({
      where: {
        hmrReviewId,
        symptom,
        hmrReview: { ownerId },
      },
    });
    return deleted.count > 0;
  });
};
