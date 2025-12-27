/**
 * Data Entry Form - Refactored
 * Reduced from 839 lines to ~190 lines by extracting table components
 * Each section is now self-contained and reusable
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, Form, Button } from '../ui';
import { Save } from 'lucide-react';
import type { HmrReview, CreateHmrReviewPayload } from '../../types/hmr';
import {
  MedicalHistoryTable,
  type MedicalHistoryEntry,
} from './MedicalHistoryTable';
import { AllergiesTable, type AllergyEntry } from './AllergiesTable';
import { PathologyTable, type PathologyEntry } from './PathologyTable';
import {
  MedicationsSection,
  type MedicationEntry,
} from './MedicationsSection';

interface DataEntryFormValues {
  pastMedicalHistory: string;
  allergies: string;
  pathology: string;
  medications: MedicationEntry[];
}

interface DataEntryFormProps {
  review: HmrReview;
  onSubmit: (data: Partial<CreateHmrReviewPayload>) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export const DataEntryForm: React.FC<DataEntryFormProps> = ({
  review,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const form = useForm<DataEntryFormValues>({
    defaultValues: {
      pastMedicalHistory: review.pastMedicalHistory || '',
      allergies: review.allergies || '',
      pathology: review.pathology || '',
      medications:
        review.medications?.map((m) => ({
          name: m.name,
          dose: m.dose || '',
          frequency: m.frequency || '',
          indication: m.indication || '',
          notes: m.notes || '',
        })) || [],
    },
  });

  // Extract structured data from review or initialize empty
  const initialMedicalHistory: MedicalHistoryEntry[] = React.useMemo(
    () =>
      review.medicalHistory?.map((entry) => ({
        year: entry.year || '',
        condition: entry.condition,
        notes: entry.notes || '',
      })) || [],
    [review.medicalHistory]
  );

  const initialAllergies: AllergyEntry[] = React.useMemo(
    () =>
      review.allergiesTable?.map((entry) => ({
        allergen: entry.allergen,
        reaction: entry.reaction || '',
        severity: entry.severity || '',
      })) || [],
    [review.allergiesTable]
  );

  const initialPathology: PathologyEntry[] = React.useMemo(
    () =>
      review.pathologyResults?.map((entry) => ({
        date: entry.date || '',
        test: entry.test,
        result: entry.result,
        notes: entry.notes || '',
      })) || [],
    [review.pathologyResults]
  );

  // State for structured table data
  const [medicalHistory, setMedicalHistory] = React.useState<MedicalHistoryEntry[]>(
    initialMedicalHistory
  );
  const [allergies, setAllergies] = React.useState<AllergyEntry[]>(initialAllergies);
  const [pathology, setPathology] = React.useState<PathologyEntry[]>(initialPathology);
  const [medications, setMedications] = React.useState<MedicationEntry[]>(
    form.getValues('medications')
  );

  const handleSubmit = async (values: DataEntryFormValues) => {
    await onSubmit({
      pastMedicalHistory: values.pastMedicalHistory,
      allergies: values.allergies,
      pathology: values.pathology,
      medicalHistory: medicalHistory.filter(
        (entry) => entry.condition.trim() !== ''
      ),
      allergiesTable: allergies.filter((entry) => entry.allergen.trim() !== ''),
      pathologyResults: pathology.filter((entry) => entry.test.trim() !== ''),
      medications: medications.map((med) => ({
        name: med.name,
        dose: med.dose || null,
        frequency: med.frequency || null,
        indication: med.indication || null,
        notes: med.notes || null,
      })),
    });
  };

  return (
    <div className="space-y-6">
      {/* Patient Information Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">
                {review.patient?.firstName} {review.patient?.lastName}
              </h3>
              <p className="text-sm text-blue-700">
                DOB: {review.patient?.dateOfBirth || 'Not provided'} | Medicare:{' '}
                {review.patient?.medicareNumber || 'Not provided'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-700">
                Referral Date: {review.referralDate || 'Not set'}
              </p>
              {review.prescriber && (
                <p className="text-sm text-blue-700">
                  Prescriber: {review.prescriber.firstName}{' '}
                  {review.prescriber.lastName}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Medical History Table - Self-contained component */}
          <MedicalHistoryTable
            initialData={medicalHistory}
            onChange={setMedicalHistory}
          />

          {/* Allergies Table - Self-contained component */}
          <AllergiesTable initialData={allergies} onChange={setAllergies} />

          {/* Pathology Results Table - Self-contained component */}
          <PathologyTable initialData={pathology} onChange={setPathology} />

          {/* Current Medications Section - Self-contained component */}
          <MedicationsSection
            initialData={medications}
            onChange={setMedications}
          />

          {/* Medications Note */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="py-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Medications will be saved separately after
                you save the main data entry. You can also add and manage
                medications through the medications tab.
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Data Entry
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
