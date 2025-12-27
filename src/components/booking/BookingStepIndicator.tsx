/**
 * Booking Step Indicator
 * Extracted from InlineBookingWidget.tsx lines 188-246
 * Visual progress indicator for multi-step booking flow
 */

import React from 'react';
import { CheckCircle } from 'lucide-react';
import type { BookingStep } from '../../hooks/useBookingWidget';

interface BookingStepIndicatorProps {
  currentStep: BookingStep;
  selectedDate: Date | null;
  selectedTime: string | null;
}

interface StepConfig {
  id: BookingStep;
  label: string;
  number: number;
}

const steps: StepConfig[] = [
  { id: 'date', label: 'Date', number: 1 },
  { id: 'time', label: 'Time', number: 2 },
  { id: 'form', label: 'Details', number: 3 },
];

export const BookingStepIndicator: React.FC<BookingStepIndicatorProps> = ({
  currentStep,
  selectedDate,
  selectedTime,
}) => {
  const getStepStatus = (step: StepConfig) => {
    if (step.id === 'date') {
      return {
        isActive: currentStep === 'date',
        isCompleted: selectedDate !== null,
      };
    }
    if (step.id === 'time') {
      return {
        isActive: currentStep === 'time',
        isCompleted: selectedTime !== null,
      };
    }
    if (step.id === 'form') {
      return {
        isActive: currentStep === 'form',
        isCompleted: false,
      };
    }
    return { isActive: false, isCompleted: false };
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      {steps.map((step, index) => {
        const { isActive, isCompleted } = getStepStatus(step);
        const isLastStep = index === steps.length - 1;

        return (
          <React.Fragment key={step.id}>
            <div
              className={`flex items-center gap-2 ${
                isActive ? 'text-blue-600 font-medium' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {isCompleted ? <CheckCircle className="h-4 w-4" /> : step.number}
              </div>
              <span>{step.label}</span>
            </div>
            {!isLastStep && <div className="flex-1 h-px bg-gray-200" />}
          </React.Fragment>
        );
      })}
    </div>
  );
};
