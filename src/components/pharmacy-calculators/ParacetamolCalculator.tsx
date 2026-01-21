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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui";

interface DoseResult {
  dose: number;
  maxSingleDose: boolean;
  maxDailyDose: number;
  volumeMl: number | null;
}

export const ParacetamolCalculator: React.FC = () => {
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [concentration, setConcentration] = useState("");

  const doses = useMemo((): DoseResult | null => {
    const weightValue = Number(weight);

    if (!weightValue || weightValue <= 0) {
      return null;
    }

    // Paracetamol: 15 mg/kg per dose (max 1g per dose, max 4g/day)
    let dose = weightValue * 15;
    const maxSingleDose = dose > 1000;
    if (maxSingleDose) {
      dose = 1000;
    }
    const maxDailyDose = 4000; // 4g/day max

    // Calculate volume in mL if concentration is selected
    let volumeMl: number | null = null;
    if (concentration) {
      const concentrationValue = Number(concentration);
      if (concentrationValue > 0) {
        volumeMl = dose / concentrationValue;
      }
    }

    return {
      dose: Math.round(dose),
      maxSingleDose,
      maxDailyDose,
      volumeMl: volumeMl !== null ? Math.round(volumeMl * 10) / 10 : null,
    };
  }, [weight, concentration]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-3">
          <span className="text-2xl">💊</span>
          Paracetamol Calculator
        </CardTitle>
        <CardDescription className="font-body">
          Calculate appropriate paracetamol doses for children based on weight.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="paracetamol-weight">Weight (kg)</Label>
          <Input
            id="paracetamol-weight"
            type="number"
            min="0"
            step="0.1"
            placeholder="e.g., 15"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paracetamol-age">Age (years)</Label>
          <Input
            id="paracetamol-age"
            type="number"
            min="0"
            step="1"
            placeholder="e.g., 5"
            value={age}
            onChange={(event) => setAge(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paracetamol-concentration">Product Concentration</Label>
          <Select value={concentration} onValueChange={setConcentration}>
            <SelectTrigger id="paracetamol-concentration">
              <SelectValue placeholder="Select concentration (mg/mL)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="100">100 mg/mL (Infant drops)</SelectItem>
              <SelectItem value="50">50 mg/mL (Babies/Kids liquid)</SelectItem>
              <SelectItem value="24">24 mg/mL (Children's 1-5 years)</SelectItem>
              <SelectItem value="48">48 mg/mL (Children's 5-12 years)</SelectItem>
              {/* User can add more Australian products as needed */}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Select product to calculate volume in mL
          </p>
        </div>

        {doses === null ? (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-500 font-body">
              Enter weight to calculate dose.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-md border border-blue-200 bg-blue-50 p-4 space-y-2">
              <p className="font-heading text-sm text-blue-900 font-semibold">
                Paracetamol Dose
              </p>
              <p className="text-2xl font-bold text-blue-700">
                {doses.dose} mg per dose
              </p>
              {doses.volumeMl !== null && (
                <p className="text-xl font-bold text-blue-700">
                  = {doses.volumeMl} mL
                </p>
              )}
              <div className="text-xs text-blue-700 space-y-1">
                <p>
                  <span className="font-semibold">Dosing interval:</span> Every
                  4-6 hours as needed (maximum 4 doses per day)
                </p>
                <p>
                  <span className="font-semibold">Maximum daily dose:</span>{" "}
                  {doses.maxDailyDose} mg
                </p>
                {doses.maxSingleDose && (
                  <p className="text-amber-700 font-semibold">
                    Warning: Dose capped at maximum single dose of 1000 mg
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
          <p className="font-semibold mb-1">Important Safety Information:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Always check product concentration</strong> before
              administering (e.g., 100 mg/mL vs 200 mg/5 mL)
            </li>
            <li>
              <strong>Do not exceed maximum daily dose</strong> of 4000 mg (4g)
            </li>
            <li>
              <strong>Verify dosing</strong> with AMH Children's Dosing Companion
              or local guidelines
            </li>
            <li>
              Be aware of combination products containing paracetamol to avoid
              overdose
            </li>
            <li>
              Use with caution in hepatic impairment or malnutrition
            </li>
          </ul>
        </div>

        <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="font-semibold mb-1">Clinical Notes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Paracetamol dosing: 15 mg/kg per dose (max 1 g per dose)</li>
            <li>Can be given orally or rectally</li>
            <li>May be alternated with ibuprofen for improved fever/pain control</li>
            <li>
              Consult specialist for pain management in neonates or complex cases
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
