import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Alert, AlertDescription } from '../ui/Alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/Dialog';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import type { AvailabilitySlot } from '../../types/booking';
import { formatBookingTime } from '../../utils/booking';
import {
  createAvailabilitySlot,
  deleteAvailabilitySlot,
  getAvailabilitySlots,
  updateAvailabilitySlot,
} from '../../services/booking';

interface SlotFormData {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const AvailabilityEditor: React.FC = () => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [formData, setFormData] = useState<SlotFormData>({
    dayOfWeek: 0,
    startTime: '09:00',
    endTime: '17:00',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAvailabilitySlots();
      setSlots(data);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = (dayOfWeek: number) => {
    setEditingSlot(null);
    setFormData({
      dayOfWeek,
      startTime: '09:00',
      endTime: '17:00',
    });
    setIsDialogOpen(true);
  };

  const handleEditSlot = (slot: AvailabilitySlot) => {
    setEditingSlot(slot);
    setFormData({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteSlot = async (slotId: number) => {
    if (!window.confirm('Are you sure you want to delete this availability slot?')) {
      return;
    }

    try {
      await deleteAvailabilitySlot(slotId);
      await fetchAvailability();
    } catch (err) {
      console.error('Error deleting slot:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete slot');
    }
  };

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
      if (editingSlot) {
        await updateAvailabilitySlot(editingSlot.id, formData);
      } else {
        await createAvailabilitySlot(formData);
      }

      setIsDialogOpen(false);
      await fetchAvailability();
    } catch (err) {
      console.error('Error saving slot:', err);
      setError(err instanceof Error ? err.message : 'Failed to save slot');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSlotAvailability = async (slot: AvailabilitySlot) => {
    try {
      await updateAvailabilitySlot(slot.id, { isAvailable: !slot.isAvailable });
      await fetchAvailability();
    } catch (err) {
      console.error('Error toggling slot:', err);
      setError(err instanceof Error ? err.message : 'Failed to update slot');
    }
  };

  const getSlotsForDay = (dayOfWeek: number) => {
    return slots.filter((slot) => slot.dayOfWeek === dayOfWeek);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
                  onClick={() => handleAddSlot(dayIndex)}
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
                        slot.isAvailable ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-medium">
                          {formatBookingTime(slot.startTime)} - {formatBookingTime(slot.endTime)}
                        </div>
                        <button
                          onClick={() => toggleSlotAvailability(slot)}
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
                          onClick={() => handleEditSlot(slot)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSlot(slot.id)}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingSlot ? 'Edit Availability Slot' : 'Add Availability Slot'}
              </DialogTitle>
              <DialogDescription>
                Set the time range for this availability slot
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="dayOfWeek">Day of Week</Label>
                <select
                  id="dayOfWeek"
                  value={formData.dayOfWeek}
                  onChange={(e) =>
                    setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={!!editingSlot}
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
                onClick={() => setIsDialogOpen(false)}
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
    </div>
  );
};
