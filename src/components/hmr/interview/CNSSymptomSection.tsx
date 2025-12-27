/**
 * CNS Symptoms Section
 * Central nervous system symptoms fields
 */

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui';
import { SymptomFieldGroup } from './SymptomFieldGroup';

interface CNSSymptomSectionProps {
  form: UseFormReturn<any>;
}

export const CNSSymptomSection: React.FC<CNSSymptomSectionProps> = ({
  form,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>CNS Symptoms/Screening</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SymptomFieldGroup
            form={form}
            name="dizziness"
            label="Dizziness"
            placeholder="Frequency & severity"
          />
          <SymptomFieldGroup
            form={form}
            name="drowsiness"
            label="Drowsiness"
            placeholder="Frequency & severity"
          />
          <SymptomFieldGroup
            form={form}
            name="fatigue"
            label="Fatigue"
            placeholder="Frequency & severity"
          />
          <SymptomFieldGroup
            form={form}
            name="memory"
            label="Memory"
            placeholder="Concerns or issues"
          />
          <SymptomFieldGroup
            form={form}
            name="anxiety"
            label="Anxiety"
            placeholder="Level & triggers"
          />
          <SymptomFieldGroup
            form={form}
            name="sleep"
            label="Sleep"
            placeholder="Quality & duration"
          />
          <SymptomFieldGroup
            form={form}
            name="headaches"
            label="Headaches"
            placeholder="Frequency & type"
          />
        </div>
      </CardContent>
    </Card>
  );
};
