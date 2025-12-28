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

export const CreatinineCalculator: React.FC = () => {
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [serumCreatinine, setSerumCreatinine] = useState("");
  const [creatinineUnit, setCreatinineUnit] = useState("mg/dL");

  const result = useMemo(() => {
    const ageNum = Number(age);
    const weightNum = Number(weight);
    const scrNum = Number(serumCreatinine);

    if (!ageNum || !weightNum || !scrNum) {
      return null;
    }

    const scrMgPerDl = creatinineUnit === "mg/dL" ? scrNum : scrNum / 88.4;
    if (scrMgPerDl <= 0) {
      return null;
    }

    const base = ((140 - ageNum) * weightNum) / (72 * scrMgPerDl);
    const adjusted = gender === "female" ? base * 0.85 : base;
    return Math.max(Math.round(adjusted * 10) / 10, 0);
  }, [age, weight, serumCreatinine, creatinineUnit, gender]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-3">
          <span className="text-2xl">💻</span>
          Creatinine Clearance (Cockcroft-Gault)
        </CardTitle>
        <CardDescription className="font-body">
          Estimate renal function to guide dosing adjustments. Converts µmol/L to mg/dL automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cc-gender">Sex</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger id="cc-gender">
                <SelectValue placeholder="Select sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cc-age">Age (years)</Label>
            <Input
              id="cc-age"
              type="number"
              min="18"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cc-weight">Weight (kg)</Label>
            <Input
              id="cc-weight"
              type="number"
              min="20"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cc-scr">Serum Creatinine</Label>
            <div className="flex gap-2">
              <Input
                id="cc-scr"
                type="number"
                min="0"
                step="0.01"
                value={serumCreatinine}
                onChange={(event) => setSerumCreatinine(event.target.value)}
              />
              <Select value={creatinineUnit} onValueChange={setCreatinineUnit}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mg/dL">mg/dL</SelectItem>
                  <SelectItem value="µmol/L">µmol/L</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
          <p className="font-heading text-sm text-gray-600">Result</p>
          {result === null ? (
            <p className="text-sm text-gray-500 font-body">
              Enter age, weight, and serum creatinine to calculate creatinine clearance.
            </p>
          ) : (
            <p className="text-lg font-semibold text-gray-900">
              {result} mL/min
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Cockcroft-Gault assumes stable renal function and adult patients. Clinical judgement is required for extremes of body size.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
