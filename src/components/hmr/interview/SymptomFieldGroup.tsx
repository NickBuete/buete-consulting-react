/**
 * Reusable Symptom Field Group Component
 * Reduces repetitive FormField definitions for symptom inputs
 */

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  Input,
} from '../../ui';

interface SymptomFieldGroupProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder?: string;
}

export const SymptomFieldGroup: React.FC<SymptomFieldGroupProps> = ({
  form,
  name,
  label,
  placeholder = 'Enter details',
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input placeholder={placeholder} {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
