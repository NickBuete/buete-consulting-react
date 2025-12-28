import React, { useMemo, useState } from "react";
import { Link } from "react-router";
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
  Button,
} from "../../components/ui";
import { ROUTES } from "../../router/routes";

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


const BSACalculator: React.FC = () => {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [heightUnit, setHeightUnit] = useState("cm");

  const bsa = useMemo(() => {
    const weightValue = Number(weight);
    const heightValue = Number(height);

    if (!weightValue || !heightValue) {
      return null;
    }

    // Convert to kg and cm if needed
    const weightKg = weightUnit === "kg" ? weightValue : weightValue * 0.453592;
    const heightCm = heightUnit === "cm" ? heightValue : heightValue * 2.54;

    // Mosteller formula: BSA (m²) = √[(height × weight) / 3600]
    const bsaValue = Math.sqrt((heightCm * weightKg) / 3600);

    return bsaValue.toFixed(3);
  }, [weight, height, weightUnit, heightUnit]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-3">
          <span className="text-2xl">👶</span>
          Pediatric Body Surface Area
        </CardTitle>
        <CardDescription className="font-body">
          Calculate BSA using the Mosteller formula for pediatric dose calculations and chemotherapy regimens.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bsa-weight">Weight</Label>
            <div className="flex gap-2">
              <Input
                id="bsa-weight"
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g., 25"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                className="flex-1"
              />
              <Select value={weightUnit} onValueChange={setWeightUnit}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lb">lb</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bsa-height">Height</Label>
            <div className="flex gap-2">
              <Input
                id="bsa-height"
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g., 120"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
                className="flex-1"
              />
              <Select value={heightUnit} onValueChange={setHeightUnit}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="in">in</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-2">
          <p className="font-heading text-sm text-gray-600">Body Surface Area (Mosteller)</p>
          {bsa === null ? (
            <p className="text-sm text-gray-500 font-body">Enter weight and height to calculate BSA.</p>
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-900">{bsa} m²</p>
              <p className="text-xs text-gray-600 font-body">
                Formula: BSA (m²) = √[(height(cm) × weight(kg)) / 3600]
              </p>
            </>
          )}
        </div>

        <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="font-semibold mb-1">Clinical Note:</p>
          <p>
            The Mosteller formula is widely used for pediatric dosing. Always verify dose calculations with current guidelines and consider individual patient factors.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};


const references = [
  {
    name: 'SUSMP (Poisons Standard)',
    description: 'Scheduling and labelling requirements for medicines and poisons.',
    url: 'https://www.tga.gov.au/book-page/poisons-standard-susmp',
  },
  {
    name: 'TGA Medicine Shortages',
    description: 'Real-time database of current and anticipated medicine shortages.',
    url: 'https://www.tga.gov.au/medicine-shortages',
  },
  {
    name: 'PBS Schedule',
    description: 'Latest PBS pricing, restrictions, and authority codes.',
    url: 'https://www.pbs.gov.au/pbs/home',
  },
  {
    name: 'QCPP Hub',
    description: 'Quality Care Pharmacy Program standards, audits, and resources.',
    url: 'https://www.qcpp.com/',
  },
  {
    name: 'SafeScript (Victoria)',
    description: 'Real-time prescription monitoring for Schedule 8/4 medicines.',
    url: 'https://www.safescript.vic.gov.au/',
  },
  {
    name: 'SafeScript NSW',
    description: 'NSW prescription monitoring portal for monitored medicines.',
    url: 'https://www.safescript.health.nsw.gov.au/',
  },
  {
    name: 'SafeScript Tasmania',
    description: 'Tasmanian monitored medicines database (DAPIS Online Reporting).',
    url: 'https://www.dhhs.tas.gov.au/psbtas/quick_links/dapis_online_reporting',
  },
  {
    name: 'WA Real Time Prescription Monitoring',
    description: 'Monitor schedule 8 supply across Western Australia.',
    url: 'https://www.health.wa.gov.au/Articles/N_R/Real-Time-Prescription-Monitoring',
  },
  {
    name: 'Medicines Handbook (SA Health)',
    description: 'High-risk medicine protocols and state-based advisories.',
    url: 'https://www.sahealth.sa.gov.au/wps/wcm/connect/public+content/sa+health+internet/clinical+resources/clinical+programs+and+practice+guidelines/medicines+and+drugs',
  },
  {
    name: 'Australian Immunisation Handbook',
    description: 'Clinical vaccine recommendations and catch-up schedules.',
    url: 'https://immunisationhandbook.health.gov.au/',
  },
];

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
            <Card className="md:col-span-2 bg-gradient-to-r from-brand-50 to-orange-50 border-brand-200">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-3">
                  <span className="text-2xl">🧮</span>
                  Medication Dosing Calculator
                </CardTitle>
                <CardDescription className="font-body">
                  Create detailed titration schedules with automatic dose calculations for tapering, increasing, or maintaining medication doses. Generate printable patient handouts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={ROUTES.DOSE_CALCULATOR}>
                  <Button size="lg" className="gap-2">
                    Open Dose Calculator →
                  </Button>
                </Link>
                <p className="mt-4 text-sm text-gray-600 font-body">
                  <strong>Example:</strong> Automatically generate a Prednisolone taper schedule reducing by 5mg every 7 days, or plan complex warfarin dose adjustments.
                </p>
              </CardContent>
            </Card>

            <CreatinineCalculator />
            <UnitConverter />
            <BSACalculator />

            <Card className="md:col-span-2 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-3">
                  <span className="text-2xl">💊</span>
                  Pain Management & Opioid Conversions
                </CardTitle>
                <CardDescription className="font-body">
                  Comprehensive suite of opioid conversion calculators including MME calculations, breakthrough pain dosing,
                  morphine to fentanyl patch conversions, oral to subcutaneous conversions, and methadone route changes.
                  All based on Safer Care Victoria guidelines.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={ROUTES.PAIN_MANAGEMENT}>
                  <Button size="lg" className="gap-2">
                    Open Pain Management Tools →
                  </Button>
                </Link>
                <p className="mt-4 text-sm text-gray-600 font-body">
                  <strong>Includes:</strong> Opioid to MME converter (12 formulations), breakthrough pain calculator,
                  morphine to fentanyl patch converter, oral to SC converter, and methadone route converter.
                </p>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-3">
                  <span className="text-2xl">📚</span>
                  Quick Reference Library
                </CardTitle>
                <CardDescription className="font-body">
                  Trusted Australian resources for regulatory updates, safety advisories, and practice support.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {references.map((item) => (
                  <div key={item.url} className="space-y-2 rounded-md border border-gray-200 p-4 hover:border-brand-300">
                    <p className="font-heading text-sm text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-600 font-body">{item.description}</p>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-700"
                    >
                      Visit resource →
                    </a>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};

export default PharmacyToolsPage;
