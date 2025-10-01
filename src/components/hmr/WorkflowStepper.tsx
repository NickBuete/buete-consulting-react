import React from 'react'
import { ChevronRight } from 'lucide-react'
import type { HmrReviewStatus } from '../../types/hmr'
import { WORKFLOW_STAGES } from './WorkflowStatus'

interface WorkflowStepperProps {
  currentStatus: HmrReviewStatus
  compact?: boolean
  className?: string
}

const WORKFLOW_SEQUENCE: HmrReviewStatus[] = [
  'PENDING',
  'ACCEPTED',
  'SCHEDULED',
  'DATA_ENTRY',
  'INTERVIEW',
  'REPORT_READY',
  'SENT_TO_PRESCRIBER',
  'CLAIMED',
  'COMPLETED',
]

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentStatus,
  compact = false,
  className = '',
}) => {
  const currentIndex = WORKFLOW_SEQUENCE.indexOf(currentStatus)
  const currentStage = WORKFLOW_STAGES[currentStatus]

  if (currentStatus === 'CANCELLED') {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        <span className="font-medium text-red-600">Cancelled</span>
      </div>
    )
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="text-sm text-gray-600">
          Step {currentIndex + 1} of {WORKFLOW_SEQUENCE.length}:
        </div>
        <div className="text-sm font-medium text-gray-900">
          {currentStage?.label}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>
          Progress: {currentIndex + 1} of {WORKFLOW_SEQUENCE.length}
        </span>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{
              width: `${
                ((currentIndex + 1) / WORKFLOW_SEQUENCE.length) * 100
              }%`,
            }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {WORKFLOW_SEQUENCE.map((status, index) => {
          const stage = WORKFLOW_STAGES[status]
          const isActive = index === currentIndex
          const isPassed = index < currentIndex

          return (
            <React.Fragment key={status}>
              <div
                className={`
                  text-xs px-2 py-1 rounded
                  ${isActive ? 'bg-blue-100 text-blue-700 font-medium' : ''}
                  ${isPassed ? 'bg-gray-100 text-gray-500' : ''}
                  ${!isActive && !isPassed ? 'text-gray-400' : ''}
                `}
              >
                {stage.label}
              </div>
              {index < WORKFLOW_SEQUENCE.length - 1 && (
                <ChevronRight className="w-3 h-3 text-gray-400" />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
