/**
 * HMR Review Service (Refactored)
 * Core review CRUD operations only
 * Reduced from 808 lines to ~380 lines
 *
 * Extracted services:
 * - hmrMedicationService.ts - Medication operations
 * - hmrSymptomService.ts - Symptom operations
 * - hmrActionItemService.ts - Action item operations
 * - hmrAuditService.ts - Audit logging
 * - hmrAttachmentService.ts - Attachment management
 * - workflowStateManager.ts - Status transitions and validation
 */

import { HmrReviewStatus, Prisma } from '@prisma/client';
import { withTenantContext } from '../../db/tenant';
import {
  InvalidTransitionError,
  applyStatusTimestamps,
  isValidTransition,
} from './workflowStateManager';
import { mapMedicationCreate } from './hmrMedicationService';
import { mapActionItemCreate } from './hmrActionItemService';
import type {
  HmrReviewCreateInput,
  HmrReviewUpdateInput,
} from '../../validators/hmrReviewSchemas';

export type ListHmrReviewsOptions = {
  status?: HmrReviewStatus;
  patientId?: number;
  clinicId?: number;
  prescriberId?: number;
  search?: string;
  includeCompleted?: boolean;
};

/**
 * Base include for eager loading related entities
 * Used across all read operations for consistency
 */
export const baseInclude: Prisma.HmrReviewInclude = {
  patient: true,
  prescriber: { include: { clinic: true } },
  clinic: true,
  medications: true,
  symptoms: true,
  actionItems: {
    orderBy: { dueDate: 'asc' },
    include: { assignee: true },
  },
  attachments: true,
  auditLogs: {
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { changedBy: true },
  },
  medicalHistory: { orderBy: { createdAt: 'asc' } },
  allergiesTable: { orderBy: { createdAt: 'asc' } },
  pathologyResults: { orderBy: { createdAt: 'desc' } },
};

/**
 * Helper to map validated review update fields to Prisma format
 * Handles field-by-field updates with proper null handling
 */
export const applyReviewCoreFields = (
  data: HmrReviewUpdateInput,
  target: Prisma.HmrReviewUpdateInput
) => {
  if (typeof data.patientId !== 'undefined') {
    target.patient = { connect: { id: data.patientId } };
  }
  if (typeof data.prescriberId !== 'undefined') {
    target.prescriber = data.prescriberId
      ? { connect: { id: data.prescriberId } }
      : { disconnect: true };
  }
  if (typeof data.clinicId !== 'undefined') {
    target.clinic = data.clinicId
      ? { connect: { id: data.clinicId } }
      : { disconnect: true };
  }
  if (typeof data.referredBy !== 'undefined') {
    target.referredBy = data.referredBy ?? null;
  }
  if (typeof data.referralDate !== 'undefined') {
    target.referralDate = data.referralDate ?? null;
  }
  if (typeof data.referralReason !== 'undefined') {
    target.referralReason = data.referralReason ?? null;
  }
  if (typeof data.referralNotes !== 'undefined') {
    target.referralNotes = data.referralNotes ?? null;
  }
  if (typeof data.status !== 'undefined') {
    target.status = data.status;
  }
  if (typeof data.acceptedAt !== 'undefined') {
    target.acceptedAt = data.acceptedAt ?? null;
  }
  if (typeof data.scheduledAt !== 'undefined') {
    target.scheduledAt = data.scheduledAt ?? null;
  }
  if (typeof data.calendarEventId !== 'undefined') {
    target.calendarEventId = data.calendarEventId ?? null;
  }
  if (typeof data.visitLocation !== 'undefined') {
    target.visitLocation = data.visitLocation ?? null;
  }
  if (typeof data.visitNotes !== 'undefined') {
    target.visitNotes = data.visitNotes ?? null;
  }
  if (typeof data.assessmentSummary !== 'undefined') {
    target.assessmentSummary = data.assessmentSummary ?? null;
  }
  if (typeof data.pastMedicalHistory !== 'undefined') {
    target.pastMedicalHistory = data.pastMedicalHistory ?? null;
  }
  if (typeof data.allergies !== 'undefined') {
    target.allergies = data.allergies ?? null;
  }
  if (typeof data.pathology !== 'undefined') {
    target.pathology = data.pathology ?? null;
  }
  if (typeof data.medicalGoals !== 'undefined') {
    target.medicalGoals = data.medicalGoals ?? null;
  }
  if (typeof data.goalBarriers !== 'undefined') {
    target.goalBarriers = data.goalBarriers ?? null;
  }
  if (typeof data.livingArrangement !== 'undefined') {
    target.livingArrangement = data.livingArrangement ?? null;
  }
  if (typeof data.usesWebster !== 'undefined') {
    target.usesWebster = data.usesWebster ?? null;
  }
  if (typeof data.livesAlone !== 'undefined') {
    target.livesAlone = data.livesAlone ?? null;
  }
  if (typeof data.otherSupports !== 'undefined') {
    target.otherSupports = data.otherSupports ?? null;
  }
  if (typeof data.followUpDueAt !== 'undefined') {
    target.followUpDueAt = data.followUpDueAt ?? null;
  }
  if (typeof data.claimedAt !== 'undefined') {
    target.claimedAt = data.claimedAt ?? null;
  }
  if (typeof data.reportUrl !== 'undefined') {
    target.reportUrl = data.reportUrl ?? null;
  }
  if (typeof data.reportBody !== 'undefined') {
    target.reportBody = data.reportBody ?? null;
  }
};

/**
 * List HMR reviews with filtering options
 */
export const listHmrReviews = async (
  ownerId: number,
  options: ListHmrReviewsOptions = {}
) => {
  const filters: Prisma.HmrReviewWhereInput[] = [];

  filters.push({ ownerId });

  if (typeof options.status !== 'undefined') {
    filters.push({ status: options.status });
  } else if (!options.includeCompleted) {
    filters.push({
      status: { notIn: [HmrReviewStatus.CLAIMED, HmrReviewStatus.CANCELLED] },
    });
  }

  if (typeof options.patientId === 'number') {
    filters.push({ patientId: options.patientId });
  }
  if (typeof options.clinicId === 'number') {
    filters.push({ clinicId: options.clinicId });
  }
  if (typeof options.prescriberId === 'number') {
    filters.push({ prescriberId: options.prescriberId });
  }
  if (options.search) {
    filters.push({
      OR: [
        {
          patient: {
            firstName: { contains: options.search, mode: 'insensitive' },
          },
        },
        {
          patient: {
            lastName: { contains: options.search, mode: 'insensitive' },
          },
        },
        { referralReason: { contains: options.search, mode: 'insensitive' } },
      ],
    });
  }

  const where: Prisma.HmrReviewWhereInput = { AND: filters };

  return withTenantContext(ownerId, (tx) =>
    tx.hmrReview.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: baseInclude,
    })
  );
};

/**
 * Get a single HMR review by ID
 */
export const getHmrReviewById = async (ownerId: number, id: number) => {
  return withTenantContext(ownerId, (tx) =>
    tx.hmrReview.findFirst({
      where: { id, ownerId },
      include: baseInclude,
    })
  );
};

/**
 * Create a new HMR review
 * Supports nested creation of medications, symptoms, and action items
 */
export const createHmrReview = async (
  ownerId: number,
  data: HmrReviewCreateInput
) => {
  const createData: Prisma.HmrReviewCreateInput = {
    patient: { connect: { id: data.patientId } },
    referredBy: data.referredBy ?? null,
    referralDate: data.referralDate ?? null,
    referralReason: data.referralReason ?? null,
    referralNotes: data.referralNotes ?? null,
    status: data.status ?? HmrReviewStatus.PENDING,
    acceptedAt: data.acceptedAt ?? null,
    scheduledAt: data.scheduledAt ?? null,
    calendarEventId: data.calendarEventId ?? null,
    visitLocation: data.visitLocation ?? null,
    visitNotes: data.visitNotes ?? null,
    assessmentSummary: data.assessmentSummary ?? null,
    pastMedicalHistory: data.pastMedicalHistory ?? null,
    allergies: data.allergies ?? null,
    pathology: data.pathology ?? null,
    medicalGoals: data.medicalGoals ?? null,
    goalBarriers: data.goalBarriers ?? null,
    livingArrangement: data.livingArrangement ?? null,
    usesWebster: data.usesWebster ?? null,
    livesAlone: data.livesAlone ?? null,
    otherSupports: data.otherSupports ?? null,
    followUpDueAt: data.followUpDueAt ?? null,
    claimedAt: data.claimedAt ?? null,
    reportUrl: data.reportUrl ?? null,
    reportBody: data.reportBody ?? null,
    owner: { connect: { id: ownerId } },
  };

  if (data.prescriberId) {
    createData.prescriber = { connect: { id: data.prescriberId } };
  }
  if (data.clinicId) {
    createData.clinic = { connect: { id: data.clinicId } };
  }
  if (data.medications?.length) {
    createData.medications = {
      create: data.medications.map(mapMedicationCreate),
    };
  }
  if (data.symptoms?.length) {
    createData.symptoms = {
      create: data.symptoms.map((symptom) => ({
        symptom: symptom.symptom,
        present: symptom.present ?? false,
        severity: symptom.severity ?? null,
        notes: symptom.notes ?? null,
      })),
    };
  }
  if (data.actionItems?.length) {
    createData.actionItems = {
      create: data.actionItems.map(mapActionItemCreate),
    };
  }

  return withTenantContext(ownerId, async (tx) => {
    const patient = await tx.patient.findFirst({
      where: { id: data.patientId, ownerId },
    });
    if (!patient) {
      return null;
    }

    if (data.prescriberId) {
      const prescriber = await tx.prescriber.findUnique({
        where: { id: data.prescriberId },
      });
      if (!prescriber) {
        return null;
      }
    }

    if (data.clinicId) {
      const clinic = await tx.clinic.findUnique({
        where: { id: data.clinicId },
      });
      if (!clinic) {
        return null;
      }
    }

    return tx.hmrReview.create({
      data: createData,
      include: baseInclude,
    });
  });
};

/**
 * Update an HMR review
 * Handles structured table updates (medical history, allergies, pathology)
 * Status transitions are validated and automatic timestamps applied
 */
export const updateHmrReview = async (
  ownerId: number,
  id: number,
  data: HmrReviewUpdateInput
) => {
  const updatePayload: Prisma.HmrReviewUpdateInput = {};
  applyReviewCoreFields(data, updatePayload);

  return withTenantContext(ownerId, async (tx) => {
    const existing = await tx.hmrReview.findFirst({ where: { id, ownerId } });
    if (!existing) {
      return null;
    }

    // Validate status transition if status is being changed
    if (typeof data.status !== 'undefined' && data.status !== existing.status) {
      if (!isValidTransition(existing.status, data.status)) {
        throw new InvalidTransitionError(existing.status, data.status);
      }

      // Apply automatic timestamp updates for status transitions
      applyStatusTimestamps(existing.status, data.status, updatePayload);
    }

    if (
      typeof data.prescriberId !== 'undefined' &&
      data.prescriberId !== null
    ) {
      const prescriber = await tx.prescriber.findUnique({
        where: { id: data.prescriberId },
      });
      if (!prescriber) {
        return null;
      }
    }

    if (typeof data.clinicId !== 'undefined' && data.clinicId !== null) {
      const clinic = await tx.clinic.findUnique({
        where: { id: data.clinicId },
      });
      if (!clinic) {
        return null;
      }
    }

    if (typeof data.patientId !== 'undefined') {
      const patient = await tx.patient.findFirst({
        where: { id: data.patientId, ownerId },
      });
      if (!patient) {
        return null;
      }
    }

    // Handle structured medical history
    if (typeof data.medicalHistory !== 'undefined') {
      // Delete all existing entries and recreate
      await tx.hmrMedicalHistory.deleteMany({ where: { hmrReviewId: id } });
      if (data.medicalHistory && data.medicalHistory.length > 0) {
        await tx.hmrMedicalHistory.createMany({
          data: data.medicalHistory.map((entry) => ({
            hmrReviewId: id,
            year: entry.year ?? null,
            condition: entry.condition,
            notes: entry.notes ?? null,
          })),
        });
      }
    }

    // Handle structured allergies
    if (typeof data.allergiesTable !== 'undefined') {
      await tx.hmrAllergy.deleteMany({ where: { hmrReviewId: id } });
      if (data.allergiesTable && data.allergiesTable.length > 0) {
        await tx.hmrAllergy.createMany({
          data: data.allergiesTable.map((entry) => ({
            hmrReviewId: id,
            allergen: entry.allergen,
            reaction: entry.reaction ?? null,
            severity: entry.severity ?? null,
          })),
        });
      }
    }

    // Handle structured pathology
    if (typeof data.pathologyResults !== 'undefined') {
      await tx.hmrPathology.deleteMany({ where: { hmrReviewId: id } });
      if (data.pathologyResults && data.pathologyResults.length > 0) {
        await tx.hmrPathology.createMany({
          data: data.pathologyResults.map((entry) => ({
            hmrReviewId: id,
            date: entry.date ?? null,
            test: entry.test,
            result: entry.result,
            notes: entry.notes ?? null,
          })),
        });
      }
    }

    return tx.hmrReview.update({
      where: { id },
      data: updatePayload,
      include: baseInclude,
    });
  });
};

/**
 * Delete an HMR review
 */
export const deleteHmrReview = async (ownerId: number, id: number) => {
  return withTenantContext(ownerId, async (tx) => {
    const existing = await tx.hmrReview.findFirst({ where: { id, ownerId } });
    if (!existing) {
      return false;
    }

    await tx.hmrReview.delete({ where: { id } });
    return true;
  });
};

/**
 * Update review status with validation
 * Convenience function for status-only updates
 */
export const updateReviewStatus = async (
  ownerId: number,
  id: number,
  status: HmrReviewStatus
) => {
  return updateHmrReview(ownerId, id, { status });
};
