import React from 'react'
import { Check, Circle } from 'lucide-react'
import type { HmrReviewStatus } from '../../types/hmr'
import { WORKFLOW_STAGES } from './WorkflowStatus'

interface WorkflowProgressProps {
  currentStatus: HmrReviewStatus
  className?: string
}

// Define the main workflow stages (excluding legacy and cancelled)
const MAIN_WORKFLOW: HmrReviewStatus[] = [
  'PENDING',
  'ACCEPTED',
  'SCHEDULED',
  'DATA_ENTRY',
  'INTERVIEW',
  'REPORT_DRAFT',
  'REPORT_READY',
  'SENT_TO_PRESCRIBER',
  'CLAIMED',
  'FOLLOW_UP_DUE',
  'COMPLETED',
]

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({
  currentStatus,
  className = '',
}) => {
  const currentOrder = WORKFLOW_STAGES[currentStatus]?.order || 0

  // Don't show progress for cancelled
  if (currentStatus === 'CANCELLED') {
    return (
      <div className={`text-center py-4 ${className}`}>
        <span className="text-sm text-gray-500">Review Cancelled</span>
      </div>
    )
  }

  return (
    <div className={`py-6 ${className}`}>
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-blue-600 transition-all duration-500"
          style={{
            width: `${(currentOrder / MAIN_WORKFLOW.length) * 100}%`,
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {MAIN_WORKFLOW.map((status) => {
            const stage = WORKFLOW_STAGES[status]
            const isPast = stage.order < currentOrder
            const isCurrent = stage.order === currentOrder

            return (
              <div
                key={status}
                className="flex flex-col items-center gap-2 flex-1"
              >
                {/* Circle indicator */}
                <div
                  className={`
                    relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 
                    transition-all duration-300
                    ${
                      isPast
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : isCurrent
                        ? 'bg-white border-blue-600 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-400'
                    }
                  `}
                >
                  {isPast ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Circle
                      className={`w-5 h-5 ${isCurrent ? 'fill-current' : ''}`}
                    />
                  )}
                </div>

                {/* Label */}
                <div className="text-center max-w-[100px]">
                  <div
                    className={`
                      text-xs font-medium mb-1 
                      ${isPast || isCurrent ? 'text-gray-900' : 'text-gray-400'}
                    `}
                  >
                    {stage.label}
                  </div>
                  {isCurrent && (
                    <div className="text-xs text-gray-500 line-clamp-2">
                      {stage.description}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
