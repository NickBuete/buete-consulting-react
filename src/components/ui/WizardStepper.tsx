import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface WizardStep {
  id: string;
  label: string;
  description?: string;
}

interface WizardStepperProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  allowNavigation?: boolean;
}

export const WizardStepper: React.FC<WizardStepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  allowNavigation = true,
}) => {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = allowNavigation && (isCompleted || isCurrent);

          return (
            <li key={step.id} className="flex-1 relative">
              <div className="flex flex-col items-center">
                {/* Connector line - before */}
                {index > 0 && (
                  <div
                    className={cn(
                      'absolute top-5 right-1/2 w-full h-0.5 -translate-y-1/2',
                      isCompleted || isCurrent ? 'bg-brand-600' : 'bg-gray-200'
                    )}
                    style={{ width: 'calc(100% - 2.5rem)', right: 'calc(50% + 1.25rem)' }}
                  />
                )}

                {/* Step circle */}
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick?.(index)}
                  disabled={!isClickable}
                  className={cn(
                    'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200',
                    isCompleted && 'bg-brand-600 border-brand-600 text-white',
                    isCurrent && 'border-brand-600 bg-white text-brand-600 ring-4 ring-brand-100',
                    !isCompleted && !isCurrent && 'border-gray-300 bg-white text-gray-400',
                    isClickable && 'cursor-pointer hover:ring-2 hover:ring-brand-200',
                    !isClickable && 'cursor-default'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </button>

                {/* Step label */}
                <div className="mt-2 text-center">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isCurrent && 'text-brand-600',
                      isCompleted && 'text-gray-900',
                      !isCompleted && !isCurrent && 'text-gray-500'
                    )}
                  >
                    {step.label}
                  </span>
                  {step.description && (
                    <p className="text-xs text-gray-500 mt-0.5 hidden md:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
