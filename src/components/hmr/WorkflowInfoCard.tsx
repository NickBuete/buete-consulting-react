import React from 'react'
import { Clock, Calendar, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui'
import type { HmrReview } from '../../types/hmr'
import { WorkflowStatus } from './WorkflowStatus'
import { WorkflowActionButton } from './WorkflowActionButton'
import { formatDate } from '../../utils/dashboard'

interface WorkflowInfoCardProps {
  review: HmrReview
  onStatusChange: (newStatus: HmrReview['status']) => Promise<void>
  loading?: boolean
  className?: string
}

export const WorkflowInfoCard: React.FC<WorkflowInfoCardProps> = ({
  review,
  onStatusChange,
  loading = false,
  className = '',
}) => {
  // Get relevant timestamps based on current status
  const getRelevantTimestamps = () => {
    const timestamps: Array<{
      label: string
      date: string | null
      icon: React.ReactNode
    }> = []

    if (review.referralDate) {
      timestamps.push({
        label: 'Referral Date',
        date: review.referralDate,
        icon: <Calendar className="w-4 h-4" />,
      })
    }

    if (review.acceptedAt) {
      timestamps.push({
        label: 'Accepted',
        date: review.acceptedAt,
        icon: <CheckCircle2 className="w-4 h-4" />,
      })
    }

    if (review.scheduledAt) {
      timestamps.push({
        label: 'Scheduled',
        date: review.scheduledAt,
        icon: <Clock className="w-4 h-4" />,
      })
    }

    if (review.dataEntryStartedAt) {
      timestamps.push({
        label: 'Data Entry Started',
        date: review.dataEntryStartedAt,
        icon: <CheckCircle2 className="w-4 h-4" />,
      })
    }

    if (review.interviewStartedAt) {
      timestamps.push({
        label: 'Interview Started',
        date: review.interviewStartedAt,
        icon: <Clock className="w-4 h-4" />,
      })
    }

    if (review.interviewCompletedAt) {
      timestamps.push({
        label: 'Interview Completed',
        date: review.interviewCompletedAt,
        icon: <CheckCircle2 className="w-4 h-4" />,
      })
    }

    if (review.reportDraftedAt) {
      timestamps.push({
        label: 'Report Drafted',
        date: review.reportDraftedAt,
        icon: <CheckCircle2 className="w-4 h-4" />,
      })
    }

    if (review.reportFinalizedAt) {
      timestamps.push({
        label: 'Report Finalized',
        date: review.reportFinalizedAt,
        icon: <CheckCircle2 className="w-4 h-4" />,
      })
    }

    if (review.sentToPrescriberAt) {
      timestamps.push({
        label: 'Sent to Prescriber',
        date: review.sentToPrescriberAt,
        icon: <CheckCircle2 className="w-4 h-4" />,
      })
    }

    if (review.claimedAt) {
      timestamps.push({
        label: 'Claimed',
        date: review.claimedAt,
        icon: <CheckCircle2 className="w-4 h-4" />,
      })
    }

    if (review.followUpDueAt) {
      timestamps.push({
        label: 'Follow-up Due',
        date: review.followUpDueAt,
        icon: <Clock className="w-4 h-4" />,
      })
    }

    return timestamps.slice(-3) // Show last 3 relevant timestamps
  }

  const timestamps = getRelevantTimestamps()

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <span>Workflow Status</span>
          <WorkflowStatus status={review.status} showDescription={false} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timeline */}
        {timestamps.length > 0 && (
          <div className="space-y-2">
            {timestamps.map((ts, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                {ts.icon}
                <span className="font-medium">{ts.label}:</span>
                <span>{formatDate(ts.date)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Patient Info */}
        <div className="pt-2 border-t">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Patient:</span>{' '}
            {review.patient?.firstName} {review.patient?.lastName}
          </div>
          {review.prescriber && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Prescriber:</span>{' '}
              {review.prescriber.firstName} {review.prescriber.lastName}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <WorkflowActionButton
            currentStatus={review.status}
            onTransition={onStatusChange}
            loading={loading}
          />
        </div>
      </CardContent>
    </Card>
  )
}
