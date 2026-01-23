import React, { useCallback } from 'react';
import { Clock, Plus, Minus, GripVertical } from 'lucide-react';
import { generateTimeSlots, type PDTimeSlot } from '../../../../types/parkinsonsMedications';

interface PDTimeSlotConfigProps {
  slots: PDTimeSlot[];
  onSlotsChange: (slots: PDTimeSlot[]) => void;
  minSlots?: number;
  maxSlots?: number;
  disabled?: boolean;
}

export const PDTimeSlotConfig: React.FC<PDTimeSlotConfigProps> = ({
  slots,
  onSlotsChange,
  minSlots = 1,
  maxSlots = 8,
  disabled = false,
}) => {
  const slotCount = slots.length;

  const handleSlotCountChange = useCallback(
    (newCount: number) => {
      if (newCount < minSlots || newCount > maxSlots) return;

      if (newCount > slotCount) {
        // Adding slots - generate new ones with appropriate times
        const newSlots = generateTimeSlots(newCount);
        // Preserve existing labels where possible
        const merged = newSlots.map((newSlot, idx) => {
          if (idx < slots.length) {
            return { ...slots[idx], order: idx + 1 };
          }
          return newSlot;
        });
        onSlotsChange(merged);
      } else {
        // Removing slots - keep first N
        onSlotsChange(slots.slice(0, newCount).map((s, idx) => ({ ...s, order: idx + 1 })));
      }
    },
    [slots, slotCount, minSlots, maxSlots, onSlotsChange]
  );

  const handleLabelChange = useCallback(
    (slotId: string, newLabel: string) => {
      onSlotsChange(
        slots.map(s => (s.id === slotId ? { ...s, label: newLabel } : s))
      );
    },
    [slots, onSlotsChange]
  );

  const handleTimeChange = useCallback(
    (slotId: string, newTime: string) => {
      // Update the time
      const updated = slots.map(s => (s.id === slotId ? { ...s, defaultTime: newTime } : s));

      // Auto-sort by time (slots with time set come first, sorted by time; then slots without time)
      const sorted = [...updated].sort((a, b) => {
        // Both have times - sort by time
        if (a.defaultTime && b.defaultTime) {
          return a.defaultTime.localeCompare(b.defaultTime);
        }
        // Only a has time - a comes first
        if (a.defaultTime && !b.defaultTime) return -1;
        // Only b has time - b comes first
        if (!a.defaultTime && b.defaultTime) return 1;
        // Neither has time - maintain original order
        return a.order - b.order;
      });

      // Update order numbers
      const reordered = sorted.map((s, idx) => ({ ...s, order: idx + 1 }));
      onSlotsChange(reordered);
    },
    [slots, onSlotsChange]
  );

  const quickSelectCounts = [3, 4, 5, 6, 7, 8];

  return (
    <div className={`space-y-6 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Slot count selector */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Number of doses per day
        </label>

        {/* Quick select buttons */}
        <div className="flex flex-wrap gap-2">
          {quickSelectCounts.map(count => (
            <button
              key={count}
              type="button"
              onClick={() => handleSlotCountChange(count)}
              disabled={disabled}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                slotCount === count
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {count}
            </button>
          ))}
        </div>

        {/* Fine adjustment */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSlotCountChange(slotCount - 1)}
            disabled={disabled || slotCount <= minSlots}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="text-lg font-medium w-8 text-center">{slotCount}</span>
          <button
            type="button"
            onClick={() => handleSlotCountChange(slotCount + 1)}
            disabled={disabled || slotCount >= maxSlots}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
          </button>
          <span className="text-sm text-gray-500">
            doses per day ({minSlots}-{maxSlots})
          </span>
        </div>
      </div>

      {/* Time slot labels */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Dose time labels
        </label>
        <p className="text-sm text-gray-500">
          Customize labels for each dose time (e.g., "6am", "Before breakfast", "With lunch")
        </p>

        <div className="space-y-2">
          {slots.map((slot, index) => (
            <div
              key={slot.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              {/* Drag handle (visual only for now) */}
              <GripVertical className="h-5 w-5 text-gray-400 flex-shrink-0" />

              {/* Slot number */}
              <span className="w-8 h-8 flex items-center justify-center bg-brand-100 text-brand-700 rounded-full font-medium text-sm flex-shrink-0">
                {index + 1}
              </span>

              {/* Label input */}
              <input
                type="text"
                value={slot.label}
                onChange={e => handleLabelChange(slot.id, e.target.value)}
                placeholder={`Dose ${index + 1}`}
                disabled={disabled}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />

              {/* Time input */}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <input
                  type="time"
                  value={slot.defaultTime || ''}
                  onChange={e => handleTimeChange(slot.id, e.target.value)}
                  disabled={disabled}
                  className="px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm font-medium text-blue-800 mb-2">Preview</p>
        <div className="flex flex-wrap gap-2">
          {slots.map(slot => (
            <span
              key={slot.id}
              className="px-3 py-1 bg-white border border-blue-200 rounded-full text-sm text-blue-700"
            >
              {slot.label || `Dose ${slot.order}`}
              {slot.defaultTime && (
                <span className="text-blue-500 ml-1">({slot.defaultTime})</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PDTimeSlotConfig;
