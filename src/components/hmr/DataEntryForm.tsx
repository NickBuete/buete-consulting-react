import React from 'react'
import { useForm } from 'react-hook-form'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
  Textarea,
  Button,
} from '../ui'
import { Plus, Save, Trash2 } from 'lucide-react'
import type { HmrReview } from '../../types/hmr'

interface DataEntryFormValues {
  pastMedicalHistory: string
  allergies: string
  pathology: string
  medications: Array<{
    name: string
    dose: string
    frequency: string
    indication: string
    notes: string
  }>
}

interface DataEntryFormProps {
  review: HmrReview
  onSubmit: (data: Partial<HmrReview>) => Promise<void>
  onCancel?: () => void
  loading?: boolean
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
      medications: review.medications?.map((m) => ({
        name: m.name,
        dose: m.dose || '',
        frequency: m.frequency || '',
        indication: m.indication || '',
        notes: m.notes || '',
      })) || [],
    },
  })

  const [medications, setMedications] = React.useState<
    DataEntryFormValues['medications']
  >(form.getValues('medications'))

  const addMedication = () => {
    setMedications([
      ...medications,
      { name: '', dose: '', frequency: '', indication: '', notes: '' },
    ])
  }

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index))
  }

  const updateMedication = (
    index: number,
    field: keyof DataEntryFormValues['medications'][0],
    value: string
  ) => {
    const updated = [...medications]
    updated[index] = { ...updated[index], [field]: value }
    setMedications(updated)
  }

  const handleSubmit = async (values: DataEntryFormValues) => {
    await onSubmit({
      pastMedicalHistory: values.pastMedicalHistory,
      allergies: values.allergies,
      pathology: values.pathology,
      // Note: medications are handled separately through the API
    })
  }

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
                DOB: {review.patient?.dateOfBirth || 'Not provided'} |
                Medicare: {review.patient?.medicareNumber || 'Not provided'}
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
          {/* Past Medical History */}
          <Card>
            <CardHeader>
              <CardTitle>Past Medical History</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="pastMedicalHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical History</FormLabel>
                    <FormDescription>
                      Document the patient's significant medical history,
                      chronic conditions, surgeries, and past illnesses
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        rows={8}
                        placeholder="Example:&#10;- 2023: Heart failure confirmed&#10;- 2023: AF - valvular mitral valve stenosis&#10;- 2020: NIDDM - now on insulin&#10;- 2020: Hypertension confirmed&#10;- Unknown: CKD stage 4"
                        {...field}
                        className="font-mono text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Allergies */}
          <Card>
            <CardHeader>
              <CardTitle>Allergies & Adverse Reactions</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Known Allergies</FormLabel>
                    <FormDescription>
                      List all known drug allergies, food allergies, and adverse
                      reactions. Include type of reaction if known.
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Example:&#10;- Statins (unknown reaction)&#10;- Penicillin (rash)&#10;- NKDA (No Known Drug Allergies)"
                        {...field}
                        className="font-mono text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Pathology Results */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Pathology & Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="pathology"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pathology Highlights</FormLabel>
                    <FormDescription>
                      Record recent lab results, test findings, and monitoring
                      data relevant to medication management
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        rows={6}
                        placeholder="Example:&#10;- 2025: Diabetic retinopathy screening - no changes&#10;- eGFR: 28 (CKD stage 4)&#10;- HbA1c: 7.2%&#10;- INR: 2.5 (target 2-3)&#10;- High parathyroid hormone noted"
                        {...field}
                        className="font-mono text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Current Medications Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Medications</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMedication}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medication
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No medications added yet.</p>
                    <p className="text-sm">
                      Click "Add Medication" to begin recording current
                      medications.
                    </p>
                  </div>
                ) : (
                  medications.map((med, index) => (
                    <Card key={index} className="border-gray-200">
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-gray-900">
                            Medication #{index + 1}
                          </h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMedication(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Medication Name *
                            </label>
                            <input
                              type="text"
                              value={med.name}
                              onChange={(e) =>
                                updateMedication(index, 'name', e.target.value)
                              }
                              placeholder="e.g., Metformin"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Dose
                            </label>
                            <input
                              type="text"
                              value={med.dose}
                              onChange={(e) =>
                                updateMedication(index, 'dose', e.target.value)
                              }
                              placeholder="e.g., 500mg"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Frequency
                            </label>
                            <input
                              type="text"
                              value={med.frequency}
                              onChange={(e) =>
                                updateMedication(
                                  index,
                                  'frequency',
                                  e.target.value
                                )
                              }
                              placeholder="e.g., BD (twice daily)"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Indication
                            </label>
                            <input
                              type="text"
                              value={med.indication}
                              onChange={(e) =>
                                updateMedication(
                                  index,
                                  'indication',
                                  e.target.value
                                )
                              }
                              placeholder="e.g., Type 2 Diabetes"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Notes
                          </label>
                          <textarea
                            value={med.notes}
                            onChange={(e) =>
                              updateMedication(index, 'notes', e.target.value)
                            }
                            placeholder="Any additional notes about this medication"
                            rows={2}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Medications will be saved separately
                  after you save the main data entry. You can also add and
                  manage medications through the medications tab.
                </p>
              </div>
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
  )
}
