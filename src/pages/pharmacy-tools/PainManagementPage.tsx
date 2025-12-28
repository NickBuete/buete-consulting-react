import React from "react";
import { PageHero, Card, CardContent, CardHeader, CardTitle } from "../../components/ui";
import {
  OpioidCalculator,
  BreakthroughPainCalculator,
  MorphineToFentanylConverter,
  OralToSubcutaneousConverter,
  MethadoneConverter,
} from "../../components/pharmacy-calculators";

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
