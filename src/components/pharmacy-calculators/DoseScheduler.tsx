import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui";
import { PrintableDoseSchedule } from "./PrintableDoseSchedule";
import { printDoseSchedule } from "./dose-scheduler/print";

// Product definitions
const PARACETAMOL_PRODUCTS = [
  { value: "100", label: "Infant drops (100 mg/mL)" },
  { value: "50", label: "Babies/Kids liquid (50 mg/mL)" },
  { value: "24", label: "Children's 1-5 years (24 mg/mL)" },
  { value: "48", label: "Children's 5-12 years (48 mg/mL)" },
];

const IBUPROFEN_PRODUCTS = [
  { value: "20", label: "Infant & Children's suspension (20 mg/mL)" },
  { value: "40", label: "Children's suspension (40 mg/mL)" },
];

interface ScheduleEntry {
  time: string;
  medication: string;
  dose: string;
  volume: string | null;
}

type WizardStep = "patient" | "medications" | "products" | "schedule" | "review";

const STEPS: { id: WizardStep; label: string; number: number }[] = [
  { id: "patient", label: "Patient", number: 1 },
  { id: "medications", label: "Medications", number: 2 },
  { id: "products", label: "Products", number: 3 },
  { id: "schedule", label: "Schedule", number: 4 },
  { id: "review", label: "Review", number: 5 },
];

export const DoseScheduler: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<WizardStep>("patient");

  // Patient info
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [weight, setWeight] = useState("");

  // Medication selection
  const [includeParacetamol, setIncludeParacetamol] = useState(true);
  const [includeIbuprofen, setIncludeIbuprofen] = useState(true);

  // Product selection
  const [paracetamolConcentration, setParacetamolConcentration] = useState("");
  const [ibuprofenConcentration, setIbuprofenConcentration] = useState("");

  // Schedule times
  const [paracetamolFirstDose, setParacetamolFirstDose] = useState("08:00");
  const [ibuprofenFirstDose, setIbuprofenFirstDose] = useState("08:00");

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  const canProceedFromPatient = weight && Number(weight) > 0;
  const canProceedFromMedications = includeParacetamol || includeIbuprofen;
  const canProceedFromProducts =
    (!includeParacetamol || paracetamolConcentration) &&
    (!includeIbuprofen || ibuprofenConcentration);

  const goToStep = (step: WizardStep) => {
    setCurrentStep(step);
  };

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id);
    }
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
    }
  };

  // Calculate doses
  const paracetamolDose = useMemo(() => {
    const weightValue = Number(weight);
    if (!weightValue || weightValue <= 0) return null;
    const dose = Math.min(weightValue * 15, 1000);
    const concentration = Number(paracetamolConcentration);
    const volume = concentration > 0 ? dose / concentration : null;
    return {
      mg: Math.round(dose),
      ml: volume !== null ? Math.round(volume * 10) / 10 : null,
    };
  }, [weight, paracetamolConcentration]);

  const ibuprofenDose = useMemo(() => {
    const weightValue = Number(weight);
    if (!weightValue || weightValue <= 0) return null;
    const dose = Math.min(weightValue * 10, 400);
    const concentration = Number(ibuprofenConcentration);
    const volume = concentration > 0 ? dose / concentration : null;
    return {
      mg: Math.round(dose),
      ml: volume !== null ? Math.round(volume * 10) / 10 : null,
    };
  }, [weight, ibuprofenConcentration]);

  const schedule = useMemo((): ScheduleEntry[] => {
    const entries: ScheduleEntry[] = [];

    const addHours = (timeStr: string, hoursToAdd: number): string => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return timeStr;
      const newHour = (hours + hoursToAdd) % 24;
      return `${String(newHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    // Paracetamol: 4 doses at 4-hour intervals
    if (includeParacetamol && paracetamolDose && paracetamolFirstDose) {
      for (let i = 0; i < 4; i++) {
        const time = addHours(paracetamolFirstDose, i * 4);
        entries.push({
          time,
          medication: 'Paracetamol',
          dose: `${paracetamolDose.mg} mg`,
          volume: paracetamolDose.ml !== null ? `${paracetamolDose.ml} mL` : null,
        });
      }
    }

    // Ibuprofen: 3 doses at 6-hour intervals
    if (includeIbuprofen && ibuprofenDose && ibuprofenFirstDose) {
      for (let i = 0; i < 3; i++) {
        const time = addHours(ibuprofenFirstDose, i * 6);
        entries.push({
          time,
          medication: 'Ibuprofen',
          dose: `${ibuprofenDose.mg} mg`,
          volume: ibuprofenDose.ml !== null ? `${ibuprofenDose.ml} mL` : null,
        });
      }
    }

    // Sort by time
    return entries.sort((a, b) => {
      const timeA = a.time.split(':').map(Number);
      const timeB = b.time.split(':').map(Number);
      if (timeA[0] !== timeB[0]) return timeA[0] - timeB[0];
      return timeA[1] - timeB[1];
    });
  }, [includeParacetamol, includeIbuprofen, paracetamolDose, ibuprofenDose, paracetamolFirstDose, ibuprofenFirstDose]);

  const handlePrint = () => {
    const printContent = document.getElementById('printable-dose-schedule');
    if (!printContent) return;
    printDoseSchedule({
      childName,
      contentHtml: printContent.innerHTML,
    });
  };

  const getProductLabel = (products: typeof PARACETAMOL_PRODUCTS, value: string) => {
    return products.find(p => p.value === value)?.label || '';
  };

  // Render step indicator
  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-6">
      {STEPS.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = index < currentStepIndex;
        const isClickable = index <= currentStepIndex;

        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => isClickable && goToStep(step.id)}
              disabled={!isClickable}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? '✓' : step.number}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  isActive ? 'text-brand-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </button>
            {index < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  // Render patient step
  const renderPatientStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="font-heading text-lg font-semibold text-gray-900">Patient Information</h3>
        <p className="text-sm text-gray-600">Enter the child's details to calculate appropriate doses</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="scheduler-child-name">Child's Name</Label>
        <Input
          id="scheduler-child-name"
          type="text"
          placeholder="e.g., Sarah"
          value={childName}
          onChange={(event) => setChildName(event.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="scheduler-child-age">Age (years)</Label>
          <Input
            id="scheduler-child-age"
            type="number"
            min="0"
            step="1"
            placeholder="e.g., 5"
            value={childAge}
            onChange={(event) => setChildAge(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="scheduler-weight">Weight (kg) *</Label>
          <Input
            id="scheduler-weight"
            type="number"
            min="0"
            step="0.1"
            placeholder="e.g., 15"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={goNext} disabled={!canProceedFromPatient}>
          Next: Select Medications →
        </Button>
      </div>
    </div>
  );

  // Render medications step
  const renderMedicationsStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="font-heading text-lg font-semibold text-gray-900">Select Medications</h3>
        <p className="text-sm text-gray-600">Choose which medications to include in the schedule</p>
      </div>

      <div className="grid gap-4">
        <button
          type="button"
          onClick={() => setIncludeParacetamol(!includeParacetamol)}
          className={`p-4 rounded-lg border-2 text-left transition-colors ${
            includeParacetamol
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                includeParacetamol ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'
              }`}
            >
              {includeParacetamol && '✓'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">Paracetamol</p>
              <p className="text-sm text-gray-600">15 mg/kg per dose, every 4 hours (max 4 doses/day)</p>
              {paracetamolDose && (
                <p className="text-sm font-semibold text-blue-600 mt-1">
                  Calculated dose: {paracetamolDose.mg} mg per dose
                </p>
              )}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setIncludeIbuprofen(!includeIbuprofen)}
          className={`p-4 rounded-lg border-2 text-left transition-colors ${
            includeIbuprofen
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                includeIbuprofen ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
              }`}
            >
              {includeIbuprofen && '✓'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">Ibuprofen</p>
              <p className="text-sm text-gray-600">10 mg/kg per dose, every 6 hours (max 3 doses/day)</p>
              {ibuprofenDose && (
                <p className="text-sm font-semibold text-green-600 mt-1">
                  Calculated dose: {ibuprofenDose.mg} mg per dose
                </p>
              )}
            </div>
          </div>
        </button>
      </div>

      {!canProceedFromMedications && (
        <p className="text-sm text-amber-600 text-center">Please select at least one medication</p>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={goBack}>
          ← Back
        </Button>
        <Button onClick={goNext} disabled={!canProceedFromMedications}>
          Next: Select Products →
        </Button>
      </div>
    </div>
  );

  // Render products step
  const renderProductsStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="font-heading text-lg font-semibold text-gray-900">Select Products</h3>
        <p className="text-sm text-gray-600">Choose the specific products to calculate volume in mL</p>
      </div>

      {includeParacetamol && (
        <div className="space-y-2 p-4 rounded-lg border border-blue-200 bg-blue-50">
          <Label htmlFor="paracetamol-product" className="text-blue-900 font-semibold">
            Paracetamol Product
          </Label>
          <Select value={paracetamolConcentration} onValueChange={setParacetamolConcentration}>
            <SelectTrigger id="paracetamol-product" className="bg-white">
              <SelectValue placeholder="Select paracetamol product" />
            </SelectTrigger>
            <SelectContent>
              {PARACETAMOL_PRODUCTS.map(product => (
                <SelectItem key={product.value} value={product.value}>
                  {product.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {paracetamolDose && paracetamolConcentration && (
            <p className="text-sm text-blue-700 font-semibold">
              {paracetamolDose.mg} mg = {paracetamolDose.ml} mL per dose
            </p>
          )}
        </div>
      )}

      {includeIbuprofen && (
        <div className="space-y-2 p-4 rounded-lg border border-green-200 bg-green-50">
          <Label htmlFor="ibuprofen-product" className="text-green-900 font-semibold">
            Ibuprofen Product
          </Label>
          <Select value={ibuprofenConcentration} onValueChange={setIbuprofenConcentration}>
            <SelectTrigger id="ibuprofen-product" className="bg-white">
              <SelectValue placeholder="Select ibuprofen product" />
            </SelectTrigger>
            <SelectContent>
              {IBUPROFEN_PRODUCTS.map(product => (
                <SelectItem key={product.value} value={product.value}>
                  {product.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {ibuprofenDose && ibuprofenConcentration && (
            <p className="text-sm text-green-700 font-semibold">
              {ibuprofenDose.mg} mg = {ibuprofenDose.ml} mL per dose
            </p>
          )}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={goBack}>
          ← Back
        </Button>
        <Button onClick={goNext} disabled={!canProceedFromProducts}>
          Next: Set Schedule →
        </Button>
      </div>
    </div>
  );

  // Render schedule step
  const renderScheduleStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="font-heading text-lg font-semibold text-gray-900">Set Dose Times</h3>
        <p className="text-sm text-gray-600">Choose when to start each medication's schedule</p>
      </div>

      {includeParacetamol && (
        <div className="space-y-2 p-4 rounded-lg border border-blue-200 bg-blue-50">
          <Label htmlFor="paracetamol-first-dose" className="text-blue-900 font-semibold">
            Paracetamol First Dose Time
          </Label>
          <Input
            id="paracetamol-first-dose"
            type="time"
            value={paracetamolFirstDose}
            onChange={(event) => setParacetamolFirstDose(event.target.value)}
            className="bg-white"
          />
          <p className="text-xs text-blue-700">
            Doses will be scheduled every 4 hours: {paracetamolFirstDose}, then +4h, +8h, +12h
          </p>
        </div>
      )}

      {includeIbuprofen && (
        <div className="space-y-2 p-4 rounded-lg border border-green-200 bg-green-50">
          <Label htmlFor="ibuprofen-first-dose" className="text-green-900 font-semibold">
            Ibuprofen First Dose Time
          </Label>
          <Input
            id="ibuprofen-first-dose"
            type="time"
            value={ibuprofenFirstDose}
            onChange={(event) => setIbuprofenFirstDose(event.target.value)}
            className="bg-white"
          />
          <p className="text-xs text-green-700">
            Doses will be scheduled every 6 hours: {ibuprofenFirstDose}, then +6h, +12h
          </p>
        </div>
      )}

      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
        <p className="font-semibold mb-1">Tip: Alternating Medications</p>
        <p>
          For improved fever/pain control, you can alternate paracetamol and ibuprofen.
          Try starting ibuprofen 2-3 hours after the first paracetamol dose.
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={goBack}>
          ← Back
        </Button>
        <Button onClick={goNext}>
          Next: Review Schedule →
        </Button>
      </div>
    </div>
  );

  // Render review step
  const renderReviewStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="font-heading text-lg font-semibold text-gray-900">Review & Print</h3>
        <p className="text-sm text-gray-600">Review the schedule and print for the parent/carer</p>
      </div>

      {/* Summary */}
      <div className="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Patient:</span>{' '}
            <span className="font-semibold">{childName || 'Not specified'}</span>
          </div>
          <div>
            <span className="text-gray-500">Weight:</span>{' '}
            <span className="font-semibold">{weight} kg</span>
          </div>
          {childAge && (
            <div>
              <span className="text-gray-500">Age:</span>{' '}
              <span className="font-semibold">{childAge} years</span>
            </div>
          )}
        </div>
        {includeParacetamol && paracetamolConcentration && (
          <div className="text-sm">
            <span className="text-gray-500">Paracetamol:</span>{' '}
            <span className="font-semibold text-blue-700">
              {getProductLabel(PARACETAMOL_PRODUCTS, paracetamolConcentration)}
            </span>
          </div>
        )}
        {includeIbuprofen && ibuprofenConcentration && (
          <div className="text-sm">
            <span className="text-gray-500">Ibuprofen:</span>{' '}
            <span className="font-semibold text-green-700">
              {getProductLabel(IBUPROFEN_PRODUCTS, ibuprofenConcentration)}
            </span>
          </div>
        )}
      </div>

      {/* Schedule Table */}
      <div className="rounded-md border border-gray-200 bg-white p-4 space-y-3" id="dose-schedule">
        <div className="text-center space-y-1">
          <h3 className="font-heading text-lg font-bold text-gray-900">
            Medication Schedule
          </h3>
          {childName && (
            <p className="text-sm text-gray-600 font-semibold">{childName}</p>
          )}
          <p className="text-sm text-gray-600">
            {childAge && `Age: ${childAge} years | `}Weight: {weight} kg
          </p>
        </div>

        <div className="border-t pt-3">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-2 px-2 font-heading text-sm font-semibold text-gray-700">
                  Time
                </th>
                <th className="text-left py-2 px-2 font-heading text-sm font-semibold text-gray-700">
                  Medication
                </th>
                <th className="text-left py-2 px-2 font-heading text-sm font-semibold text-gray-700">
                  Dose
                </th>
                <th className="text-left py-2 px-2 font-heading text-sm font-semibold text-gray-700">
                  Volume
                </th>
                <th className="text-center py-2 px-2 font-heading text-sm font-semibold text-gray-700">
                  Given
                </th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((entry, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-2 px-2 font-mono text-sm font-semibold">
                    {entry.time}
                  </td>
                  <td className={`py-2 px-2 text-sm font-medium ${
                    entry.medication === 'Paracetamol' ? 'text-blue-700' : 'text-green-700'
                  }`}>
                    {entry.medication}
                  </td>
                  <td className="py-2 px-2 text-sm">
                    {entry.dose}
                  </td>
                  <td className="py-2 px-2 text-sm font-semibold text-brand-600">
                    {entry.volume || '-'}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <div className="w-5 h-5 border-2 border-gray-400 rounded inline-block"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Button onClick={handlePrint} className="w-full" size="lg">
        Print Schedule
      </Button>

      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
        <p className="font-semibold mb-1">Safety Notes:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Paracetamol: Maximum 4 doses per day (max 1g per dose, 4g per day)</li>
          <li>Ibuprofen: Maximum 3 doses per day (max 400mg per dose). Give with food.</li>
          <li>This is a guide only - verify all doses with AMH Children's Dosing Companion</li>
        </ul>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={goBack}>
          ← Back
        </Button>
        <Button variant="outline" onClick={() => goToStep("patient")}>
          Start Over
        </Button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "patient":
        return renderPatientStep();
      case "medications":
        return renderMedicationsStep();
      case "products":
        return renderProductsStep();
      case "schedule":
        return renderScheduleStep();
      case "review":
        return renderReviewStep();
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-3">
            <span className="text-2xl">📅</span>
            Daily Dose Scheduler
          </CardTitle>
          <CardDescription className="font-body">
            Generate a printable medication schedule for paracetamol and ibuprofen dosing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepIndicator()}
          {renderCurrentStep()}
        </CardContent>
      </Card>

      {/* Hidden printable version */}
      <div id="printable-dose-schedule" style={{ display: 'none' }}>
        <PrintableDoseSchedule
          childName={childName}
          childAge={childAge}
          weight={weight}
          schedule={schedule}
          paracetamolProduct={includeParacetamol ? getProductLabel(PARACETAMOL_PRODUCTS, paracetamolConcentration) : undefined}
          ibuprofenProduct={includeIbuprofen ? getProductLabel(IBUPROFEN_PRODUCTS, ibuprofenConcentration) : undefined}
        />
      </div>
    </>
  );
};
