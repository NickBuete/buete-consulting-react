import { useForm } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
} from '../../../ui';
import type { MedicationFormValues } from '../schema';

export const DayOfWeekConfigFields = ({
  form,
}: {
  form: ReturnType<typeof useForm<MedicationFormValues>>;
}) => {
  const days = [
    { name: 'dowMonday' as const, label: 'Mon' },
    { name: 'dowTuesday' as const, label: 'Tue' },
    { name: 'dowWednesday' as const, label: 'Wed' },
    { name: 'dowThursday' as const, label: 'Thu' },
    { name: 'dowFriday' as const, label: 'Fri' },
    { name: 'dowSaturday' as const, label: 'Sat' },
    { name: 'dowSunday' as const, label: 'Sun' },
  ];

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-700">Day-of-Week Dosing</h4>
      <p className="text-sm text-gray-600">
        Enter dose for each day. Leave blank or 0 for days off (e.g., warfarin dosing).
      </p>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <FormField
            key={day.name}
            control={form.control}
            name={day.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-center block text-xs">{day.label}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    className="text-center text-sm"
                    placeholder="-"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  );
};
