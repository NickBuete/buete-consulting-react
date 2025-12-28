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

export const OralToSubcutaneousConverter: React.FC = () => {
  const [medication, setMedication] = useState("morphine");
  const [oralDose, setOralDose] = useState("");

  const subcutaneousResult = useMemo(() => {
    const dose = Number(oralDose);
    if (!dose) {
      return null;
    }

    // Table 2: Oral to subcutaneous conversion ratios
    let ratio: string;
    let scDoseMin: number;
    let scDoseMax: number;

    switch (medication) {
      case "morphine":
        // 2:1 to 3:1 ratio
        scDoseMin = Math.round((dose / 3) * 10) / 10;
        scDoseMax = Math.round((dose / 2) * 10) / 10;
        ratio = "2:1 to 3:1";
        break;
      case "oxycodone":
        // 1.5:1 to 2:1 ratio
        scDoseMin = Math.round((dose / 2) * 10) / 10;
        scDoseMax = Math.round((dose / 1.5) * 10) / 10;
        ratio = "1.5:1 to 2:1";
        break;
      case "hydromorphone":
        // 2:1 to 3:1 ratio
        scDoseMin = Math.round((dose / 3) * 10) / 10;
        scDoseMax = Math.round((dose / 2) * 10) / 10;
        ratio = "2:1 to 3:1";
        break;
      default:
        scDoseMin = 0;
        scDoseMax = 0;
        ratio = "N/A";
    }

    return { scDoseMin, scDoseMax, ratio };
  }, [medication, oralDose]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-3">
          <span className="text-2xl">💉</span>
          Oral to Subcutaneous Converter
        </CardTitle>
        <CardDescription className="font-body">
          Convert oral opioid doses to subcutaneous equivalents for the same medication (Table 2, Safer Care Victoria).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otsc-medication">Medication</Label>
          <Select value={medication} onValueChange={setMedication}>
            <SelectTrigger id="otsc-medication">
              <SelectValue placeholder="Select medication" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morphine">Morphine</SelectItem>
              <SelectItem value="oxycodone">Oxycodone</SelectItem>
              <SelectItem value="hydromorphone">Hydromorphone</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="otsc-dose">Total Daily Oral Dose (mg/24hr)</Label>
          <Input
            id="otsc-dose"
            type="number"
            min="0"
            step="0.5"
            placeholder="e.g., 60"
            value={oralDose}
            onChange={(event) => setOralDose(event.target.value)}
          />
        </div>

        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-3">
          <p className="font-heading text-sm text-gray-600">Subcutaneous Dose Range</p>
          {subcutaneousResult === null ? (
            <p className="text-sm text-gray-500 font-body">Enter oral dose to see subcutaneous conversion.</p>
          ) : (
            <>
              <div className="bg-white rounded-md border border-gray-300 p-3">
                <p className="text-xs text-gray-600 mb-1 capitalize">
                  Subcutaneous {medication} (24hr total)
                </p>
                <p className="text-2xl font-bold text-brand-600">
                  {subcutaneousResult.scDoseMin} - {subcutaneousResult.scDoseMax} mg
                </p>
              </div>
              <div className="text-xs text-gray-600">
                <p>
                  <span className="font-semibold">Conversion ratio (oral:SC):</span>{" "}
                  {subcutaneousResult.ratio}
                </p>
                <p className="italic mt-1">
                  Divide daily SC dose into 2-4 doses or use continuous subcutaneous infusion (CSCI)
                </p>
              </div>
            </>
          )}
        </div>

        <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="font-semibold mb-1">Clinical Notes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Start at the lower end of the dose range and titrate to effect</li>
            <li>SC route has faster onset than oral (15-30 min vs 30-60 min)</li>
            <li>Monitor for injection site reactions; rotate sites regularly</li>
            <li>Consider CSCI for continuous pain control in palliative care</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
