import { z } from 'zod'

import {
  ActionPriority,
  ActionStatus,
  HmrReviewStatus,
  LivingArrangement,
  MedicationStatus,
  SymptomType,
} from '@prisma/client'

const statusEnum = z.nativeEnum(HmrReviewStatus)
const livingArrangementEnum = z.nativeEnum(LivingArrangement)
const symptomEnum = z.nativeEnum(SymptomType)
const actionPriorityEnum = z.nativeEnum(ActionPriority)
const actionStatusEnum = z.nativeEnum(ActionStatus)
const medicationStatusEnum = z.nativeEnum(MedicationStatus)

const dateSchema = z.coerce.date()
const dateTimeSchema = z.coerce.date()

export const hmrMedicationCreateSchema = z.object({
  medicationId: z.number().int().positive().optional(),
  name: z.string().min(1, 'Medication name is required'),
  dose: z.string().optional().nullable(),
  frequency: z.string().optional().nullable(),
  indication: z.string().optional().nullable(),
  status: medicationStatusEnum.optional(),
  isNew: z.boolean().optional(),
  isChanged: z.boolean().optional(),
  notes: z.string().optional().nullable(),
  verificationRequired: z.boolean().optional(),
})

export const hmrMedicationUpdateSchema = hmrMedicationCreateSchema.partial()

export const hmrSymptomUpsertSchema = z.object({
  symptom: symptomEnum,
  present: z.boolean().optional(),
  severity: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const hmrActionItemCreateSchema = z.object({
  title: z.string().min(1, 'Action item requires a title'),
  description: z.string().optional().nullable(),
  priority: actionPriorityEnum.optional(),
  status: actionStatusEnum.optional(),
  dueDate: dateTimeSchema.optional(),
  assignedToUserId: z.number().int().positive().optional(),
  resolutionNotes: z.string().optional().nullable(),
})

export const hmrActionItemUpdateSchema = hmrActionItemCreateSchema.partial()

export const hmrAttachmentCreateSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().optional().nullable(),
  storagePath: z.string().min(1),
  uploadedByUserId: z.number().int().positive().optional(),
})

export const hmrAuditLogCreateSchema = z.object({
  changeType: z.string().min(1),
  oldValue: z.any().optional(),
  newValue: z.any().optional(),
  changedByUserId: z.number().int().positive().optional(),
})

export const hmrMedicalHistorySchema = z.object({
  id: z.number().int().positive().optional(),
  year: z.string().max(10).optional().nullable(),
  condition: z.string().min(1, 'Condition is required').max(500),
  notes: z.string().optional().nullable(),
})

export const hmrAllergySchema = z.object({
  id: z.number().int().positive().optional(),
  allergen: z.string().min(1, 'Allergen is required').max(255),
  reaction: z.string().max(255).optional().nullable(),
  severity: z.string().max(50).optional().nullable(),
})

export const hmrPathologySchema = z.object({
  id: z.number().int().positive().optional(),
  date: z.string().max(50).optional().nullable(),
  test: z.string().min(1, 'Test name is required').max(255),
  result: z.string().min(1, 'Result is required').max(500),
  notes: z.string().optional().nullable(),
})

const hmrReviewBaseSchema = z.object({
  patientId: z.number().int().positive(),
  prescriberId: z.number().int().positive().optional(),
  clinicId: z.number().int().positive().optional(),
  referredBy: z.string().optional().nullable(),
  referralDate: dateSchema.optional(),
  referralReason: z.string().optional().nullable(),
  referralNotes: z.string().optional().nullable(),
  status: statusEnum.optional(),
  acceptedAt: dateTimeSchema.optional(),
  scheduledAt: dateTimeSchema.optional(),
  calendarEventId: z.string().optional().nullable(),
  visitLocation: z.string().optional().nullable(),
  visitNotes: z.string().optional().nullable(),
  assessmentSummary: z.string().optional().nullable(),
  pastMedicalHistory: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  pathology: z.string().optional().nullable(),
  medicalGoals: z.string().optional().nullable(),
  goalBarriers: z.string().optional().nullable(),
  livingArrangement: livingArrangementEnum.optional(),
  usesWebster: z.boolean().optional(),
  livesAlone: z.boolean().optional(),
  otherSupports: z.string().optional().nullable(),
  followUpDueAt: dateSchema.optional(),
  claimedAt: dateTimeSchema.optional(),
  reportUrl: z.string().optional().nullable(),
  reportBody: z.string().optional().nullable(),
})

export const hmrReviewCreateSchema = hmrReviewBaseSchema.extend({
  patientId: z.number().int().positive(),
  medications: z.array(hmrMedicationCreateSchema).optional(),
  symptoms: z.array(hmrSymptomUpsertSchema).optional(),
  actionItems: z.array(hmrActionItemCreateSchema).optional(),
})

export const hmrReviewUpdateSchema = hmrReviewBaseSchema.partial().extend({
  patientId: z.number().int().positive().optional(),
  prescriberId: z.number().int().positive().nullable().optional(),
  clinicId: z.number().int().positive().nullable().optional(),
  medicalHistory: z.array(hmrMedicalHistorySchema).optional(),
  allergiesTable: z.array(hmrAllergySchema).optional(),
  pathologyResults: z.array(hmrPathologySchema).optional(),
})

export type HmrMedicationCreateInput = z.infer<typeof hmrMedicationCreateSchema>
export type HmrMedicationUpdateInput = z.infer<typeof hmrMedicationUpdateSchema>
export type HmrSymptomUpsertInput = z.infer<typeof hmrSymptomUpsertSchema>
export type HmrActionItemCreateInput = z.infer<typeof hmrActionItemCreateSchema>
export type HmrActionItemUpdateInput = z.infer<typeof hmrActionItemUpdateSchema>
export type HmrAttachmentCreateInput = z.infer<typeof hmrAttachmentCreateSchema>
export type HmrAuditLogCreateInput = z.infer<typeof hmrAuditLogCreateSchema>
export type HmrMedicalHistoryInput = z.infer<typeof hmrMedicalHistorySchema>
export type HmrAllergyInput = z.infer<typeof hmrAllergySchema>
export type HmrPathologyInput = z.infer<typeof hmrPathologySchema>
export type HmrReviewCreateInput = z.infer<typeof hmrReviewCreateSchema>
export type HmrReviewUpdateInput = z.infer<typeof hmrReviewUpdateSchema>
