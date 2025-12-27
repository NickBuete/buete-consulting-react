/**
 * Living Arrangements & Support Section
 * Patient living situation and support systems
 */

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Input,
} from '../../ui';
import { SymptomFieldGroup } from './SymptomFieldGroup';

interface LivingArrangementSectionProps {
  form: UseFormReturn<any>;
}

export const LivingArrangementSection: React.FC<
  LivingArrangementSectionProps
> = ({ form }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Living Arrangements & Support</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="livingArrangement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Living Arrangement</FormLabel>
                <Select value={field.value || ''} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select arrangement" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ALONE">Lives alone</SelectItem>
                    <SelectItem value="WITH_FAMILY">With family</SelectItem>
                    <SelectItem value="WITH_CARER">With carer</SelectItem>
                    <SelectItem value="RESIDENTIAL_AGED_CARE">
                      Residential aged care
                    </SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="usesWebster"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Uses Webster Pack?</FormLabel>
                <Select
                  value={
                    field.value === null
                      ? 'unknown'
                      : field.value
                      ? 'yes'
                      : 'no'
                  }
                  onValueChange={(v) =>
                    field.onChange(v === 'unknown' ? null : v === 'yes')
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <SymptomFieldGroup
            form={form}
            name="socialSupport"
            label="Social Support"
            placeholder="Family, friends, carers"
          />

          <SymptomFieldGroup
            form={form}
            name="otherSupports"
            label="Other Supports"
            placeholder="Services, equipment"
          />
        </div>
      </CardContent>
    </Card>
  );
};
