/**
 * AvailabilityEditor - Refactored
 * Reduced from 320 lines to ~80 lines by extracting components
 * Uses custom hook for data management and separate components for UI
 */

import React, { useState } from 'react';
import { Alert, AlertDescription } from '../ui/Alert';
import { Loader2 } from 'lucide-react';
import type { AvailabilitySlot } from '../../types/booking';
import { useAvailabilitySlots } from '../../hooks/useAvailabilitySlots';
import { AvailabilitySlotForm } from './AvailabilitySlotForm';
import { AvailabilitySlotList } from './AvailabilitySlotList';

export const AvailabilityEditor: React.FC = () => {
  const {
    slots,
    loading,
    error,
    createSlot,
    updateSlot,
    deleteSlot,
    toggleSlotAvailability,
  } = useAvailabilitySlots();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(0);

  const handleAdd = (dayOfWeek: number) => {
    setEditingSlot(null);
    setSelectedDayOfWeek(dayOfWeek);
    setIsDialogOpen(true);
  };

  const handleEdit = (slot: AvailabilitySlot) => {
    setEditingSlot(slot);
    setSelectedDayOfWeek(slot.dayOfWeek);
    setIsDialogOpen(true);
  };

  const handleSave = async (data: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }) => {
    if (editingSlot) {
      await updateSlot(editingSlot.id, data);
    } else {
      await createSlot(data);
    }
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

      <AvailabilitySlotList
        slots={slots}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={deleteSlot}
        onToggle={toggleSlotAvailability}
      />

      <AvailabilitySlotForm
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        slot={editingSlot}
        onSave={handleSave}
        initialDayOfWeek={selectedDayOfWeek}
      />
    </div>
  );
};
