import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "../ui";

export const MorphineToFentanylConverter: React.FC = () => {
  const [oralMorphine, setOralMorphine] = useState("");

  const fentanylResult = useMemo(() => {
    const dose = Number(oralMorphine);
    if (!dose) {
      return null;
    }

    // Table 3: Oral morphine to transdermal fentanyl conversion
    // Based on Safer Care Victoria guidelines
    let patchSize: number;
    let range: string;

    if (dose < 45) {
      patchSize = 12;
      range = "< 45 mg";
    } else if (dose >= 45 && dose < 90) {
      patchSize = 25;
      range = "45-89 mg";
    } else if (dose >= 90 && dose < 150) {
      patchSize = 50;
      range = "90-149 mg";
    } else if (dose >= 150 && dose < 210) {
      patchSize = 75;
      range = "150-209 mg";
    } else if (dose >= 210 && dose < 270) {
      patchSize = 100;
      range = "210-269 mg";
    } else if (dose >= 270 && dose < 330) {
      patchSize = 125;
      range = "270-329 mg";
    } else if (dose >= 330 && dose < 390) {
      patchSize = 150;
      range = "330-389 mg";
    } else if (dose >= 390 && dose < 450) {
      patchSize = 175;
      range = "390-449 mg";
    } else {
      patchSize = 200;
      range = "≥ 450 mg";
    }

    return { patchSize, range };
  }, [oralMorphine]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-3">
          <span className="text-2xl">🔄</span>
          Morphine to Fentanyl Patch
        </CardTitle>
        <CardDescription className="font-body">
          Convert total daily oral morphine dose to transdermal fentanyl patch strength (Table 3, Safer Care Victoria).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mtf-morphine">Total Daily Oral Morphine (mg/24hr)</Label>
          <Input
            id="mtf-morphine"
            type="number"
            min="0"
            step="1"
            placeholder="e.g., 60"
            value={oralMorphine}
            onChange={(event) => setOralMorphine(event.target.value)}
          />
        </div>

        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-3">
          <p className="font-heading text-sm text-gray-600">Recommended Fentanyl Patch</p>
          {fentanylResult === null ? (
            <p className="text-sm text-gray-500 font-body">Enter total daily oral morphine to see conversion.</p>
          ) : (
            <>
              <div className="bg-white rounded-md border border-gray-300 p-3">
                <p className="text-xs text-gray-600 mb-1">Transdermal Fentanyl</p>
                <p className="text-3xl font-bold text-brand-600">
                  {fentanylResult.patchSize} mcg/hr
                </p>
              </div>
              <div className="text-xs text-gray-600">
                <p>
                  <span className="font-semibold">Morphine range:</span> {fentanylResult.range}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
          <p className="font-semibold mb-1">Important:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Apply 25-50% cross-tolerance dose reduction when switching opioids</li>
            <li>Continue previous opioid for 12-18 hours after applying first patch</li>
            <li>Fentanyl patches take 12-18 hours to reach therapeutic levels</li>
            <li>Provide immediate-release morphine for breakthrough pain</li>
            <li>Change patch every 72 hours unless otherwise specified</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
