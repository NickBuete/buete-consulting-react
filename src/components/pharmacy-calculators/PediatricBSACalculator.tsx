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

export const PediatricBSACalculator: React.FC = () => {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  const bsa = useMemo(() => {
    const weightValue = Number(weight);
    const heightValue = Number(height);

    if (!weightValue || !heightValue || weightValue <= 0 || heightValue <= 0) {
      return null;
    }

    // Mosteller formula: BSA (m²) = √((height (cm) × weight (kg)) / 3600)
    const bsaValue = Math.sqrt((heightValue * weightValue) / 3600);
    return Math.round(bsaValue * 100) / 100; // Round to 2 decimal places
  }, [weight, height]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-3">
          <span className="text-2xl">📏</span>
          Pediatric Body Surface Area (BSA)
        </CardTitle>
        <CardDescription className="font-body">
          Calculate BSA using the Mosteller formula for pediatric dosing calculations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bsa-weight">Weight (kg)</Label>
          <Input
            id="bsa-weight"
            type="number"
            min="0"
            step="0.1"
            placeholder="e.g., 15"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bsa-height">Height (cm)</Label>
          <Input
            id="bsa-height"
            type="number"
            min="0"
            step="0.1"
            placeholder="e.g., 100"
            value={height}
            onChange={(event) => setHeight(event.target.value)}
          />
        </div>

        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-2">
          <p className="font-heading text-sm text-gray-600">Body Surface Area</p>
          {bsa === null ? (
            <p className="text-sm text-gray-500 font-body">Enter weight and height to calculate BSA.</p>
          ) : (
            <p className="text-2xl font-bold text-brand-600">{bsa} m²</p>
          )}
          <p className="text-xs text-gray-600 italic">
            Formula: BSA (m²) = √((height (cm) × weight (kg)) / 3600)
          </p>
        </div>

        <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="font-semibold mb-1">Clinical Notes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>BSA is used for calculating doses of chemotherapy and other specialized medications</li>
            <li>Always verify dosing requirements for the specific medication being prescribed</li>
            <li>Consider using age and weight-based dosing for most routine pediatric medications</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
