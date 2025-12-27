/**
 * Musculoskeletal Symptoms Section
 * Pain, mobility, and falls assessment
 */

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui';
import { SymptomFieldGroup } from './SymptomFieldGroup';

interface MusculoskeletalSymptomSectionProps {
  form: UseFormReturn<any>;
}

export const MusculoskeletalSymptomSection: React.FC<
  MusculoskeletalSymptomSectionProps
> = ({ form }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Musculoskeletal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SymptomFieldGroup
            form={form}
            name="pain"
            label="Pain"
            placeholder="Location & severity (0-10)"
          />
          <SymptomFieldGroup
            form={form}
            name="mobility"
            label="Mobility Concerns"
            placeholder="Walking aids, limitations"
          />
          <SymptomFieldGroup
            form={form}
            name="falls"
            label="Falls"
            placeholder="Recent falls, near misses"
          />
        </div>
      </CardContent>
    </Card>
  );
};
