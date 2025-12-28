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

export const BreakthroughPainCalculator: React.FC = () => {
  const [opioidType, setOpioidType] = useState("oral_morphine");
  const [dose, setDose] = useState("");

  const breakthroughDose = useMemo(() => {
    const doseValue = Number(dose);
    if (!doseValue) {
      return null;
    }

    let dailyOralMorphineEquivalent = 0;

    // Convert to oral morphine equivalent per 24 hours
    switch (opioidType) {
      case "oral_morphine":
        dailyOralMorphineEquivalent = doseValue;
        break;
      case "fentanyl_patch":
        // Fentanyl patch: mcg/hr × 2.4 = mg oral morphine/24hr
        dailyOralMorphineEquivalent = doseValue * 2.4;
        break;
      case "oxycodone":
        // Oxycodone: mg × 1.5 = mg oral morphine
        dailyOralMorphineEquivalent = doseValue * 1.5;
        break;
      case "hydromorphone":
        // Hydromorphone: mg × 4 = mg oral morphine
        dailyOralMorphineEquivalent = doseValue * 4;
        break;
      case "sc_morphine":
        // SC morphine: mg × 3 = mg oral morphine
        dailyOralMorphineEquivalent = doseValue * 3;
        break;
      default:
        dailyOralMorphineEquivalent = doseValue;
    }

    // Breakthrough dose is 1/6 to 1/12 of total daily dose
    const min = Math.round((dailyOralMorphineEquivalent / 12) * 10) / 10;
    const max = Math.round((dailyOralMorphineEquivalent / 6) * 10) / 10;

    return { min, max, dailyEquivalent: dailyOralMorphineEquivalent };
  }, [opioidType, dose]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          Breakthrough Pain Calculator
        </CardTitle>
        <CardDescription className="font-body">
          Calculate appropriate immediate-release oral morphine dose for breakthrough pain based on current opioid regimen.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bp-opioid-type">Current Opioid</Label>
          <Select value={opioidType} onValueChange={setOpioidType}>
            <SelectTrigger id="bp-opioid-type">
              <SelectValue placeholder="Select opioid" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oral_morphine">Oral Morphine (total daily dose)</SelectItem>
              <SelectItem value="fentanyl_patch">Fentanyl Patch (mcg/hr)</SelectItem>
              <SelectItem value="oxycodone">Oxycodone (total daily dose)</SelectItem>
              <SelectItem value="hydromorphone">Hydromorphone (total daily dose)</SelectItem>
              <SelectItem value="sc_morphine">SC Morphine (total daily dose)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bp-dose">
            {opioidType === "fentanyl_patch" ? "Patch strength (mcg/hr)" : "Total daily dose (mg)"}
          </Label>
          <Input
            id="bp-dose"
            type="number"
            min="0"
            step="0.1"
            placeholder={opioidType === "fentanyl_patch" ? "e.g., 25" : "e.g., 60"}
            value={dose}
            onChange={(event) => setDose(event.target.value)}
          />
        </div>

        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-3">
          <p className="font-heading text-sm text-gray-600">Suggested Breakthrough Dose</p>
          {breakthroughDose === null ? (
            <p className="text-sm text-gray-500 font-body">Enter dose to calculate breakthrough pain dose.</p>
          ) : (
            <>
              <div className="bg-white rounded-md border border-gray-300 p-3">
                <p className="text-xs text-gray-600 mb-1">Oral Morphine IR (immediate-release)</p>
                <p className="text-2xl font-bold text-brand-600">
                  {breakthroughDose.min} - {breakthroughDose.max} mg
                </p>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p>
                  <span className="font-semibold">Daily oral morphine equivalent:</span>{" "}
                  {breakthroughDose.dailyEquivalent.toFixed(1)} mg
                </p>
                <p className="italic">
                  Breakthrough dose = 1/6 to 1/12 of total daily oral morphine dose
                </p>
              </div>
            </>
          )}
        </div>

        <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="font-semibold mb-1">Clinical Notes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Onset of action varies; fentanyl patches may take 18-48 hours to reach steady state</li>
            <li>Reassess pain regularly and adjust breakthrough dose as needed</li>
            <li>If using more than 3-4 breakthrough doses per day, consider increasing baseline regimen</li>
            <li>Use immediate-release formulations for breakthrough pain</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
