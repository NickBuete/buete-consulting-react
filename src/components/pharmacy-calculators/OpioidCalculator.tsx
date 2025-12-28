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

const opioidFactors: Record<string, { label: string; factor: number }> = {
  morphine_oral: { label: "Morphine (oral)", factor: 1 },
  morphine_parenteral: { label: "Morphine (IV/SC)", factor: 3 },
  oxycodone_oral: { label: "Oxycodone (oral)", factor: 1.5 },
  oxycodone_parenteral: { label: "Oxycodone (IV/SC)", factor: 2.5 },
  hydromorphone_oral: { label: "Hydromorphone (oral)", factor: 4 },
  hydromorphone_parenteral: { label: "Hydromorphone (IV/SC)", factor: 12.5 },
  fentanyl_patch: { label: "Fentanyl patch (mcg/hr)", factor: 2.4 },
  fentanyl_parenteral: { label: "Fentanyl (IV/SC, per mcg)", factor: 0.1 },
  tramadol: { label: "Tramadol (oral)", factor: 0.1 },
  codeine: { label: "Codeine (oral)", factor: 0.15 },
  tapentadol: { label: "Tapentadol (oral)", factor: 0.35 },
  buprenorphine_patch: { label: "Buprenorphine patch (mcg/hr)", factor: 12.6 },
};

export const OpioidCalculator: React.FC = () => {
  const [opioid, setOpioid] = useState("morphine_oral");
  const [dailyDose, setDailyDose] = useState("");
  const mme = useMemo(() => {
    const dose = Number(dailyDose);
    if (!dose) {
      return null;
    }
    const factor = opioidFactors[opioid]?.factor ?? 1;
    return Math.round(dose * factor * 10) / 10;
  }, [dailyDose, opioid]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-3">
          <span className="text-2xl">💊</span>
          Opioid Conversion to MME
        </CardTitle>
        <CardDescription className="font-body">
          Calculate morphine milligram equivalents (MME) for oral and parenteral opioids. Based on Safer Care Victoria guidelines.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="opioid-select">Opioid & Route</Label>
          <Select value={opioid} onValueChange={setOpioid}>
            <SelectTrigger id="opioid-select">
              <SelectValue placeholder="Select opioid" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(opioidFactors).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="opioid-dose">
            {opioid.includes('patch') ? 'Patch strength (mcg/hr)' :
             opioid.includes('parenteral') && opioid.includes('fentanyl') ? 'Daily dose (mcg)' :
             'Total daily dose (mg)'}
          </Label>
          <Input
            id="opioid-dose"
            type="number"
            min="0"
            step="0.1"
            value={dailyDose}
            onChange={(event) => setDailyDose(event.target.value)}
          />
        </div>
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-2">
          <p className="font-heading text-sm text-gray-600">Morphine Milligram Equivalent (MME)</p>
          {mme === null ? (
            <p className="text-sm text-gray-500 font-body">Enter the dose to calculate MME.</p>
          ) : (
            <p className="text-lg font-semibold text-gray-900">{mme} mg oral morphine per 24 hours</p>
          )}
          <p className="text-xs text-amber-700">
            Apply cross-tolerance reductions (typically 25-50%) when switching opioids. Review Safer Care Victoria guidelines and patient history before prescribing.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
