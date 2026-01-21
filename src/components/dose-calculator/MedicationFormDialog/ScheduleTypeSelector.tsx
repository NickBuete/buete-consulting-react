import React from 'react';
import { TrendingUp, RefreshCw, Calendar, Layers } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { ScheduleType } from '../../../types/doseCalculator';

interface ScheduleTypeOption {
  type: ScheduleType;
  label: string;
  description: string;
  icon: React.ReactNode;
  example: string;
}

const scheduleTypes: ScheduleTypeOption[] = [
  {
    type: 'linear',
    label: 'Linear Titration',
    description: 'Gradually increase or decrease dose over time',
    icon: <TrendingUp className="h-6 w-6" />,
    example: 'e.g., Prednisolone taper',
  },
  {
    type: 'cyclic',
    label: 'Cyclic Dosing',
    description: 'Repeat pattern of days on and days off',
    icon: <RefreshCw className="h-6 w-6" />,
    example: 'e.g., Methotrexate weekly',
  },
  {
    type: 'dayOfWeek',
    label: 'Day-of-Week',
    description: 'Different doses for specific days',
    icon: <Calendar className="h-6 w-6" />,
    example: 'e.g., Warfarin dosing',
  },
  {
    type: 'multiPhase',
    label: 'Multi-Phase',
    description: 'Custom phases with different doses',
    icon: <Layers className="h-6 w-6" />,
    example: 'e.g., Complex tapers',
  },
];

interface ScheduleTypeSelectorProps {
  value: ScheduleType;
  onChange: (type: ScheduleType) => void;
}

export const ScheduleTypeSelector: React.FC<ScheduleTypeSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {scheduleTypes.map((option) => {
        const isSelected = value === option.type;

        return (
          <button
            key={option.type}
            type="button"
            onClick={() => onChange(option.type)}
            className={cn(
              'relative flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all duration-200',
              'hover:border-brand-400 hover:bg-brand-50/50',
              'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
              isSelected
                ? 'border-brand-600 bg-brand-50 shadow-sm'
                : 'border-gray-200 bg-white'
            )}
          >
            {/* Selection indicator */}
            <div
              className={cn(
                'absolute top-3 right-3 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all',
                isSelected
                  ? 'border-brand-600 bg-brand-600'
                  : 'border-gray-300 bg-white'
              )}
            >
              {isSelected && (
                <div className="h-2 w-2 rounded-full bg-white" />
              )}
            </div>

            {/* Icon */}
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-lg mb-3 transition-colors',
                isSelected
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              )}
            >
              {option.icon}
            </div>

            {/* Content */}
            <h3
              className={cn(
                'font-semibold text-base mb-1',
                isSelected ? 'text-brand-900' : 'text-gray-900'
              )}
            >
              {option.label}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{option.description}</p>
            <p className="text-xs text-gray-400 italic">{option.example}</p>
          </button>
        );
      })}
    </div>
  );
};
