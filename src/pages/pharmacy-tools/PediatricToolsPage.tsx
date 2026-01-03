import React from "react";
import { PageHero, Card, CardContent, CardHeader, CardTitle } from "../../components/ui";
import {
  PediatricBSACalculator,
  PediatricDoseCalculator,
  DoseScheduler,
  PillSwallowingTrainer,
} from "../../components/pharmacy-calculators";

const PediatricToolsPage: React.FC = () => {
  return (
    <>
      <PageHero
        title="Pediatric Pharmacy Tools"
        subtitle="Evidence-based calculators for safe pediatric dosing"
        description="BSA calculations, weight-based dosing, and medication scheduling tools for paediatric patients. Always verify doses with current AMH Children's Dosing Companion guidelines."
        backgroundVariant="gradient"
      />
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900 font-heading">
              Pediatric Dosing Calculators
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto font-body">
              Calculate accurate pediatric doses using weight-based formulas and evidence-based guidelines.
              These tools support safe prescribing for common pediatric medications.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <PediatricBSACalculator />
            <PediatricDoseCalculator />
            <DoseScheduler />
            <div className="md:col-span-2">
              <PillSwallowingTrainer />
            </div>

            <Card className="md:col-span-2 bg-amber-50 border-amber-200">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  Important Safety Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm font-body">
                <p className="font-semibold text-amber-900">
                  These calculators are clinical decision support tools only. They do not replace clinical judgment
                  or authoritative dosing references.
                </p>
                <ul className="list-disc list-inside space-y-2 text-amber-800">
                  <li>
                    <strong>Always verify doses:</strong> Cross-reference calculated doses with AMH Children's Dosing
                    Companion or other authoritative pediatric references
                  </li>
                  <li>
                    <strong>Check product concentration:</strong> Pediatric formulations vary widely in strength
                    (e.g., 100 mg/mL vs 200 mg/5 mL paracetamol). Always check the product label before dispensing
                  </li>
                  <li>
                    <strong>Age and weight considerations:</strong> These calculators use standard weight-based dosing.
                    Consider age-specific restrictions and contraindications
                  </li>
                  <li>
                    <strong>Maximum doses:</strong> Never exceed recommended maximum single doses or daily dose limits.
                    Doses are capped at adult maximums where applicable
                  </li>
                  <li>
                    <strong>Individual patient factors:</strong> Consider hepatic/renal function, drug interactions,
                    allergies, and comorbidities when prescribing
                  </li>
                  <li>
                    <strong>Ibuprofen precautions:</strong> Avoid in dehydration, active bleeding, renal impairment,
                    or poorly controlled asthma. Always give with food
                  </li>
                  <li>
                    <strong>Paracetamol precautions:</strong> Use with caution in hepatic impairment or malnutrition.
                    Be aware of combination products containing paracetamol
                  </li>
                  <li>
                    <strong>Specialist consultation:</strong> Seek pediatric or clinical pharmacy advice for neonates,
                    complex cases, or high-risk medications
                  </li>
                  <li>
                    <strong>Documentation:</strong> Record weight, dose calculations, and rationale in clinical notes
                  </li>
                </ul>
                <p className="text-xs text-amber-700 mt-4">
                  Reference: Australian Medicines Handbook Children's Dosing Companion. Adelaide: Australian Medicines
                  Handbook Pty Ltd. Updated regularly at amhonline.amh.net.au
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-3">
                  <span className="text-2xl">📚</span>
                  Dosing Guidelines Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm font-body">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-900">Paracetamol (Acetaminophen)</h4>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      <li><strong>Dose:</strong> 15 mg/kg per dose</li>
                      <li><strong>Maximum single dose:</strong> 1 g (1000 mg)</li>
                      <li><strong>Dosing interval:</strong> Every 4-6 hours</li>
                      <li><strong>Maximum frequency:</strong> 4 doses per day</li>
                      <li><strong>Maximum daily dose:</strong> 4 g (4000 mg)</li>
                      <li><strong>Route:</strong> Oral or rectal</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-900">Ibuprofen</h4>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      <li><strong>Dose:</strong> 10 mg/kg per dose</li>
                      <li><strong>Maximum single dose:</strong> 400 mg</li>
                      <li><strong>Dosing interval:</strong> Every 6-8 hours</li>
                      <li><strong>Maximum frequency:</strong> 3-4 doses per day</li>
                      <li><strong>Maximum daily dose:</strong> 1200 mg (&lt;12 years), 2400 mg (≥12 years)</li>
                      <li><strong>Route:</strong> Oral (with food)</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white rounded border border-blue-300">
                  <p className="font-semibold text-blue-900 mb-1">Alternating Doses:</p>
                  <p className="text-blue-800">
                    Paracetamol and ibuprofen can be alternated for improved fever or pain control. Typical pattern:
                    give paracetamol, then ibuprofen 3 hours later, then paracetamol 3 hours later, etc. Ensure
                    maximum daily doses are not exceeded for either medication.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};

export default PediatricToolsPage;
