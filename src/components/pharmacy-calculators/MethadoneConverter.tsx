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

export const MethadoneConverter: React.FC = () => {
  const [conversionDirection, setConversionDirection] = useState("oral_to_sc");
  const [oralDose, setOralDose] = useState("");

  const methadoneResult = useMemo(() => {
    const dose = Number(oralDose);
    if (!dose) {
      return null;
    }

    // Table 4: Oral methadone to subcutaneous methadone
    // Ratio is approximately 2:1 (oral:SC)
    if (conversionDirection === "oral_to_sc") {
      const scDose = Math.round((dose / 2) * 10) / 10;
      return {
        result: scDose,
        resultLabel: "Subcutaneous Methadone",
        inputLabel: "Oral Methadone",
      };
    } else {
      // SC to oral: multiply by 2
      const oralResult = Math.round((dose * 2) * 10) / 10;
      return {
        result: oralResult,
        resultLabel: "Oral Methadone",
        inputLabel: "Subcutaneous Methadone",
      };
    }
  }, [conversionDirection, oralDose]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-3">
          <span className="text-2xl">🔬</span>
          Methadone Route Converter
        </CardTitle>
        <CardDescription className="font-body">
          Convert methadone between oral and subcutaneous routes (Table 4, Safer Care Victoria). Requires specialist supervision.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="meth-direction">Conversion Direction</Label>
          <Select value={conversionDirection} onValueChange={setConversionDirection}>
            <SelectTrigger id="meth-direction">
              <SelectValue placeholder="Select direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oral_to_sc">Oral → Subcutaneous</SelectItem>
              <SelectItem value="sc_to_oral">Subcutaneous → Oral</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="meth-dose">
            {conversionDirection === "oral_to_sc"
              ? "Total Daily Oral Methadone (mg/24hr)"
              : "Total Daily SC Methadone (mg/24hr)"}
          </Label>
          <Input
            id="meth-dose"
            type="number"
            min="0"
            step="0.5"
            placeholder="e.g., 20"
            value={oralDose}
            onChange={(event) => setOralDose(event.target.value)}
          />
        </div>

        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-3">
          <p className="font-heading text-sm text-gray-600">Converted Dose</p>
          {methadoneResult === null ? (
            <p className="text-sm text-gray-500 font-body">Enter dose to see conversion.</p>
          ) : (
            <>
              <div className="bg-white rounded-md border border-gray-300 p-3">
                <p className="text-xs text-gray-600 mb-1">{methadoneResult.resultLabel}</p>
                <p className="text-2xl font-bold text-brand-600">
                  {methadoneResult.result} mg/24hr
                </p>
              </div>
              <div className="text-xs text-gray-600">
                <p>
                  <span className="font-semibold">Conversion ratio (oral:SC):</span> 2:1
                </p>
              </div>
            </>
          )}
        </div>

        <div className="text-xs text-red-700 bg-red-50 border border-red-300 rounded-md p-3">
          <p className="font-semibold mb-1">⚠️ Specialist Supervision Required:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Methadone has complex, unpredictable pharmacokinetics</li>
            <li>Long half-life (15-60 hours) - risk of accumulation</li>
            <li>QT prolongation risk - ECG monitoring recommended</li>
            <li>Drug interactions common - review all concurrent medications</li>
            <li>Consult palliative care or pain specialist before conversion</li>
            <li>Start low and titrate slowly - reassess every 3-5 days</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
