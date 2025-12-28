import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui";

export const BSACalculator: React.FC = () => {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [heightUnit, setHeightUnit] = useState("cm");

  const bsa = useMemo(() => {
    const weightValue = Number(weight);
    const heightValue = Number(height);

    if (!weightValue || !heightValue) {
      return null;
    }

    // Convert to kg and cm if needed
    const weightKg = weightUnit === "kg" ? weightValue : weightValue * 0.453592;
    const heightCm = heightUnit === "cm" ? heightValue : heightValue * 2.54;

    // Mosteller formula: BSA (m²) = √[(height × weight) / 3600]
    const bsaValue = Math.sqrt((heightCm * weightKg) / 3600);

    return bsaValue.toFixed(3);
  }, [weight, height, weightUnit, heightUnit]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-3">
          <span className="text-2xl">👶</span>
          Pediatric Body Surface Area
        </CardTitle>
        <CardDescription className="font-body">
          Calculate BSA using the Mosteller formula for pediatric dose calculations and chemotherapy regimens.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bsa-weight">Weight</Label>
            <div className="flex gap-2">
              <Input
                id="bsa-weight"
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g., 25"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                className="flex-1"
              />
              <Select value={weightUnit} onValueChange={setWeightUnit}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lb">lb</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bsa-height">Height</Label>
            <div className="flex gap-2">
              <Input
                id="bsa-height"
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g., 120"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
                className="flex-1"
              />
              <Select value={heightUnit} onValueChange={setHeightUnit}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="in">in</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-2">
          <p className="font-heading text-sm text-gray-600">Body Surface Area (Mosteller)</p>
          {bsa === null ? (
            <p className="text-sm text-gray-500 font-body">Enter weight and height to calculate BSA.</p>
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-900">{bsa} m²</p>
              <p className="text-xs text-gray-600 font-body">
                Formula: BSA (m²) = √[(height(cm) × weight(kg)) / 3600]
              </p>
            </>
          )}
        </div>

        <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="font-semibold mb-1">Clinical Note:</p>
          <p>
            The Mosteller formula is widely used for pediatric dosing. Always verify dose calculations with current guidelines and consider individual patient factors.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
