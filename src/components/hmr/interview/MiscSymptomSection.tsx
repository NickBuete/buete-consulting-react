/**
 * Miscellaneous Symptoms Section
 * Additional observations (rashes, bruising, etc.)
 */

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui';
import { SymptomFieldGroup } from './SymptomFieldGroup';

interface MiscSymptomSectionProps {
  form: UseFormReturn<any>;
}

export const MiscSymptomSection: React.FC<MiscSymptomSectionProps> = ({
  form,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Miscellaneous Observations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SymptomFieldGroup
            form={form}
            name="rashes"
            label="Rashes"
            placeholder="Any rashes observed"
          />
          <SymptomFieldGroup
            form={form}
            name="bruising"
            label="Bruising"
            placeholder="Unusual bruising noted"
          />
        </div>
      </CardContent>
    </Card>
  );
};
