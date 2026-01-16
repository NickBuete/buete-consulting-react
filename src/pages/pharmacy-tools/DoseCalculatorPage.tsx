import React, { useState, useMemo } from 'react';
import { Download, Sparkles } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { PageHero, Button, Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import {
  PatientDetailsForm,
  MedicationListManager,
  DoseCalendarView,
  DoseCalendarPDF,
} from '../../components/dose-calculator';
import { calculateDoseSchedule, calculatePreparationSummary } from '../../utils/doseCalculation';
import type { PatientDetails, MedicationSchedule, DoseEntry, PreparationSummary } from '../../types/doseCalculator';

const DoseCalculatorPage: React.FC = () => {
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [medications, setMedications] = useState<MedicationSchedule[]>([]);

  // Calculate doses for all medications
  const calculatedDoses = useMemo(() => {
    const dosesMap = new Map<string, DoseEntry[]>();

    medications.forEach((medication) => {
      const doses = calculateDoseSchedule(medication);
      dosesMap.set(medication.id, doses);
    });

    return dosesMap;
  }, [medications]);

  // Calculate preparation summaries for medications with prep tracking
  const preparationSummaries = useMemo((): PreparationSummary[] => {
    return medications
      .filter(med => med.preparationMode !== 'none')
      .map(med => {
        const doses = calculatedDoses.get(med.id) || [];
        return calculatePreparationSummary(med, doses);
      })
      .filter(summary => summary.requiredPreparations.length > 0);
  }, [medications, calculatedDoses]);

  const handleAddMedication = (medication: MedicationSchedule) => {
    setMedications((prev) => [...prev, medication]);
  };

  const handleEditMedication = (medication: MedicationSchedule) => {
    setMedications((prev) =>
      prev.map((med) => (med.id === medication.id ? medication : med))
    );
  };

  const handleDeleteMedication = (medicationId: string) => {
    setMedications((prev) => prev.filter((med) => med.id !== medicationId));
  };

  const handleDownloadPDF = async () => {
    if (!patient) return;

    try {
      // Generate the PDF document
      const doc = <DoseCalendarPDF patient={patient} medications={medications} calculatedDoses={calculatedDoses} />;
      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${patient.name.replace(/\s+/g, '_')}_Variable_Dose_Schedule_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    }
  };

  const isReadyToView = patient && patient.name && medications.length > 0;

  return (
    <>
      <PageHero
        title="Variable Dose Planner"
        subtitle="Create complex dosing schedules for patient medications"
        description="Generate printable medication schedules with support for titration, cyclic dosing, day-of-week dosing, and multi-phase tapers. Includes preparation optimization for compounding."
        backgroundVariant="gradient"
      />

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 no-print">
            <h2 className="text-lg font-semibold text-blue-900 font-heading mb-2">
              How to use this planner
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 font-body">
              <li>Enter patient details including name, date of birth, and address</li>
              <li>Add medications and choose a schedule type:
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li><strong>Linear Titration:</strong> Gradual increase/decrease (e.g., prednisolone taper)</li>
                  <li><strong>Cyclic Dosing:</strong> X days on, Y days off (e.g., OCP 21/7)</li>
                  <li><strong>Day-of-Week:</strong> Different doses per day (e.g., warfarin)</li>
                  <li><strong>Multi-Phase Taper:</strong> Custom phases (e.g., SNRI detox)</li>
                </ul>
              </li>
              <li>Optionally specify preparations for tablet breakdown and quantity calculations</li>
              <li>Review the generated calendar and download the PDF</li>
            </ol>
          </div>

          {/* Patient Details Form */}
          <PatientDetailsForm patient={patient} onUpdate={setPatient} />

          {/* Medication List Manager */}
          <MedicationListManager
            medications={medications}
            onAdd={handleAddMedication}
            onEdit={handleEditMedication}
            onDelete={handleDeleteMedication}
          />

          {/* Preparation Summary - Only show if there are preparations */}
          {preparationSummaries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                  Preparation Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Total preparations needed for the entire course:
                </p>
                <div className="space-y-4">
                  {preparationSummaries.map((summary) => (
                    <div key={summary.medicationId} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">{summary.medicationName}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {summary.requiredPreparations.map((req, index) => (
                          <div key={index} className="bg-white p-2 rounded border border-blue-100">
                            <div className="text-lg font-bold text-blue-800">
                              {req.preparation.strength}{req.preparation.unit}
                            </div>
                            <div className="text-sm text-gray-600">
                              {req.totalQuantity} {req.totalQuantity === 1 ? 'tablet' : 'tablets'}
                            </div>
                          </div>
                        ))}
                      </div>
                      {!summary.canAchieveAllDoses && summary.warnings.length > 0 && (
                        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                          <strong>Warning:</strong> {summary.warnings.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Calendar View - Only shown when ready */}
          {isReadyToView && (
            <>
              <DoseCalendarView
                medications={medications}
                calculatedDoses={calculatedDoses}
              />

              {/* Download PDF Button */}
              <div className="flex justify-end">
                <Button onClick={handleDownloadPDF} size="lg" className="gap-2">
                  <Download className="h-5 w-5" />
                  Download PDF Schedule
                </Button>
              </div>
            </>
          )}

          {/* Helpful message when not ready */}
          {!isReadyToView && (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-gray-600 font-body text-lg mb-2">
                Complete the steps above to generate your dosing calendar
              </p>
              <p className="text-gray-500 font-body text-sm">
                {!patient || !patient.name
                  ? 'Start by entering patient details'
                  : 'Add at least one medication to continue'}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default DoseCalculatorPage;
