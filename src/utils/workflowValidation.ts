import type { HmrReviewStatus } from '../types/hmr'

/**
 * Workflow transition rules matching backend
 */
export const WORKFLOW_TRANSITIONS: Record<HmrReviewStatus, HmrReviewStatus[]> =
  {
    PENDING: ['ACCEPTED', 'CANCELLED'],
    ACCEPTED: ['SCHEDULED', 'CANCELLED'],
    SCHEDULED: ['DATA_ENTRY', 'CANCELLED'],
    DATA_ENTRY: ['INTERVIEW', 'CANCELLED'],
    IN_PROGRESS: ['INTERVIEW', 'REPORT_DRAFT', 'CANCELLED'],
    INTERVIEW: ['REPORT_DRAFT', 'CANCELLED'],
    REPORT_DRAFT: ['REPORT_READY', 'INTERVIEW', 'CANCELLED'],
    REPORT_READY: ['SENT_TO_PRESCRIBER', 'REPORT_DRAFT', 'CANCELLED'],
    SENT_TO_PRESCRIBER: ['CLAIMED', 'CANCELLED'],
    CLAIMED: ['FOLLOW_UP_DUE', 'COMPLETED', 'CANCELLED'],
    FOLLOW_UP_DUE: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  }

/**
 * Checks if a status transition is valid
 */
export const canTransitionTo = (
  currentStatus: HmrReviewStatus,
  targetStatus: HmrReviewStatus
): boolean => {
  if (currentStatus === targetStatus) return true
  return WORKFLOW_TRANSITIONS[currentStatus]?.includes(targetStatus) || false
}

/**
 * Gets available next statuses for current status
 */
export const getAvailableTransitions = (
  currentStatus: HmrReviewStatus
): HmrReviewStatus[] => {
  return WORKFLOW_TRANSITIONS[currentStatus] || []
}

/**
 * Gets user-friendly error message for invalid transition
 */
export const getTransitionError = (
  currentStatus: HmrReviewStatus,
  targetStatus: HmrReviewStatus
): string => {
  const available = WORKFLOW_TRANSITIONS[currentStatus]
  if (!available || available.length === 0) {
    return `Review is in ${currentStatus} state and cannot be changed.`
  }

  return `Cannot move from ${currentStatus} to ${targetStatus}. Available next steps: ${available.join(
    ', '
  )}`
}

/**
 * Workflow stage descriptions for UI
 */
export const WORKFLOW_STAGE_ACTIONS: Record<
  HmrReviewStatus,
  {
    actionLabel: string
    description: string
    icon: string
  }
> = {
  PENDING: {
    actionLabel: 'Accept Referral',
    description: 'Review and accept this referral',
    icon: '📥',
  },
  ACCEPTED: {
    actionLabel: 'Schedule Interview',
    description: 'Set up appointment with patient',
    icon: '📅',
  },
  SCHEDULED: {
    actionLabel: 'Start Data Entry',
    description: 'Begin collecting patient information',
    icon: '📝',
  },
  DATA_ENTRY: {
    actionLabel: 'Start Interview',
    description: 'Conduct patient interview',
    icon: '💬',
  },
  IN_PROGRESS: {
    actionLabel: 'Continue',
    description: 'Continue with workflow',
    icon: '⏩',
  },
  INTERVIEW: {
    actionLabel: 'Generate Report',
    description: 'Create HMR report',
    icon: '📄',
  },
  REPORT_DRAFT: {
    actionLabel: 'Finalize Report',
    description: 'Review and finalize report',
    icon: '✅',
  },
  REPORT_READY: {
    actionLabel: 'Send to Prescriber',
    description: 'Email report to prescriber',
    icon: '📧',
  },
  SENT_TO_PRESCRIBER: {
    actionLabel: 'Mark as Claimed',
    description: 'Claim for billing',
    icon: '💰',
  },
  CLAIMED: {
    actionLabel: 'Complete',
    description: 'Mark as completed',
    icon: '🎉',
  },
  FOLLOW_UP_DUE: {
    actionLabel: 'Complete Follow-up',
    description: 'Complete 3-month follow-up',
    icon: '✓',
  },
  COMPLETED: {
    actionLabel: 'Completed',
    description: 'This review is complete',
    icon: '✅',
  },
  CANCELLED: {
    actionLabel: 'Cancelled',
    description: 'This review was cancelled',
    icon: '❌',
  },
}

/**
 * Gets the primary next action for a given status
 */
export const getPrimaryAction = (
  currentStatus: HmrReviewStatus
): HmrReviewStatus | null => {
  const transitions = WORKFLOW_TRANSITIONS[currentStatus]
  if (!transitions || transitions.length === 0) return null

  // Return first non-cancelled option
  return transitions.find((t) => t !== 'CANCELLED') || null
}
