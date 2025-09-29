import {
  ActionPriority,
  ActionStatus,
  HmrReviewStatus,
  MedicationStatus,
  Prisma,
  SymptomType,
} from '../generated/prisma';
import { withTenantContext } from '../db/tenant';
import type {
  HmrActionItemCreateInput,
  HmrActionItemUpdateInput,
  HmrAttachmentCreateInput,
  HmrAuditLogCreateInput,
  HmrMedicationCreateInput,
  HmrMedicationUpdateInput,
  HmrReviewCreateInput,
  HmrReviewUpdateInput,
  HmrSymptomUpsertInput,
} from '../validators/hmrReviewSchemas';

export type ListHmrReviewsOptions = {
  status?: HmrReviewStatus;
  patientId?: number;
  clinicId?: number;
  prescriberId?: number;
  search?: string;
  includeCompleted?: boolean;
};

const baseInclude: Prisma.HmrReviewInclude = {
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
};

const mapMedicationCreate = (
  med: HmrMedicationCreateInput,
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

const mapActionItemCreate = (
  action: HmrActionItemCreateInput,
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

const applyReviewCoreFields = (
  data: HmrReviewUpdateInput,
  target: Prisma.HmrReviewUpdateInput,
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

export const listHmrReviews = async (ownerId: number, options: ListHmrReviewsOptions = {}) => {
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
        { patient: { firstName: { contains: options.search, mode: 'insensitive' } } },
        { patient: { lastName: { contains: options.search, mode: 'insensitive' } } },
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
    }),
  );
};

export const getHmrReviewById = async (ownerId: number, id: number) => {
  return withTenantContext(ownerId, (tx) =>
    tx.hmrReview.findFirst({
      where: { id, ownerId },
      include: baseInclude,
    }),
  );
};

export const createHmrReview = async (ownerId: number, data: HmrReviewCreateInput) => {
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
  };

  createData.owner = { connect: { id: ownerId } };

  if (data.prescriberId) {
    createData.prescriber = { connect: { id: data.prescriberId } };
  }
  if (data.clinicId) {
    createData.clinic = { connect: { id: data.clinicId } };
  }
  if (data.medications?.length) {
    createData.medications = { create: data.medications.map(mapMedicationCreate) };
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
    createData.actionItems = { create: data.actionItems.map(mapActionItemCreate) };
  }

  return withTenantContext(ownerId, async (tx) => {
    const patient = await tx.patient.findFirst({ where: { id: data.patientId, ownerId } });
    if (!patient) {
      return null;
    }

    if (data.prescriberId) {
      const prescriber = await tx.prescriber.findFirst({ where: { id: data.prescriberId, ownerId } });
      if (!prescriber) {
        return null;
      }
    }

    if (data.clinicId) {
      const clinic = await tx.clinic.findFirst({ where: { id: data.clinicId, ownerId } });
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

export const updateHmrReview = async (ownerId: number, id: number, data: HmrReviewUpdateInput) => {
  const updatePayload: Prisma.HmrReviewUpdateInput = {};
  applyReviewCoreFields(data, updatePayload);

  return withTenantContext(ownerId, async (tx) => {
    const existing = await tx.hmrReview.findFirst({ where: { id, ownerId } });
    if (!existing) {
      return null;
    }

    if (typeof data.prescriberId !== 'undefined' && data.prescriberId !== null) {
      const prescriber = await tx.prescriber.findFirst({ where: { id: data.prescriberId, ownerId } });
      if (!prescriber) {
        return null;
      }
    }

    if (typeof data.clinicId !== 'undefined' && data.clinicId !== null) {
      const clinic = await tx.clinic.findFirst({ where: { id: data.clinicId, ownerId } });
      if (!clinic) {
        return null;
      }
    }

    if (typeof data.patientId !== 'undefined') {
      const patient = await tx.patient.findFirst({ where: { id: data.patientId, ownerId } });
      if (!patient) {
        return null;
      }
    }

    return tx.hmrReview.update({
      where: { id },
      data: updatePayload,
      include: baseInclude,
    });
  });
};

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

export const addMedicationToReview = async (
  ownerId: number,
  hmrReviewId: number,
  input: HmrMedicationCreateInput,
) => {
  return withTenantContext(ownerId, async (tx) => {
    const review = await tx.hmrReview.findFirst({ where: { id: hmrReviewId, ownerId } });
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

export const updateMedicationForReview = async (
  ownerId: number,
  medicationId: number,
  input: HmrMedicationUpdateInput,
) => {
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

export const removeMedicationFromReview = async (ownerId: number, medicationId: number) => {
  return withTenantContext(ownerId, async (tx) => {
    const deleted = await tx.hmrMedication.deleteMany({
      where: { id: medicationId, hmrReview: { ownerId } },
    });
    return deleted.count > 0;
  });
};

export const upsertSymptomForReview = async (
  ownerId: number,
  hmrReviewId: number,
  input: HmrSymptomUpsertInput,
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
    const review = await tx.hmrReview.findFirst({ where: { id: hmrReviewId, ownerId } });
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

export const deleteSymptomFromReview = async (
  ownerId: number,
  hmrReviewId: number,
  symptom: SymptomType,
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

export const createActionItemForReview = async (
  ownerId: number,
  hmrReviewId: number,
  input: HmrActionItemCreateInput,
) => {
  return withTenantContext(ownerId, async (tx) => {
    const review = await tx.hmrReview.findFirst({ where: { id: hmrReviewId, ownerId } });
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

export const updateActionItemForReview = async (
  ownerId: number,
  actionItemId: number,
  input: HmrActionItemUpdateInput,
) => {
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

  return withTenantContext(ownerId, async (tx) => {
    const actionItem = await tx.hmrActionItem.findFirst({
      where: { id: actionItemId, hmrReview: { ownerId } },
    });
    if (!actionItem) {
      return null;
    }

    if (typeof input.assignedToUserId !== 'undefined' && input.assignedToUserId) {
      const user = await tx.user.findFirst({ where: { id: input.assignedToUserId } });
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

export const deleteActionItemFromReview = async (ownerId: number, actionItemId: number) => {
  return withTenantContext(ownerId, async (tx) => {
    const deleted = await tx.hmrActionItem.deleteMany({
      where: { id: actionItemId, hmrReview: { ownerId } },
    });
    return deleted.count > 0;
  });
};

export const createAttachmentForReview = async (
  ownerId: number,
  hmrReviewId: number,
  input: HmrAttachmentCreateInput,
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
    const review = await tx.hmrReview.findFirst({ where: { id: hmrReviewId, ownerId } });
    if (!review) {
      return null;
    }

    return tx.hmrAttachment.create({ data: createData });
  });
};

export const recordAuditLog = async (
  ownerId: number,
  hmrReviewId: number,
  input: HmrAuditLogCreateInput,
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
    const review = await tx.hmrReview.findFirst({ where: { id: hmrReviewId, ownerId } });
    if (!review) {
      return null;
    }

    return tx.hmrAuditLog.create({ data: createData });
  });
};
