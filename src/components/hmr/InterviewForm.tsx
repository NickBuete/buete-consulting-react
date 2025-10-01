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
  Input,
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../ui'
import { Save, FileText } from 'lucide-react'
import type { HmrReview } from '../../types/hmr'

interface InterviewFormValues {
  visitLocation: string
  visitNotes: string
  medicalGoals: string
  goalBarriers: string
  assessmentSummary: string
  // CNS Symptoms
  dizziness: string
  drowsiness: string
  fatigue: string
  memory: string
  anxiety: string
  sleep: string
  headaches: string
  // Musculoskeletal
  pain: string
  mobility: string
  falls: string
  // Bladder/Bowel
  bladderControl: string
  bowelControl: string
  nightSymptoms: string
  signsOfBleeding: string
  // Misc
  socialSupport: string
  rashes: string
  bruising: string
  // Living arrangement
  livingArrangement: HmrReview['livingArrangement']
  usesWebster: boolean | null
  livesAlone: boolean | null
  otherSupports: string
}

interface InterviewFormProps {
  review: HmrReview
  onSubmit: (data: Partial<HmrReview>) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

export const InterviewForm: React.FC<InterviewFormProps> = ({
  review,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const form = useForm<InterviewFormValues>({
    defaultValues: {
      visitLocation: review.visitLocation || '',
      visitNotes: review.visitNotes || '',
      medicalGoals: review.medicalGoals || '',
      goalBarriers: review.goalBarriers || '',
      assessmentSummary: review.assessmentSummary || '',
      // Symptoms
      dizziness: '',
      drowsiness: '',
      fatigue: '',
      memory: '',
      anxiety: '',
      sleep: '',
      headaches: '',
      pain: '',
      mobility: '',
      falls: '',
      bladderControl: '',
      bowelControl: '',
      nightSymptoms: '',
      signsOfBleeding: '',
      socialSupport: '',
      rashes: '',
      bruising: '',
      // Living
      livingArrangement: review.livingArrangement || null,
      usesWebster: review.usesWebster || null,
      livesAlone: review.livesAlone || null,
      otherSupports: review.otherSupports || '',
    },
  })

  const handleSubmit = async (values: InterviewFormValues) => {
    await onSubmit({
      visitLocation: values.visitLocation,
      visitNotes: values.visitNotes,
      medicalGoals: values.medicalGoals,
      goalBarriers: values.goalBarriers,
      assessmentSummary: values.assessmentSummary,
      livingArrangement: values.livingArrangement,
      usesWebster: values.usesWebster,
      livesAlone: values.livesAlone,
      otherSupports: values.otherSupports,
    })
  }

  return (
    <div className="space-y-6">
      {/* Interview Header */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <FileText className="w-8 h-8 text-green-600" />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-green-900">
                HMR Interview
              </h2>
              <p className="text-sm text-green-700">
                Patient: {review.patient?.firstName}{' '}
                {review.patient?.lastName} | Date:{' '}
                {new Date().toLocaleDateString('en-AU')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Interview Details */}
          <Card>
            <CardHeader>
              <CardTitle>Interview Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="visitLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visit Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Patient's home, Clinic, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visitNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visit Notes</FormLabel>
                    <FormDescription>
                      General observations and notes from the visit
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Note any general observations about the visit..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Patient Goals & Barriers */}
          <Card>
            <CardHeader>
              <CardTitle>Health Goals & Barriers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="medicalGoals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient's Health Goals</FormLabel>
                    <FormDescription>
                      What does the patient want to achieve with their health?
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="e.g., To address pain and continue to be independent"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="goalBarriers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barriers to Goals</FormLabel>
                    <FormDescription>
                      What obstacles prevent the patient from achieving their
                      goals?
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="e.g., Pain limiting mobility, financial constraints, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* CNS Symptoms/Screening */}
          <Card>
            <CardHeader>
              <CardTitle>CNS Symptoms/Screening</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dizziness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dizziness</FormLabel>
                      <FormControl>
                        <Input placeholder="Frequency & severity" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="drowsiness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Drowsiness</FormLabel>
                      <FormControl>
                        <Input placeholder="Frequency & severity" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fatigue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fatigue</FormLabel>
                      <FormControl>
                        <Input placeholder="Frequency & severity" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="memory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Memory</FormLabel>
                      <FormControl>
                        <Input placeholder="Concerns or issues" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="anxiety"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anxiety</FormLabel>
                      <FormControl>
                        <Input placeholder="Level & triggers" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sleep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep</FormLabel>
                      <FormControl>
                        <Input placeholder="Quality & duration" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="headaches"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Headaches</FormLabel>
                      <FormControl>
                        <Input placeholder="Frequency & type" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Musculoskeletal */}
          <Card>
            <CardHeader>
              <CardTitle>Musculoskeletal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="pain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pain</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Location & severity (0-10)"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobility Concerns</FormLabel>
                      <FormControl>
                        <Input placeholder="Walking aids, limitations" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="falls"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Falls</FormLabel>
                      <FormControl>
                        <Input placeholder="Recent falls, near misses" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bladder/Bowel */}
          <Card>
            <CardHeader>
              <CardTitle>Bladder/Bowel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bladderControl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bladder Control</FormLabel>
                      <FormControl>
                        <Input placeholder="Any issues or concerns" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bowelControl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bowel Control</FormLabel>
                      <FormControl>
                        <Input placeholder="Frequency, consistency" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nightSymptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Night Symptoms</FormLabel>
                      <FormControl>
                        <Input placeholder="Nocturia, urgency" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="signsOfBleeding"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Signs of Bleeding</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Blood in urine/stool, etc."
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Living Arrangements & Support */}
          <Card>
            <CardHeader>
              <CardTitle>Living Arrangements & Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="livingArrangement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Living Arrangement</FormLabel>
                      <Select
                        value={field.value || ''}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select arrangement" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ALONE">Lives alone</SelectItem>
                          <SelectItem value="WITH_FAMILY">
                            With family
                          </SelectItem>
                          <SelectItem value="WITH_CARER">
                            With carer
                          </SelectItem>
                          <SelectItem value="RESIDENTIAL_AGED_CARE">
                            Residential aged care
                          </SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="usesWebster"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Uses Webster Pack?</FormLabel>
                      <Select
                        value={
                          field.value === null
                            ? 'unknown'
                            : field.value
                            ? 'yes'
                            : 'no'
                        }
                        onValueChange={(v) =>
                          field.onChange(
                            v === 'unknown' ? null : v === 'yes'
                          )
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialSupport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Social Support</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Family, friends, carers"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="otherSupports"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Supports</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Services, equipment"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Misc Observations */}
          <Card>
            <CardHeader>
              <CardTitle>Miscellaneous Observations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rashes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rashes</FormLabel>
                      <FormControl>
                        <Input placeholder="Any rashes observed" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bruising"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bruising</FormLabel>
                      <FormControl>
                        <Input placeholder="Unusual bruising noted" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Assessment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Assessment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="assessmentSummary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary</FormLabel>
                    <FormDescription>
                      Provide an overall summary of the interview findings and
                      key observations
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        rows={6}
                        placeholder="Summarize key findings, concerns, and observations from the interview..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                  Complete Interview
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
