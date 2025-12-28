/**
 * AvailabilitySlotList Component
 * Display and manage availability slots by day
 */

import React from 'react';
import { Button } from '../ui/Button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { AvailabilitySlot } from '../../types/booking';
import { formatBookingTime } from '../../utils/booking';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

interface AvailabilitySlotListProps {
  slots: AvailabilitySlot[];
  onAdd: (dayOfWeek: number) => void;
  onEdit: (slot: AvailabilitySlot) => void;
  onDelete: (slotId: number) => void;
  onToggle: (slot: AvailabilitySlot) => void;
}

export const AvailabilitySlotList: React.FC<AvailabilitySlotListProps> = ({
  slots,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
}) => {
  const getSlotsForDay = (dayOfWeek: number) => {
    return slots.filter((slot) => slot.dayOfWeek === dayOfWeek);
  };

  const handleDelete = (slotId: number) => {
    if (window.confirm('Are you sure you want to delete this availability slot?')) {
      onDelete(slotId);
    }
  };

  return (
    <div className="space-y-4">
      {DAYS_OF_WEEK.map((dayName, dayIndex) => {
        const daySlots = getSlotsForDay(dayIndex);

        return (
          <div key={dayIndex} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{dayName}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAdd(dayIndex)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Slot
              </Button>
            </div>

            {daySlots.length === 0 ? (
              <p className="text-sm text-gray-500">No availability set for this day</p>
            ) : (
              <div className="space-y-2">
                {daySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`flex items-center justify-between p-3 rounded-md ${
                      slot.isAvailable
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium">
                        {formatBookingTime(slot.startTime)} -{' '}
                        {formatBookingTime(slot.endTime)}
                      </div>
                      <button
                        onClick={() => onToggle(slot)}
                        className={`text-xs px-2 py-1 rounded-full ${
                          slot.isAvailable
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {slot.isAvailable ? 'Active' : 'Disabled'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(slot)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(slot.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
