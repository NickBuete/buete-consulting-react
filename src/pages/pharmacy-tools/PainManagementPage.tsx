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
} from "../../components/ui";

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

const OpioidCalculator: React.FC = () => {
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

const BreakthroughPainCalculator: React.FC = () => {
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

const MorphineToFentanylConverter: React.FC = () => {
  const [oralMorphine, setOralMorphine] = useState("");

  const fentanylResult = useMemo(() => {
    const dose = Number(oralMorphine);
    if (!dose) {
      return null;
    }

    // Table 3: Oral morphine to transdermal fentanyl conversion
    // Based on Safer Care Victoria guidelines
    let patchSize: number;
    let range: string;

    if (dose < 45) {
      patchSize = 12;
      range = "< 45 mg";
    } else if (dose >= 45 && dose < 90) {
      patchSize = 25;
      range = "45-89 mg";
    } else if (dose >= 90 && dose < 150) {
      patchSize = 50;
      range = "90-149 mg";
    } else if (dose >= 150 && dose < 210) {
      patchSize = 75;
      range = "150-209 mg";
    } else if (dose >= 210 && dose < 270) {
      patchSize = 100;
      range = "210-269 mg";
    } else if (dose >= 270 && dose < 330) {
      patchSize = 125;
      range = "270-329 mg";
    } else if (dose >= 330 && dose < 390) {
      patchSize = 150;
      range = "330-389 mg";
    } else if (dose >= 390 && dose < 450) {
      patchSize = 175;
      range = "390-449 mg";
    } else {
      patchSize = 200;
      range = "≥ 450 mg";
    }

    return { patchSize, range };
  }, [oralMorphine]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-3">
          <span className="text-2xl">🔄</span>
          Morphine to Fentanyl Patch
        </CardTitle>
        <CardDescription className="font-body">
          Convert total daily oral morphine dose to transdermal fentanyl patch strength (Table 3, Safer Care Victoria).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mtf-morphine">Total Daily Oral Morphine (mg/24hr)</Label>
          <Input
            id="mtf-morphine"
            type="number"
            min="0"
            step="1"
            placeholder="e.g., 60"
            value={oralMorphine}
            onChange={(event) => setOralMorphine(event.target.value)}
          />
        </div>

        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-3">
          <p className="font-heading text-sm text-gray-600">Recommended Fentanyl Patch</p>
          {fentanylResult === null ? (
            <p className="text-sm text-gray-500 font-body">Enter total daily oral morphine to see conversion.</p>
          ) : (
            <>
              <div className="bg-white rounded-md border border-gray-300 p-3">
                <p className="text-xs text-gray-600 mb-1">Transdermal Fentanyl</p>
                <p className="text-3xl font-bold text-brand-600">
                  {fentanylResult.patchSize} mcg/hr
                </p>
              </div>
              <div className="text-xs text-gray-600">
                <p>
                  <span className="font-semibold">Morphine range:</span> {fentanylResult.range}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
          <p className="font-semibold mb-1">Important:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Apply 25-50% cross-tolerance dose reduction when switching opioids</li>
            <li>Continue previous opioid for 12-18 hours after applying first patch</li>
            <li>Fentanyl patches take 12-18 hours to reach therapeutic levels</li>
            <li>Provide immediate-release morphine for breakthrough pain</li>
            <li>Change patch every 72 hours unless otherwise specified</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

const OralToSubcutaneousConverter: React.FC = () => {
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

const MethadoneConverter: React.FC = () => {
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

const PainManagementPage: React.FC = () => {
  return (
    <>
      <PageHero
        title="Pain Management Tools"
        subtitle="Opioid conversion calculators and palliative care dosing support"
        description="Evidence-based calculators for safe opioid prescribing, route conversions, and breakthrough pain management based on Safer Care Victoria guidelines."
        backgroundVariant="gradient"
      />
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900 font-heading">
              Opioid Conversion & Pain Management Calculators
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto font-body">
              All calculators use conversion factors from the Safer Care Victoria Opioid Conversion Guidance (February 2021).
              Always apply clinical judgment and consider cross-tolerance reductions when switching opioids.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <OpioidCalculator />
            <BreakthroughPainCalculator />
            <MorphineToFentanylConverter />
            <OralToSubcutaneousConverter />
            <MethadoneConverter />

            <Card className="md:col-span-2 bg-amber-50 border-amber-200">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  Important Safety Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm font-body">
                <p className="font-semibold text-amber-900">
                  These calculators are clinical decision support tools only. They do not replace clinical judgment.
                </p>
                <ul className="list-disc list-inside space-y-2 text-amber-800">
                  <li>
                    <strong>Cross-tolerance:</strong> Apply 25-50% dose reduction when switching between different opioids
                    (incomplete cross-tolerance)
                  </li>
                  <li>
                    <strong>Patient factors:</strong> Consider age, renal/hepatic function, opioid tolerance, concurrent medications,
                    and comorbidities
                  </li>
                  <li>
                    <strong>Titration:</strong> Start at the lower end of calculated dose ranges and titrate to effect
                  </li>
                  <li>
                    <strong>Monitoring:</strong> Regular review of pain control, side effects, and adherence is essential
                  </li>
                  <li>
                    <strong>Specialist consultation:</strong> Consider palliative care or pain specialist input for complex conversions,
                    high doses, or methadone
                  </li>
                  <li>
                    <strong>Documentation:</strong> Record rationale for opioid selection, dose calculations, and monitoring plans
                  </li>
                </ul>
                <p className="text-xs text-amber-700 mt-4">
                  Reference: Safer Care Victoria. Guidance on Opioid Conversion in Palliative Care for Adult Patients. February 2021.
                  Available at: safercare.vic.gov.au
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};

export default PainManagementPage;
