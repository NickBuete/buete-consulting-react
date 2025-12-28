import React, { useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { PageHero, Button } from '../../components/ui';
import {
  PatientDetailsForm,
  MedicationListManager,
  DoseCalendarView,
  DoseCalendarPDF,
} from '../../components/dose-calculator';
import { calculateDoseSchedule } from '../../utils/doseCalculation';
import type { PatientDetails, MedicationSchedule, DoseEntry } from '../../types/doseCalculator';

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
      link.download = `${patient.name.replace(/\s+/g, '_')}_Medication_Schedule_${new Date().toISOString().split('T')[0]}.pdf`;
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
        title="Medication Dosing Calculator"
        subtitle="Create detailed titration schedules for patient medications"
        description="Generate printable medication schedules with automatic dose calculations for tapering, titration, and maintenance therapy."
        backgroundVariant="gradient"
      />

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 no-print">
            <h2 className="text-lg font-semibold text-blue-900 font-heading mb-2">
              How to use this calculator
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 font-body">
              <li>Enter patient details including name, date of birth, and address</li>
              <li>Add one or more medications with their titration schedules</li>
              <li>Review the generated calendar showing doses for each day</li>
              <li>Click "Print Schedule" to create a patient handout</li>
            </ol>
            <p className="mt-4 text-sm text-blue-700 font-body">
              <strong>Example:</strong> Prednisolone 50mg, decrease by 5mg every 7 days will
              automatically generate a tapering schedule: 50mg for 7 days, then 45mg for 7 days,
              continuing until the medication is stopped.
            </p>
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
