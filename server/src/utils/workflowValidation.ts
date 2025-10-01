import type { HmrReviewStatus } from '@prisma/client'

/**
 * Workflow transition rules: defines valid next statuses for each current status
 */
export const WORKFLOW_TRANSITIONS: Record<HmrReviewStatus, HmrReviewStatus[]> =
  {
    PENDING: ['ACCEPTED', 'CANCELLED'],
    ACCEPTED: ['SCHEDULED', 'CANCELLED'],
    SCHEDULED: ['DATA_ENTRY', 'CANCELLED'],
    DATA_ENTRY: ['INTERVIEW', 'CANCELLED'],
    IN_PROGRESS: ['INTERVIEW', 'REPORT_DRAFT', 'CANCELLED'], // Legacy - flexible transitions
    INTERVIEW: ['REPORT_DRAFT', 'CANCELLED'],
    REPORT_DRAFT: ['REPORT_READY', 'INTERVIEW', 'CANCELLED'], // Can go back to interview for corrections
    REPORT_READY: ['SENT_TO_PRESCRIBER', 'REPORT_DRAFT', 'CANCELLED'], // Can go back to draft
    SENT_TO_PRESCRIBER: ['CLAIMED', 'CANCELLED'],
    CLAIMED: ['FOLLOW_UP_DUE', 'COMPLETED', 'CANCELLED'],
    FOLLOW_UP_DUE: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [], // Terminal state
    CANCELLED: [], // Terminal state
  }

/**
 * Status to timestamp field mapping
 */
export const STATUS_TIMESTAMP_MAP: Partial<Record<HmrReviewStatus, string>> = {
  ACCEPTED: 'acceptedAt',
  SCHEDULED: 'scheduledAt',
  DATA_ENTRY: 'dataEntryStartedAt',
  INTERVIEW: 'interviewStartedAt',
  REPORT_DRAFT: 'reportDraftedAt',
  REPORT_READY: 'reportFinalizedAt',
  SENT_TO_PRESCRIBER: 'sentToPrescriberAt',
  CLAIMED: 'claimedAt',
}

/**
 * Validates if a status transition is allowed
 */
export const isValidTransition = (
  currentStatus: HmrReviewStatus,
  newStatus: HmrReviewStatus
): boolean => {
  // Allow staying in same status (no-op)
  if (currentStatus === newStatus) {
    return true
  }

  const allowedTransitions = WORKFLOW_TRANSITIONS[currentStatus]
  return allowedTransitions.includes(newStatus)
}

/**
 * Gets the timestamp field name for a given status
 */
export const getTimestampField = (status: HmrReviewStatus): string | null => {
  return STATUS_TIMESTAMP_MAP[status] || null
}

/**
 * Calculates the follow-up date (3 months from interview completion)
 */
export const calculateFollowUpDate = (interviewDate: Date): Date => {
  const followUpDate = new Date(interviewDate)
  followUpDate.setMonth(followUpDate.getMonth() + 3)
  return followUpDate
}

/**
 * Error thrown when an invalid status transition is attempted
 */
export class InvalidTransitionError extends Error {
  constructor(
    public currentStatus: HmrReviewStatus,
    public attemptedStatus: HmrReviewStatus
  ) {
    super(
      `Invalid status transition from ${currentStatus} to ${attemptedStatus}. ` +
        `Allowed transitions: ${WORKFLOW_TRANSITIONS[currentStatus].join(', ')}`
    )
    this.name = 'InvalidTransitionError'
  }
}

/**
 * Validates status transition and returns error message if invalid
 */
export const validateStatusTransition = (
  currentStatus: HmrReviewStatus,
  newStatus: HmrReviewStatus
): { valid: boolean; error?: string } => {
  if (!isValidTransition(currentStatus, newStatus)) {
    return {
      valid: false,
      error:
        `Cannot transition from ${currentStatus} to ${newStatus}. ` +
        `Allowed next steps: ${WORKFLOW_TRANSITIONS[currentStatus].join(', ')}`,
    }
  }

  return { valid: true }
}
