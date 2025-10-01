import React from 'react'
import { Badge } from '../ui'
import type { HmrReviewStatus } from '../../types/hmr'

// Workflow configuration for each status
export const WORKFLOW_STAGES = {
  PENDING: {
    label: 'Pending',
    description: 'Referral received, awaiting acceptance',
    color: 'outline' as const,
    order: 1,
  },
  ACCEPTED: {
    label: 'Accepted',
    description: 'Referral accepted by pharmacist',
    color: 'secondary' as const,
    order: 2,
  },
  SCHEDULED: {
    label: 'Scheduled',
    description: 'Interview appointment scheduled',
    color: 'secondary' as const,
    order: 3,
  },
  DATA_ENTRY: {
    label: 'Data Entry',
    description: 'Collecting patient history and medications',
    color: 'default' as const,
    order: 4,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    description: 'Legacy status',
    color: 'default' as const,
    order: 5,
  },
  INTERVIEW: {
    label: 'Interview',
    description: 'Conducting patient interview',
    color: 'default' as const,
    order: 6,
  },
  REPORT_DRAFT: {
    label: 'Report Draft',
    description: 'Generating report with AI',
    color: 'default' as const,
    order: 7,
  },
  REPORT_READY: {
    label: 'Report Ready',
    description: 'Report finalized and ready to send',
    color: 'default' as const,
    order: 8,
  },
  SENT_TO_PRESCRIBER: {
    label: 'Sent to Prescriber',
    description: 'Report emailed to prescriber',
    color: 'secondary' as const,
    order: 9,
  },
  CLAIMED: {
    label: 'Claimed',
    description: 'Claimed for billing',
    color: 'default' as const,
    order: 10,
  },
  FOLLOW_UP_DUE: {
    label: 'Follow-up Due',
    description: '3-month follow-up due',
    color: 'outline' as const,
    order: 11,
  },
  COMPLETED: {
    label: 'Completed',
    description: 'Fully completed',
    color: 'secondary' as const,
    order: 12,
  },
  CANCELLED: {
    label: 'Cancelled',
    description: 'Cancelled or abandoned',
    color: 'destructive' as const,
    order: 99,
  },
} as const

export const getNextStatus = (
  currentStatus: HmrReviewStatus
): HmrReviewStatus | null => {
  const statusMap: Record<HmrReviewStatus, HmrReviewStatus | null> = {
    PENDING: 'ACCEPTED',
    ACCEPTED: 'SCHEDULED',
    SCHEDULED: 'DATA_ENTRY',
    DATA_ENTRY: 'INTERVIEW',
    IN_PROGRESS: 'INTERVIEW',
    INTERVIEW: 'REPORT_DRAFT',
    REPORT_DRAFT: 'REPORT_READY',
    REPORT_READY: 'SENT_TO_PRESCRIBER',
    SENT_TO_PRESCRIBER: 'CLAIMED',
    CLAIMED: 'FOLLOW_UP_DUE',
    FOLLOW_UP_DUE: 'COMPLETED',
    COMPLETED: null,
    CANCELLED: null,
  }
  return statusMap[currentStatus]
}

interface WorkflowStatusProps {
  status: HmrReviewStatus
  showDescription?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const WorkflowStatus: React.FC<WorkflowStatusProps> = ({
  status,
  showDescription = false,
  size = 'md',
}) => {
  const stage = WORKFLOW_STAGES[status]

  if (!stage) {
    return (
      <Badge variant="outline" className="text-xs">
        Unknown
      </Badge>
    )
  }

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className="flex flex-col gap-1">
      <Badge variant={stage.color} className={sizeClasses[size]}>
        {stage.label}
      </Badge>
      {showDescription && (
        <span className="text-xs text-gray-500">{stage.description}</span>
      )}
    </div>
  )
}
