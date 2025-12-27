/**
 * HMR Medication Service
 * Extracted from hmrReviewService.ts lines 505-592
 * Handles medication management for HMR reviews
 */

import { MedicationStatus, Prisma } from '@prisma/client';
import { withTenantContext } from '../../db/tenant';
import type {
  HmrMedicationCreateInput,
  HmrMedicationUpdateInput,
} from '../../validators/hmrReviewSchemas';

/**
 * Maps validated medication input to Prisma create format
 */
const mapMedicationCreate = (
  med: HmrMedicationCreateInput
): Prisma.HmrMedicationCreateWithoutHmrReviewInput => {
  const createData: Prisma.HmrMedicationCreateWithoutHmrReviewInput = {
    name: med.name,
    dose: med.dose ?? null,
    frequency: med.frequency ?? null,
    indication: med.indication ?? null,
    status: med.status ?? MedicationStatus.CURRENT,
    isNew: med.isNew ?? null,
    isChanged: med.isChanged ?? null,
    notes: med.notes ?? null,
    verificationRequired: med.verificationRequired ?? null,
  };

  if (med.medicationId) {
    createData.medication = { connect: { id: med.medicationId } };
  }

  return createData;
};

/**
 * Maps validated medication update input to Prisma update format
 */
const mapMedicationUpdate = (
  input: HmrMedicationUpdateInput
): Prisma.HmrMedicationUpdateInput => {
  const updatePayload: Prisma.HmrMedicationUpdateInput = {};

  if (typeof input.medicationId !== 'undefined') {
    updatePayload.medication = input.medicationId
      ? { connect: { id: input.medicationId } }
      : { disconnect: true };
  }
  if (typeof input.name !== 'undefined') {
    updatePayload.name = input.name;
  }
  if (typeof input.dose !== 'undefined') {
    updatePayload.dose = input.dose ?? null;
  }
  if (typeof input.frequency !== 'undefined') {
    updatePayload.frequency = input.frequency ?? null;
  }
  if (typeof input.indication !== 'undefined') {
    updatePayload.indication = input.indication ?? null;
  }
  if (typeof input.status !== 'undefined') {
    updatePayload.status = input.status ?? MedicationStatus.CURRENT;
  }
  if (typeof input.isNew !== 'undefined') {
    updatePayload.isNew = input.isNew ?? null;
  }
  if (typeof input.isChanged !== 'undefined') {
    updatePayload.isChanged = input.isChanged ?? null;
  }
  if (typeof input.notes !== 'undefined') {
    updatePayload.notes = input.notes ?? null;
  }
  if (typeof input.verificationRequired !== 'undefined') {
    updatePayload.verificationRequired = input.verificationRequired ?? null;
  }

  return updatePayload;
};

/**
 * Add a medication to an HMR review
 */
export const addMedicationToReview = async (
  ownerId: number,
  hmrReviewId: number,
  input: HmrMedicationCreateInput
) => {
  return withTenantContext(ownerId, async (tx) => {
    const review = await tx.hmrReview.findFirst({
      where: { id: hmrReviewId, ownerId },
    });
    if (!review) {
      return null;
    }

    return tx.hmrMedication.create({
      data: {
        ...mapMedicationCreate(input),
        hmrReview: { connect: { id: hmrReviewId } },
      },
    });
  });
};

/**
 * Update a medication in an HMR review
 */
export const updateMedicationForReview = async (
  ownerId: number,
  medicationId: number,
  input: HmrMedicationUpdateInput
) => {
  const updatePayload = mapMedicationUpdate(input);

  return withTenantContext(ownerId, async (tx) => {
    const medication = await tx.hmrMedication.findFirst({
      where: { id: medicationId, hmrReview: { ownerId } },
    });
    if (!medication) {
      return null;
    }

    return tx.hmrMedication.update({
      where: { id: medicationId },
      data: updatePayload,
    });
  });
};

/**
 * Remove a medication from an HMR review
 */
export const removeMedicationFromReview = async (
  ownerId: number,
  medicationId: number
) => {
  return withTenantContext(ownerId, async (tx) => {
    const deleted = await tx.hmrMedication.deleteMany({
      where: { id: medicationId, hmrReview: { ownerId } },
    });
    return deleted.count > 0;
  });
};

/**
 * Export mapper functions for use in hmrReviewService.ts create operation
 */
export { mapMedicationCreate };
