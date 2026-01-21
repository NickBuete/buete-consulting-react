import { useForm } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import {
  Button,
  FormControl,
  FormField,
  FormItem,
  Input,
} from '../../../ui';
import type { MedicationFormValues } from '../schema';

export const MultiPhaseConfigFields = ({
  form,
  phases,
  onAddPhase,
  onRemovePhase,
}: {
  form: ReturnType<typeof useForm<MedicationFormValues>>;
  phases: { id: string }[];
  onAddPhase: () => void;
  onRemovePhase: (index: number) => void;
}) => {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-700">Multi-Phase Taper</h4>
      <p className="text-sm text-gray-600">
        Define each phase of the taper with dose and duration.
      </p>
      <div className="space-y-2">
        {phases.map((field, index) => (
          <div key={field.id} className="flex items-center gap-3 p-2 bg-white rounded border">
            <span className="text-sm text-gray-500 w-16">Phase {index + 1}</span>
            <FormField
              control={form.control}
              name={`phases.${index}.dose`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="Dose"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <span className="text-sm text-gray-500">{form.watch('unit')}</span>
            <span className="text-sm text-gray-500">for</span>
            <FormField
              control={form.control}
              name={`phases.${index}.durationDays`}
              render={({ field }) => (
                <FormItem className="w-20">
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="1"
                      placeholder="Days"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 1)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <span className="text-sm text-gray-500">days</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onRemovePhase(index)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onAddPhase}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Phase
      </Button>
    </div>
  );
};
