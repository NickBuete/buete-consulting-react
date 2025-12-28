/**
 * AvailabilitySlotForm Component
 * Add/edit dialog form for availability slots
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/Dialog';
import { Loader2 } from 'lucide-react';
import type { AvailabilitySlot } from '../../types/booking';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

interface SlotFormData {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface AvailabilitySlotFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot: AvailabilitySlot | null;
  onSave: (data: SlotFormData) => Promise<void>;
  initialDayOfWeek?: number;
}

export const AvailabilitySlotForm: React.FC<AvailabilitySlotFormProps> = ({
  open,
  onOpenChange,
  slot,
  onSave,
  initialDayOfWeek = 0,
}) => {
  const [formData, setFormData] = useState<SlotFormData>({
    dayOfWeek: initialDayOfWeek,
    startTime: '09:00',
    endTime: '17:00',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form when slot changes
  useEffect(() => {
    if (slot) {
      setFormData({
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
    } else {
      setFormData({
        dayOfWeek: initialDayOfWeek,
        startTime: '09:00',
        endTime: '17:00',
      });
    }
    setError(null);
  }, [slot, initialDayOfWeek]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate times
    if (formData.startTime >= formData.endTime) {
      setError('End time must be after start time');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSave(formData);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save slot');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {slot ? 'Edit Availability Slot' : 'Add Availability Slot'}
            </DialogTitle>
            <DialogDescription>
              Set the time range for this availability slot
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="dayOfWeek">Day of Week</Label>
              <select
                id="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={(e) =>
                  setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded-md"
                disabled={!!slot}
              >
                {DAYS_OF_WEEK.map((day, index) => (
                  <option key={index} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Slot'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
