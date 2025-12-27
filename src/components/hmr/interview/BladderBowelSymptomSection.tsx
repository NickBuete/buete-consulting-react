/**
 * Bladder/Bowel Symptoms Section
 * Urinary and bowel control assessment
 */

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui';
import { SymptomFieldGroup } from './SymptomFieldGroup';

interface BladderBowelSymptomSectionProps {
  form: UseFormReturn<any>;
}

export const BladderBowelSymptomSection: React.FC<
  BladderBowelSymptomSectionProps
> = ({ form }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bladder/Bowel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SymptomFieldGroup
            form={form}
            name="bladderControl"
            label="Bladder Control"
            placeholder="Any issues or concerns"
          />
          <SymptomFieldGroup
            form={form}
            name="bowelControl"
            label="Bowel Control"
            placeholder="Frequency, consistency"
          />
          <SymptomFieldGroup
            form={form}
            name="nightSymptoms"
            label="Night Symptoms"
            placeholder="Nocturia, urgency"
          />
          <SymptomFieldGroup
            form={form}
            name="signsOfBleeding"
            label="Signs of Bleeding"
            placeholder="Blood in urine/stool, etc."
          />
        </div>
      </CardContent>
    </Card>
  );
};
