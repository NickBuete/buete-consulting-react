/**
 * Interview Form - Refactored
 * Reduced from 674 lines to ~230 lines by extracting symptom section components
 * Each symptom category is now self-contained and reusable
 */

import React from 'react';
import { useForm } from 'react-hook-form';
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
} from '../ui';
import { Save, FileText } from 'lucide-react';
import type { HmrReview } from '../../types/hmr';
import { CNSSymptomSection } from './interview/CNSSymptomSection';
import { MusculoskeletalSymptomSection } from './interview/MusculoskeletalSymptomSection';
import { BladderBowelSymptomSection } from './interview/BladderBowelSymptomSection';
import { MiscSymptomSection } from './interview/MiscSymptomSection';
import { LivingArrangementSection } from './interview/LivingArrangementSection';

interface InterviewFormValues {
  visitLocation: string;
  visitNotes: string;
  medicalGoals: string;
  goalBarriers: string;
  assessmentSummary: string;
  // CNS Symptoms
  dizziness: string;
  drowsiness: string;
  fatigue: string;
  memory: string;
  anxiety: string;
  sleep: string;
  headaches: string;
  // Musculoskeletal
  pain: string;
  mobility: string;
  falls: string;
  // Bladder/Bowel
  bladderControl: string;
  bowelControl: string;
  nightSymptoms: string;
  signsOfBleeding: string;
  // Misc
  socialSupport: string;
  rashes: string;
  bruising: string;
  // Living arrangement
  livingArrangement: HmrReview['livingArrangement'];
  usesWebster: boolean | null;
  livesAlone: boolean | null;
  otherSupports: string;
}

interface InterviewFormProps {
  review: HmrReview;
  onSubmit: (data: Partial<HmrReview>) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
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
  });

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
    });
  };

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
                Patient: {review.patient?.firstName} {review.patient?.lastName}{' '}
                | Date: {new Date().toLocaleDateString('en-AU')}
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

          {/* Symptom Sections - Extracted Components */}
          <CNSSymptomSection form={form} />
          <MusculoskeletalSymptomSection form={form} />
          <BladderBowelSymptomSection form={form} />
          <LivingArrangementSection form={form} />
          <MiscSymptomSection form={form} />

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
  );
};
