export type HmrReviewStatus =
  | 'PENDING' // Initial referral received
  | 'ACCEPTED' // Referral accepted by pharmacist
  | 'SCHEDULED' // Interview appointment scheduled
  | 'DATA_ENTRY' // Collecting past med history, medications, allergies, pathology
  | 'IN_PROGRESS' // Legacy status - maps to INTERVIEW (keeping for backward compatibility)
  | 'INTERVIEW' // Conducting patient interview with questionnaire
  | 'REPORT_DRAFT' // Generating report with AI assistance
  | 'REPORT_READY' // Report finalized and ready to send
  | 'SENT_TO_PRESCRIBER' // Report emailed to prescriber
  | 'CLAIMED' // Claimed for billing
  | 'FOLLOW_UP_DUE' // 3-month follow-up due
  | 'COMPLETED' // Fully completed including follow-up
  | 'CANCELLED' // Cancelled/abandoned

export type LivingArrangement =
  | 'ALONE'
  | 'WITH_FAMILY'
  | 'WITH_CARER'
  | 'RESIDENTIAL_AGED_CARE'
  | 'OTHER'

export type ActionPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export type ActionStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export type MedicationStatus = 'CURRENT' | 'CEASED' | 'NEEDS_REVIEW' | 'OTC'

export type SymptomType =
  | 'DIZZINESS'
  | 'FALLS'
  | 'DROWSINESS'
  | 'NAUSEA'
  | 'HEADACHE'
  | 'PAIN'
  | 'MOBILITY'
  | 'OTHER'

export interface Clinic {
  id: number
  name: string
  contactEmail: string | null
  contactPhone: string | null
  addressLine1: string | null
  addressLine2: string | null
  suburb: string | null
  state: string | null
  postcode: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface Prescriber {
  id: number
  clinicId: number | null
  honorific: string | null
  firstName: string
  lastName: string
  providerNumber: string | null
  contactEmail: string | null
  contactPhone: string | null
  notes: string | null
  clinic?: Clinic | null
  createdAt: string
  updatedAt: string
}

export interface Patient {
  id: number
  clientId: number | null
  firstName: string
  lastName: string
  preferredName: string | null
  dateOfBirth: string | null
  contactEmail: string | null
  contactPhone: string | null
  addressLine1: string | null
  addressLine2: string | null
  suburb: string | null
  state: string | null
  postcode: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  medicareNumber: string | null
  livesAlone: boolean | null
  livingArrangement: LivingArrangement | null
  usesWebster: boolean | null
  otherSupports: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface HmrMedication {
  id: number
  hmrReviewId: number
  medicationId: number | null
  name: string
  dose: string | null
  frequency: string | null
  indication: string | null
  status: MedicationStatus
  isNew: boolean | null
  isChanged: boolean | null
  notes: string | null
  verificationRequired: boolean | null
  createdAt: string
  updatedAt: string
}

export interface HmrSymptom {
  id: number
  hmrReviewId: number
  symptom: SymptomType
  present: boolean
  severity: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface HmrActionItem {
  id: number
  hmrReviewId: number
  title: string
  description: string | null
  priority: ActionPriority
  status: ActionStatus
  dueDate: string | null
  assignedToUserId: number | null
  resolutionNotes: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface HmrAttachment {
  id: number
  hmrReviewId: number
  fileName: string
  mimeType: string | null
  storagePath: string
  uploadedByUserId: number | null
  createdAt: string
}

export interface HmrAuditLog {
  id: number
  hmrReviewId: number
  changedByUserId: number | null
  changeType: string
  oldValue: unknown
  newValue: unknown
  createdAt: string
}

export interface HmrReview {
  id: number
  patientId: number
  prescriberId: number | null
  clinicId: number | null
  referredBy: string | null
  referralDate: string | null
  referralReason: string | null
  referralNotes: string | null
  status: HmrReviewStatus
  acceptedAt: string | null
  scheduledAt: string | null
  dataEntryStartedAt: string | null
  interviewStartedAt: string | null
  interviewCompletedAt: string | null
  reportDraftedAt: string | null
  reportFinalizedAt: string | null
  sentToPrescriberAt: string | null
  calendarEventId: string | null
  visitLocation: string | null
  visitNotes: string | null
  assessmentSummary: string | null
  pastMedicalHistory: string | null
  allergies: string | null
  pathology: string | null
  medicalGoals: string | null
  goalBarriers: string | null
  livingArrangement: LivingArrangement | null
  usesWebster: boolean | null
  livesAlone: boolean | null
  otherSupports: string | null
  followUpDueAt: string | null
  claimedAt: string | null
  reportUrl: string | null
  reportBody: string | null
  reportContent: string | null // HTML content for TipTap editor
  // Interview symptom fields
  dizziness: string | null
  drowsiness: string | null
  fatigue: string | null
  memory: string | null
  anxiety: string | null
  sleep: string | null
  headaches: string | null
  pain: string | null
  mobility: string | null
  falls: string | null
  bladderControl: string | null
  bowelControl: string | null
  nightSymptoms: string | null
  signsOfBleeding: string | null
  rashes: string | null
  bruising: string | null
  socialSupport: string | null
  createdAt: string
  updatedAt: string
  patient?: Patient
  prescriber?: Prescriber | null
  clinic?: Clinic | null
  user?: { id: number; name: string; mrnNumber?: string | null } | null
  medications?: HmrMedication[]
  symptoms?: HmrSymptom[]
  actionItems?: HmrActionItem[]
  attachments?: HmrAttachment[]
  auditLogs?: HmrAuditLog[]
}

export interface CreatePatientPayload {
  firstName: string
  lastName: string
  dateOfBirth?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  notes?: string | null
  livesAlone?: boolean | null
  usesWebster?: boolean | null
}

export interface CreatePrescriberPayload {
  honorific?: string | null
  firstName: string
  lastName: string
  providerNumber?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  clinicId?: number | null
  clinic?: Partial<Clinic> | null
  notes?: string | null
}

export interface CreateClinicPayload {
  name: string
  contactEmail?: string | null
  contactPhone?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  suburb?: string | null
  state?: string | null
  postcode?: string | null
  notes?: string | null
}

export interface CreateHmrReviewPayload {
  patientId: number
  prescriberId?: number | null
  clinicId?: number | null
  referralDate?: string | null
  referralReason?: string | null
  status?: HmrReviewStatus
  scheduledAt?: string | null
  followUpDueAt?: string | null
  visitLocation?: string | null
  visitNotes?: string | null
}

export interface DashboardSnapshot {
  totalPatients: number
  activeReviews: number
  followUpsDue: number
  prescriberCount: number
}
