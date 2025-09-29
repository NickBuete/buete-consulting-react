import React, { useMemo, useState } from "react";
import {
  PageHero,
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
  Textarea,
} from "../../components/ui";

const CreatinineCalculator: React.FC = () => {
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
          Estimate renal function to guide dosing adjustments. Converts \u00B5mol/L to mg/dL automatically.
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
                  <SelectItem value="\u00B5mol/L">\u00B5mol/L</SelectItem>
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

const UnitConverter: React.FC = () => {
  const [conversion, setConversion] = useState("mgml-to-percent");
  const [input, setInput] = useState("");

  const output = useMemo(() => {
    const value = Number(input);
    if (!value && value !== 0) {
      return "";
    }

    switch (conversion) {
      case "mgml-to-percent":
        return `${(value / 10).toFixed(4)} % w/v`;
      case "percent-to-mgml":
        return `${(value * 10).toFixed(3)} mg/mL`;
      case "mg-to-mcg":
        return `${(value * 1000).toFixed(0)} mcg`;
      case "mcg-to-mg":
        return `${(value / 1000).toFixed(3)} mg`;
      case "c-to-f":
        return `${(value * 9) / 5 + 32} °F`;
      case "f-to-c":
        return `${((value - 32) * 5) / 9} °C`;
      default:
        return "";
    }
  }, [conversion, input]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-3">
          <span className="text-2xl">🔄</span>
          Unit & Concentration Converter
        </CardTitle>
        <CardDescription className="font-body">
          Quick conversions between common pharmaceutical units, concentrations, and temperatures.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="conversion">Conversion type</Label>
          <Select value={conversion} onValueChange={setConversion}>
            <SelectTrigger id="conversion">
              <SelectValue placeholder="Select conversion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mgml-to-percent">mg/mL → % w/v</SelectItem>
              <SelectItem value="percent-to-mgml">% w/v → mg/mL</SelectItem>
              <SelectItem value="mg-to-mcg">mg → mcg</SelectItem>
              <SelectItem value="mcg-to-mg">mcg → mg</SelectItem>
              <SelectItem value="c-to-f">°C → °F</SelectItem>
              <SelectItem value="f-to-c">°F → °C</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="conversion-input">Value</Label>
          <Input
            id="conversion-input"
            type="number"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </div>
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
          <p className="font-heading text-sm text-gray-600">Converted value</p>
          {output ? (
            <p className="text-lg font-semibold text-gray-900">{output}</p>
          ) : (
            <p className="text-sm text-gray-500 font-body">Enter a numeric value to see the conversion.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const opioidFactors: Record<string, { label: string; factor: number }> = {
  morphine: { label: "Morphine (oral)", factor: 1 },
  oxycodone: { label: "Oxycodone (oral)", factor: 1.5 },
  hydromorphone: { label: "Hydromorphone (oral)", factor: 4 },
  tramadol: { label: "Tramadol (oral)", factor: 0.1 },
};

const OpioidCalculator: React.FC = () => {
  const [opioid, setOpioid] = useState("morphine");
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
          Opioid Conversion (Oral → MME)
        </CardTitle>
        <CardDescription className="font-body">
          Calculate morphine milligram equivalents to support safe opioid rotation. Always consider patient-specific factors.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="opioid-select">Opioid</Label>
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
          <Label htmlFor="opioid-dose">Total daily dose (mg)</Label>
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
          <p className="font-heading text-sm text-gray-600">Morphine equivalent</p>
          {mme === null ? (
            <p className="text-sm text-gray-500 font-body">Enter the daily dose to see the morphine equivalent.</p>
          ) : (
            <p className="text-lg font-semibold text-gray-900">{mme} mg oral morphine per 24 hours</p>
          )}
          <p className="text-xs text-amber-700">
            Apply cross-tolerance reductions (typically 25-50%) when switching opioids. Review guidelines and patient history before prescribing.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const weekdayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const VariableDosePlanner: React.FC = () => {
  const [cycleLength, setCycleLength] = useState("7");
  const [notes, setNotes] = useState("");
  const days = Number(cycleLength);
  const [doses, setDoses] = useState<Record<number, string>>({});

  const handleDoseChange = (index: number, value: string) => {
    setDoses((prev) => ({ ...prev, [index]: value }));
  };

  const schedule = useMemo(() => {
    return Array.from({ length: days }, (_, index) => ({
      label: weekdayNames[index % 7] ?? `Day ${index + 1}`,
      dose: doses[index] ?? "",
    }));
  }, [days, doses]);

  const totalWeeklyDose = useMemo(() => {
    return schedule.reduce((total, day) => total + (Number(day.dose) || 0), 0);
  }, [schedule]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-3">
          <span className="text-2xl">📅</span>
          Variable Dose Planner
        </CardTitle>
        <CardDescription className="font-body">
          Plan tapering schedules, complex warfarin regimens, or chemotherapy cycles and review totals at a glance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
          <Label htmlFor="cycle-length">Cycle length</Label>
            <Select value={cycleLength} onValueChange={setCycleLength}>
              <SelectTrigger id="cycle-length">
                <SelectValue placeholder="Select cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="21">21 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="planner-notes">Notes</Label>
            <Textarea
              id="planner-notes"
              placeholder="INR target, monitoring plan, counselling points..."
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-heading text-gray-600">Day</th>
                <th className="px-4 py-2 text-left font-heading text-gray-600">Dose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {schedule.map((day, index) => (
                <tr key={index} className="bg-white">
                  <td className="px-4 py-2 font-body text-gray-800">{day.label}</td>
                  <td className="px-4 py-2">
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="mg"
                      value={day.dose}
                      onChange={(event) => handleDoseChange(index, event.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 rounded-md border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-700 font-body">
            <span className="font-semibold">Total over {days} days:</span> {totalWeeklyDose.toFixed(2)} units
          </p>
          {notes ? (
            <div className="text-xs text-gray-500 font-body">
              <span className="font-semibold text-gray-700">Notes:</span> {notes}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

const PharmacyToolsPage: React.FC = () => {
  return (
    <>
      <PageHero
        title="Pharmacy Tools"
        subtitle="Essential calculators and planners for everyday clinical scenarios"
        description="Interactive tools built for pharmacists to streamline calculations, conversions, and dosing plans."
        backgroundVariant="gradient"
      />
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900 font-heading">
              Clinical calculators available today
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto font-body">
              Use these calculators during medication reviews, case conferences, or while dispensing to support safe and consistent decision making.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <CreatinineCalculator />
            <UnitConverter />
            <OpioidCalculator />
            <VariableDosePlanner />
          </div>
        </div>
      </section>
    </>
  );
};

export default PharmacyToolsPage;
