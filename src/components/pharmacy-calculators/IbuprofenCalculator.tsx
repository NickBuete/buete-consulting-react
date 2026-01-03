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

export const IbuprofenCalculator: React.FC = () => {
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [concentration, setConcentration] = useState("");

  const doses = useMemo((): DoseResult | null => {
    const weightValue = Number(weight);
    const ageValue = Number(age);

    if (!weightValue || weightValue <= 0) {
      return null;
    }

    // Ibuprofen: 10 mg/kg per dose (max 400mg per dose, max 1200mg/day for <12 years, 2400mg/day for 12+)
    let dose = weightValue * 10;
    const maxSingleDose = dose > 400;
    if (maxSingleDose) {
      dose = 400;
    }
    const maxDailyDose = ageValue >= 12 ? 2400 : 1200;

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
  }, [weight, age, concentration]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-3">
          <span className="text-2xl">💊</span>
          Ibuprofen Calculator
        </CardTitle>
        <CardDescription className="font-body">
          Calculate appropriate ibuprofen doses for children based on weight.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ibuprofen-weight">Weight (kg)</Label>
          <Input
            id="ibuprofen-weight"
            type="number"
            min="0"
            step="0.1"
            placeholder="e.g., 15"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ibuprofen-age">Age (years)</Label>
          <Input
            id="ibuprofen-age"
            type="number"
            min="0"
            step="1"
            placeholder="e.g., 5"
            value={age}
            onChange={(event) => setAge(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ibuprofen-concentration">Product Concentration</Label>
          <Select value={concentration} onValueChange={setConcentration}>
            <SelectTrigger id="ibuprofen-concentration">
              <SelectValue placeholder="Select concentration (mg/mL)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">20 mg/mL (Infant drops)</SelectItem>
              <SelectItem value="40">40 mg/mL (Children's suspension)</SelectItem>
              <SelectItem value="100">100 mg/5mL (20 mg/mL - oral suspension)</SelectItem>
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
            <div className="rounded-md border border-green-200 bg-green-50 p-4 space-y-2">
              <p className="font-heading text-sm text-green-900 font-semibold">
                Ibuprofen Dose
              </p>
              <p className="text-2xl font-bold text-green-700">
                {doses.dose} mg per dose
              </p>
              {doses.volumeMl !== null && (
                <p className="text-xl font-bold text-green-700">
                  = {doses.volumeMl} mL
                </p>
              )}
              <div className="text-xs text-green-700 space-y-1">
                <p>
                  <span className="font-semibold">Dosing interval:</span> Every
                  6-8 hours as needed (maximum 3 doses per day)
                </p>
                <p>
                  <span className="font-semibold">Maximum daily dose:</span>{" "}
                  {doses.maxDailyDose} mg
                </p>
                {doses.maxSingleDose && (
                  <p className="text-amber-700 font-semibold">
                    Warning: Dose capped at maximum single dose of 400 mg
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
              administering
            </li>
            <li>
              <strong>Do not exceed maximum daily dose</strong> (1200 mg for
              children under 12, 2400 mg for 12 and older)
            </li>
            <li>
              <strong>Verify dosing</strong> with AMH Children's Dosing Companion
              or local guidelines
            </li>
            <li>Ibuprofen should be taken with food to minimize GI upset</li>
            <li>
              Avoid ibuprofen in children with dehydration, asthma, or renal
              impairment
            </li>
            <li>Do not use in active bleeding or poorly controlled asthma</li>
          </ul>
        </div>

        <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="font-semibold mb-1">Clinical Notes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Ibuprofen dosing: 10 mg/kg per dose (max 400 mg per dose)</li>
            <li>Always give with food to minimize stomach upset</li>
            <li>May be alternated with paracetamol for improved fever/pain control</li>
            <li>
              Consult specialist for pain management in neonates or complex cases
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
