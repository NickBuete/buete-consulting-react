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

interface DoseResult {
  paracetamolDose: number;
  paracetamolMaxSingleDose: boolean;
  paracetamolMaxDailyDose: number;
  ibuprofenDose: number;
  ibuprofenMaxSingleDose: boolean;
  ibuprofenMaxDailyDose: number;
}

export const PediatricDoseCalculator: React.FC = () => {
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");

  const doses = useMemo((): DoseResult | null => {
    const weightValue = Number(weight);
    const ageValue = Number(age);

    if (!weightValue || weightValue <= 0) {
      return null;
    }

    // Paracetamol: 15 mg/kg per dose (max 1g per dose, max 4g/day)
    let paracetamolDose = weightValue * 15;
    const paracetamolMaxSingleDose = paracetamolDose > 1000;
    if (paracetamolMaxSingleDose) {
      paracetamolDose = 1000;
    }
    const paracetamolMaxDailyDose = 4000; // 4g/day max

    // Ibuprofen: 10 mg/kg per dose (max 400mg per dose, max 1200mg/day for <12 years, 2400mg/day for 12+)
    let ibuprofenDose = weightValue * 10;
    const ibuprofenMaxSingleDose = ibuprofenDose > 400;
    if (ibuprofenMaxSingleDose) {
      ibuprofenDose = 400;
    }
    const ibuprofenMaxDailyDose = ageValue >= 12 ? 2400 : 1200;

    return {
      paracetamolDose: Math.round(paracetamolDose),
      paracetamolMaxSingleDose,
      paracetamolMaxDailyDose,
      ibuprofenDose: Math.round(ibuprofenDose),
      ibuprofenMaxSingleDose,
      ibuprofenMaxDailyDose,
    };
  }, [weight, age]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-3">
          <span className="text-2xl">💊</span>
          Pediatric Dose Calculator
        </CardTitle>
        <CardDescription className="font-body">
          Calculate appropriate paracetamol and ibuprofen doses for children based on weight.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="dose-weight">Weight (kg)</Label>
          <Input
            id="dose-weight"
            type="number"
            min="0"
            step="0.1"
            placeholder="e.g., 15"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dose-age">Age (years)</Label>
          <Input
            id="dose-age"
            type="number"
            min="0"
            step="1"
            placeholder="e.g., 5"
            value={age}
            onChange={(event) => setAge(event.target.value)}
          />
        </div>

        {doses === null ? (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-500 font-body">Enter weight and age to calculate doses.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-md border border-blue-200 bg-blue-50 p-4 space-y-2">
              <p className="font-heading text-sm text-blue-900 font-semibold">Paracetamol Dose</p>
              <p className="text-2xl font-bold text-blue-700">{doses.paracetamolDose} mg per dose</p>
              <div className="text-xs text-blue-700 space-y-1">
                <p>
                  <span className="font-semibold">Dosing interval:</span> Every 4-6 hours as needed (maximum 4 doses per day)
                </p>
                <p>
                  <span className="font-semibold">Maximum daily dose:</span> {doses.paracetamolMaxDailyDose} mg
                </p>
                {doses.paracetamolMaxSingleDose && (
                  <p className="text-amber-700 font-semibold">
                    ⚠️ Dose capped at maximum single dose of 1000 mg
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-md border border-green-200 bg-green-50 p-4 space-y-2">
              <p className="font-heading text-sm text-green-900 font-semibold">Ibuprofen Dose</p>
              <p className="text-2xl font-bold text-green-700">{doses.ibuprofenDose} mg per dose</p>
              <div className="text-xs text-green-700 space-y-1">
                <p>
                  <span className="font-semibold">Dosing interval:</span> Every 6-8 hours as needed (maximum 3 doses per day)
                </p>
                <p>
                  <span className="font-semibold">Maximum daily dose:</span> {doses.ibuprofenMaxDailyDose} mg
                </p>
                {doses.ibuprofenMaxSingleDose && (
                  <p className="text-amber-700 font-semibold">
                    ⚠️ Dose capped at maximum single dose of 400 mg
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
          <p className="font-semibold mb-1">⚠️ Important Safety Information:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Always check product concentration</strong> before administering (e.g., 100 mg/mL vs 200 mg/5 mL)
            </li>
            <li>
              <strong>Do not exceed maximum daily doses</strong> for either medication
            </li>
            <li>
              <strong>Verify dosing</strong> with product information, your Doctor or Pharmacist
            </li>
            <li>Avoid ibuprofen in children with dehydration, asthma, or renal impairment</li>
            <li>These are general dosing guidelines - always consider individual patient factors</li>
          </ul>
        </div>

        <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="font-semibold mb-1">Clinical Notes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Paracetamol dosing: 15 mg/kg per dose (max 1 g per dose)</li>
            <li>Ibuprofen dosing: 10 mg/kg per dose (max 400 mg per dose)</li>
            <li>Doses can be alternated for improved fever/pain control if needed</li>
            <li>Consult specialist for pain management in neonates or complex cases</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
