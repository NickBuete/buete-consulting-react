import React from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle, Form, Button } from '../ui'
import { Plus, Save, Trash2 } from 'lucide-react'
import type { HmrReview, CreateHmrReviewPayload } from '../../types/hmr'
import { MedicationAutocomplete } from './MedicationAutocomplete'
import { addToKnowledgeBase } from '../../services/medicationKnowledgeBase'

interface MedicalHistoryEntry {
  year: string
  condition: string
  notes: string
}

interface AllergyEntry {
  allergen: string
  reaction: string
  severity: string
}

interface PathologyEntry {
  date: string
  test: string
  result: string
  notes: string
}

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
  onSubmit: (data: Partial<CreateHmrReviewPayload>) => Promise<void>
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
      medications:
        review.medications?.map((m) => ({
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

  // State for medical history table - use structured data if available
  const [medicalHistory, setMedicalHistory] = React.useState<
    MedicalHistoryEntry[]
  >(() => {
    if (review.medicalHistory && review.medicalHistory.length > 0) {
      return review.medicalHistory.map((entry) => ({
        year: entry.year || '',
        condition: entry.condition,
        notes: entry.notes || '',
      }))
    }
    return []
  })

  // State for allergies table - use structured data if available
  const [allergies, setAllergies] = React.useState<AllergyEntry[]>(() => {
    if (review.allergiesTable && review.allergiesTable.length > 0) {
      return review.allergiesTable.map((entry) => ({
        allergen: entry.allergen,
        reaction: entry.reaction || '',
        severity: entry.severity || '',
      }))
    }
    return []
  })

  // State for pathology table - use structured data if available
  const [pathology, setPathology] = React.useState<PathologyEntry[]>(() => {
    if (review.pathologyResults && review.pathologyResults.length > 0) {
      return review.pathologyResults.map((entry) => ({
        date: entry.date || '',
        test: entry.test,
        result: entry.result,
        notes: entry.notes || '',
      }))
    }
    return []
  })

  const addMedicalHistoryEntry = () => {
    setMedicalHistory([
      ...medicalHistory,
      { year: '', condition: '', notes: '' },
    ])
  }

  const removeMedicalHistoryEntry = (index: number) => {
    setMedicalHistory(medicalHistory.filter((_, i) => i !== index))
  }

  const updateMedicalHistoryEntry = (
    index: number,
    field: keyof MedicalHistoryEntry,
    value: string
  ) => {
    const updated = [...medicalHistory]
    updated[index] = { ...updated[index], [field]: value }
    setMedicalHistory(updated)
  }

  const addAllergyEntry = () => {
    setAllergies([...allergies, { allergen: '', reaction: '', severity: '' }])
  }

  const removeAllergyEntry = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index))
  }

  const updateAllergyEntry = (
    index: number,
    field: keyof AllergyEntry,
    value: string
  ) => {
    const updated = [...allergies]
    updated[index] = { ...updated[index], [field]: value }
    setAllergies(updated)
  }

  const addPathologyEntry = () => {
    setPathology([...pathology, { date: '', test: '', result: '', notes: '' }])
  }

  const removePathologyEntry = (index: number) => {
    setPathology(pathology.filter((_, i) => i !== index))
  }

  const updatePathologyEntry = (
    index: number,
    field: keyof PathologyEntry,
    value: string
  ) => {
    const updated = [...pathology]
    updated[index] = { ...updated[index], [field]: value }
    setPathology(updated)
  }

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

  const handleMedicationSelect = (
    index: number,
    selected: {
      name: string
      genericName?: string
      form?: string
      strength?: string
      route?: string
      indication?: string
    }
  ) => {
    const updated = [...medications]
    updated[index] = {
      ...updated[index],
      name: selected.name,
      // Auto-fill dose with strength if available
      dose: selected.strength || updated[index].dose,
      indication: selected.indication || updated[index].indication,
    }
    setMedications(updated)

    // Add to knowledge base for auto-learning
    addToKnowledgeBase({
      name: selected.name,
      genericName: selected.genericName,
      form: selected.form,
      strength: selected.strength,
      route: selected.route,
      indication: selected.indication,
    }).catch((error) => {
      console.error('Failed to add to knowledge base:', error)
      // Don't block the user if knowledge base update fails
    })
  }

  const handleSubmit = async (values: DataEntryFormValues) => {
    // Send structured data directly to the backend
    await onSubmit({
      medicalHistory: medicalHistory
        .filter((entry) => entry.condition.trim())
        .map((entry) => ({
          year: entry.year || null,
          condition: entry.condition,
          notes: entry.notes || null,
        })),
      allergiesTable: allergies
        .filter((entry) => entry.allergen.trim())
        .map((entry) => ({
          allergen: entry.allergen,
          reaction: entry.reaction || null,
          severity: entry.severity || null,
        })),
      pathologyResults: pathology
        .filter((entry) => entry.test.trim() || entry.result.trim())
        .map((entry) => ({
          date: entry.date || null,
          test: entry.test,
          result: entry.result,
          notes: entry.notes || null,
        })),
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
          {/* Past Medical History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Past Medical History</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMedicalHistoryEntry}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entry
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {medicalHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No medical history entries yet.</p>
                    <p className="text-sm">Click "Add Entry" to begin.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                            Year
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Condition
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Notes
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {medicalHistory.map((entry, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                value={entry.year}
                                onChange={(e) =>
                                  updateMedicalHistoryEntry(
                                    index,
                                    'year',
                                    e.target.value
                                  )
                                }
                                placeholder="2023"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                value={entry.condition}
                                onChange={(e) =>
                                  updateMedicalHistoryEntry(
                                    index,
                                    'condition',
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., Type 2 Diabetes, Hypertension"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                value={entry.notes}
                                onChange={(e) =>
                                  updateMedicalHistoryEntry(
                                    index,
                                    'notes',
                                    e.target.value
                                  )
                                }
                                placeholder="Additional notes"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                              />
                            </td>
                            <td className="px-4 py-2 text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMedicalHistoryEntry(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Allergies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Allergies & Adverse Reactions</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAllergyEntry}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Allergy
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {allergies.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No allergies recorded yet.</p>
                    <p className="text-sm">
                      Click "Add Allergy" to record known allergies and adverse
                      reactions.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Allergen/Drug
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reaction
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                            Severity
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {allergies.map((entry, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                value={entry.allergen}
                                onChange={(e) =>
                                  updateAllergyEntry(
                                    index,
                                    'allergen',
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., Penicillin, Statins"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                value={entry.reaction}
                                onChange={(e) =>
                                  updateAllergyEntry(
                                    index,
                                    'reaction',
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., Rash, Anaphylaxis"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <select
                                value={entry.severity}
                                onChange={(e) =>
                                  updateAllergyEntry(
                                    index,
                                    'severity',
                                    e.target.value
                                  )
                                }
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                              >
                                <option value="">Select...</option>
                                <option value="Mild">Mild</option>
                                <option value="Moderate">Moderate</option>
                                <option value="Severe">Severe</option>
                                <option value="Unknown">Unknown</option>
                              </select>
                            </td>
                            <td className="px-4 py-2 text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAllergyEntry(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pathology Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Pathology & Test Results</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPathologyEntry}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Result
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pathology.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No pathology results recorded yet.</p>
                    <p className="text-sm">
                      Click "Add Result" to record recent lab results and test
                      findings.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Test/Investigation
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Result/Finding
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Notes
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pathology.map((entry, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                value={entry.date}
                                onChange={(e) =>
                                  updatePathologyEntry(
                                    index,
                                    'date',
                                    e.target.value
                                  )
                                }
                                placeholder="2025 or 01/10/2025"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                value={entry.test}
                                onChange={(e) =>
                                  updatePathologyEntry(
                                    index,
                                    'test',
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., HbA1c, eGFR, INR"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                value={entry.result}
                                onChange={(e) =>
                                  updatePathologyEntry(
                                    index,
                                    'result',
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., 7.2%, 28 mL/min"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                value={entry.notes}
                                onChange={(e) =>
                                  updatePathologyEntry(
                                    index,
                                    'notes',
                                    e.target.value
                                  )
                                }
                                placeholder="Additional context"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                              />
                            </td>
                            <td className="px-4 py-2 text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removePathologyEntry(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
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
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-700">
                              Medication Name *
                            </label>
                            <div className="mt-1">
                              <MedicationAutocomplete
                                onSelect={(selected) =>
                                  handleMedicationSelect(index, selected)
                                }
                                placeholder="Search medications (e.g., Metformin, Atorvastatin)..."
                                initialValue={med.name}
                              />
                            </div>
                            {!med.name && (
                              <p className="mt-1 text-xs text-gray-500">
                                Start typing to search from our medication
                                database, or type a new medication name
                              </p>
                            )}
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
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3"
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
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3"
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
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3"
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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> Use the medication search to quickly
                  find medications from our knowledge base. The system learns
                  from your entries and will suggest medications you use
                  frequently. If a medication has multiple common indications,
                  you'll be prompted to select one.
                </p>
              </div>

              <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
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
