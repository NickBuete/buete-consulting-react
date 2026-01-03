import React from "react";
import { Link } from "react-router";
import {
  PageHero,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from "../../components/ui";
import { ROUTES } from "../../router/routes";
import {
  CreatinineCalculator,
  UnitConverter,
  BSACalculator,
} from "../../components/pharmacy-calculators";


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
            <Card className="md:col-span-2 bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-3">
                  <span className="text-2xl">👶</span>
                  Pediatric Dosing Tools
                </CardTitle>
                <CardDescription className="font-body">
                  Weight-based dose calculators and schedulers for paediatric patients. Includes BSA calculations,
                  paracetamol and ibuprofen dose calculators, and printable daily dose timetables for parents.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={ROUTES.PEDIATRIC_TOOLS}>
                  <Button size="lg" className="gap-2">
                    Open Pediatric Tools →
                  </Button>
                </Link>
                <p className="mt-4 text-sm text-gray-600 font-body">
                  <strong>Includes:</strong> Body surface area calculator, paracetamol/ibuprofen dose calculator,
                  and daily dose scheduler with 4-hour (paracetamol) and 6-hour (ibuprofen) intervals.
                </p>
              </CardContent>
            </Card>
            <Card className="md:col-span-2 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  Learn to Swallow Tablets
                </CardTitle>
                <CardDescription className="font-body">
                  Interactive, gamified training program for children learning to swallow tablets.
                  Based on Royal Children's Hospital Melbourne evidence-based guidelines with 5 progressive levels.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={ROUTES.PILL_SWALLOWING}>
                  <Button size="lg" className="gap-2">
                    Open Tablet Swallowing Trainer →
                  </Button>
                </Link>
                <p className="mt-4 text-sm text-gray-600 font-body">
                  <strong>Features:</strong> Step-by-step progression from tiny lolly pieces to full capsules,
                  visual size guides, personalized certificates, and fun encouragement messages. Perfect for kids aged 4+.
                </p>
              </CardContent>
            </Card>
            <CreatinineCalculator />
            <UnitConverter />
            <BSACalculator />
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
