import React from 'react'
import { ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '../ui'
import type { HmrReviewStatus } from '../../types/hmr'
import {
  getAvailableTransitions,
  WORKFLOW_STAGE_ACTIONS,
  getPrimaryAction,
} from '../../utils/workflowValidation'

interface WorkflowActionButtonProps {
  currentStatus: HmrReviewStatus
  onTransition: (newStatus: HmrReviewStatus) => Promise<void>
  loading?: boolean
  disabled?: boolean
  className?: string
}

export const WorkflowActionButton: React.FC<WorkflowActionButtonProps> = ({
  currentStatus,
  onTransition,
  loading = false,
  disabled = false,
  className = '',
}) => {
  const [isTransitioning, setIsTransitioning] = React.useState(false)
  const availableTransitions = getAvailableTransitions(currentStatus)
  const primaryAction = getPrimaryAction(currentStatus)

  // If no transitions available, show disabled state
  if (availableTransitions.length === 0) {
    const stageInfo = WORKFLOW_STAGE_ACTIONS[currentStatus]
    return (
      <Button variant="outline" disabled className={className}>
        {stageInfo.icon} {stageInfo.actionLabel}
      </Button>
    )
  }

  const handleTransition = async (newStatus: HmrReviewStatus) => {
    setIsTransitioning(true)
    try {
      await onTransition(newStatus)
    } catch (error) {
      console.error('Transition error:', error)
    } finally {
      setIsTransitioning(false)
    }
  }

  // If only one transition (likely cancelled), show simple button
  if (availableTransitions.length === 1 || !primaryAction) {
    const nextStatus = availableTransitions[0]
    const stageInfo = WORKFLOW_STAGE_ACTIONS[nextStatus]
    return (
      <Button
        onClick={() => handleTransition(nextStatus)}
        disabled={disabled || loading || isTransitioning}
        variant={nextStatus === 'CANCELLED' ? 'destructive' : 'default'}
        className={className}
      >
        {(loading || isTransitioning) && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {!loading && !isTransitioning && `${stageInfo.icon} `}
        {stageInfo.actionLabel}
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    )
  }

  // Multiple transitions available - show primary action with dropdown later
  const primaryInfo = WORKFLOW_STAGE_ACTIONS[primaryAction]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        onClick={() => handleTransition(primaryAction)}
        disabled={disabled || loading || isTransitioning}
        variant="default"
        className="flex-1"
      >
        {(loading || isTransitioning) && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {!loading && !isTransitioning && `${primaryInfo.icon} `}
        {primaryInfo.actionLabel}
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>

      {availableTransitions.includes('CANCELLED') && (
        <Button
          onClick={() => handleTransition('CANCELLED')}
          disabled={disabled || loading || isTransitioning}
          variant="outline"
          size="sm"
        >
          Cancel
        </Button>
      )}
    </div>
  )
}
