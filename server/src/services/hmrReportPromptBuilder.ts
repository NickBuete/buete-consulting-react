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
      education: true,
      recommendations: true,
    },
  });

  if (!review) {
    return null;
  }

  const formatDate = (value?: Date | null) => (value ? value.toISOString().slice(0, 10) : 'not provided');
  const formatAddress = (parts: (string | null | undefined)[]) => parts.filter(Boolean).join(' ');

  const patient = review.patient;
  const prescriber = review.prescriber;
  const clinic = review.clinic;

  const medicationLines = review.medications.map((med) =>
    `| ${med.name} | ${med.dose ?? ''} | ${med.frequency ?? ''} | ${med.indication ?? ''} | ${med.notes ?? ''} |`,
  );

  const symptomLines = review.symptoms.map(
    (symptom) => `- ${symptom.symptom}: ${symptom.present ? 'present' : 'absent'} ${symptom.notes ?? ''}`,
  );

  const actionItemLines = review.actionItems.map((item) =>
    `- ${item.title} (${item.status}) – ${item.description ?? 'no additional notes'}${
      item.assignee ? ` | assigned to ${item.assignee.username}` : ''
    }${item.dueDate ? ` | due ${item.dueDate.toISOString().slice(0, 10)}` : ''}`,
  );

  const educationLines = review.education.map((entry) => `- ${entry.topic}: ${entry.advice}`);

  const recommendationTable = review.recommendations.map(
    (entry) => `| ${entry.assessment.replace(/\n/g, ' ')} | ${entry.plan.replace(/\n/g, ' ')} |`,
  );

  const userPromptSections: string[] = [];
  userPromptSections.push('=== Patient Summary ===');
  userPromptSections.push(
    `Name: ${patient.firstName} ${patient.lastName}` +
      ` | DOB: ${formatDate(patient.dateOfBirth)}` +
      ` | Address: ${formatAddress([patient.addressLine1, patient.suburb, patient.state, patient.postcode]) || 'not recorded'}` +
      ` | Medicare/Identifier: ${patient.medicareNumber ?? 'not recorded'}`,
  );

  if (prescriber) {
    userPromptSections.push(
      `Prescriber: ${prescriber.firstName} ${prescriber.lastName} ` +
        `| Provider Number: ${prescriber.providerNumber ?? 'unknown'}` +
        ` | Email: ${prescriber.contactEmail ?? prescriber.notes ?? 'not provided'}`,
    );
  }
  if (clinic) {
    userPromptSections.push(
      `Clinic: ${clinic.name} | Address: ${formatAddress([
        clinic.addressLine1,
        clinic.suburb,
        clinic.state,
        clinic.postcode,
      ])}`,
    );
  }

  userPromptSections.push('=== Review Context ===');
  userPromptSections.push(`Referral date: ${formatDate(review.referralDate)}`);
  userPromptSections.push(`Interview date: ${formatDate(review.scheduledAt ?? review.createdAt)}`);
  userPromptSections.push(`Referral reason: ${review.referralReason ?? 'not documented'}`);
  userPromptSections.push(`Main patient concerns: ${review.visitNotes ?? review.goalBarriers ?? 'not recorded'}`);
  userPromptSections.push(`Patient goals: ${review.medicalGoals ?? 'not recorded'}`);
  userPromptSections.push(`Living situation: ${review.visitLocation ?? review.otherSupports ?? 'not recorded'}`);

  userPromptSections.push('=== Clinical Notes ===');
  userPromptSections.push(`Assessment summary: ${review.assessmentSummary ?? 'not provided'}`);
  userPromptSections.push(`Past medical history: ${review.pastMedicalHistory ?? 'not provided'}`);
  userPromptSections.push(`Allergies: ${review.allergies ?? 'none recorded'}`);
  userPromptSections.push(`Pathology highlights: ${review.pathology ?? 'not provided'}`);

  userPromptSections.push('=== Current Medications ===');
  userPromptSections.push('| Name | Dose | Frequency | Indication | Notes |');
  userPromptSections.push('| --- | --- | --- | --- | --- |');
  userPromptSections.push(...(medicationLines.length ? medicationLines : ['| No medicines recorded | | | | |']));

  if (symptomLines.length) {
    userPromptSections.push('Adverse effects or symptoms noted:');
    userPromptSections.push(...symptomLines);
  }

  if (actionItemLines.length) {
    userPromptSections.push('Pending action items from interview:');
    userPromptSections.push(...actionItemLines);
  }

  if (recommendationTable.length) {
    userPromptSections.push('Interview assessment and plan suggestions:');
    userPromptSections.push('| Assessment | Plan |');
    userPromptSections.push('| --- | --- |');
    userPromptSections.push(...recommendationTable);
  }

  if (educationLines.length) {
    userPromptSections.push('Education and counselling delivered:');
    userPromptSections.push(...educationLines);
  }

  const userPrompt = userPromptSections.join('\n');

  const systemPrompt = `You are assisting an Australian consultant pharmacist to draft the final Home Medicines Review (HMR) letter.
You must respond with valid JSON: {"letter": string, "recommendations": string[]}.

Rules for "letter":
- Output Markdown closely matching these sample sections: greeting, HMR Report table (Patient | Prescriber | Pharmacist), narrative paragraphs covering concerns/goals, "PMH & Allergies" list, "Past medical history" table, "Current Medications" table, "Issues & Recommendations" table (columns Assessment | Plan), "Education & Advice" table, disclaimer, signature block (Nicholas Buete, Buete Consulting, MRN 6666).
- Mirror the tone and structure of the provided examples (concise, professional, Australian terminology).
- Mention referral and interview dates, patient concerns, goals and living situation from the data supplied.
- Use placeholders like "No allergies recorded" where data is missing so every section is populated.
- Keep patient identifiers to first name in narrative paragraphs, but include full details in the tables.

Rules for "recommendations":
- Provide 3-6 concise action items (string array) prioritising medication safety, follow-up, monitoring or referrals.
- Each item should be a short sentence without numbering.

Ensure the JSON is valid (escape newlines) and avoid adding extra keys.`;

  return { systemPrompt, userPrompt };
};
