import { prisma } from '../db/prisma';

export interface HmrReportPrompt {
  systemPrompt: string;
  userPrompt: string;
}

export const buildReportPrompt = async (reviewId: number, ownerId: number): Promise<HmrReportPrompt | null> => {
  const review = await prisma.hmrReview.findFirst({
    where: { id: reviewId, ownerId },
    include: {
      patient: true,
      prescriber: { include: { clinic: true } },
      clinic: true,
      medications: true,
      symptoms: true,
      actionItems: { include: { assignee: true } },
    },
  });

  if (!review) {
    return null;
  }

  const lines: string[] = [];

  lines.push(`Patient: ${review.patient.firstName} ${review.patient.lastName}`);
  if (review.patient.dateOfBirth) {
    lines.push(`Date of Birth: ${review.patient.dateOfBirth.toISOString().slice(0, 10)}`);
  }
  if (review.prescriber) {
    lines.push(`Prescriber: ${review.prescriber.firstName} ${review.prescriber.lastName}`);
  }
  if (review.clinic) {
    lines.push(`Clinic: ${review.clinic.name}`);
  }
  if (review.referralReason) {
    lines.push(`Referral Reason: ${review.referralReason}`);
  }
  if (review.assessmentSummary) {
    lines.push(`Assessment Summary: ${review.assessmentSummary}`);
  }
  if (review.pastMedicalHistory) {
    lines.push(`Past Medical History: ${review.pastMedicalHistory}`);
  }
  if (review.allergies) {
    lines.push(`Allergies: ${review.allergies}`);
  }
  if (review.pathology) {
    lines.push(`Pathology: ${review.pathology}`);
  }

  if (review.medications.length) {
    lines.push('Medications:');
    review.medications.forEach((med) => {
      lines.push(`- ${med.name} (${med.status}) ${med.dose ?? ''} ${med.frequency ?? ''} Notes: ${med.notes ?? ''}`);
    });
  }

  if (review.symptoms.length) {
    lines.push('Symptoms:');
    review.symptoms.forEach((symptom) => {
      lines.push(`- ${symptom.symptom}: ${symptom.present ? 'Present' : 'Not present'} ${symptom.notes ?? ''}`);
    });
  }

  if (review.actionItems.length) {
    lines.push('Action Items:');
    review.actionItems.forEach((item) => {
      lines.push(
        `- ${item.title} (${item.status}) Assigned to: ${item.assignee ? item.assignee.username : 'Unassigned'} Notes: ${
          item.description ?? ''
        }`,
      );
    });
  }

  const userPrompt = lines.join('\n');
  const systemPrompt = `You are an experienced clinical pharmacist preparing a Home Medicines Review report. Draft a concise summary and actionable recommendations based on the provided information. Highlight medication safety issues, clinical concerns, and suggested follow-up actions.`;

  return { systemPrompt, userPrompt };
};
