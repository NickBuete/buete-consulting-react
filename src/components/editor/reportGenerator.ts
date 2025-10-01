import type { HmrReview, HmrMedication } from '../../types/hmr'

/**
 * Generates a structured HMR report template based on the review data
 * This provides a professional starting point that can be edited in TipTap
 */
export const generateReportTemplate = (review: HmrReview): string => {
  const patientName = `${review.patient?.firstName || ''} ${
    review.patient?.lastName || ''
  }`.trim()
  const prescriberName = review.prescriber
    ? `${review.prescriber.firstName} ${review.prescriber.lastName}`
    : 'N/A'

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'Not recorded'
    return new Date(date).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatMedication = (med: HmrMedication) => {
    return `<li>
      <strong>${med.name}</strong>
      ${med.dose ? ` - ${med.dose}` : ''}
      ${med.frequency ? ` - ${med.frequency}` : ''}
      ${med.indication ? `<br><em>Indication: ${med.indication}</em>` : ''}
      ${
        med.notes
          ? `<br><span style="color: #6b7280;">Notes: ${med.notes}</span>`
          : ''
      }
    </li>`
  }

  const template = `
<h1>Home Medicines Review Report</h1>

<h2>Patient Information</h2>
<p><strong>Patient Name:</strong> ${patientName}</p>
<p><strong>Date of Birth:</strong> ${formatDate(
    review.patient?.dateOfBirth
  )}</p>
<p><strong>Medicare Number:</strong> ${
    review.patient?.medicareNumber || 'Not recorded'
  }</p>
<p><strong>Address:</strong> ${
    [
      review.patient?.addressLine1,
      review.patient?.addressLine2,
      review.patient?.suburb,
      review.patient?.state,
      review.patient?.postcode,
    ]
      .filter(Boolean)
      .join(', ') || 'Not recorded'
  }</p>

<h2>Referral Details</h2>
<p><strong>Referring Prescriber:</strong> ${prescriberName}</p>
<p><strong>Referral Date:</strong> ${formatDate(review.referralDate)}</p>
<p><strong>Interview Date:</strong> ${formatDate(review.interviewStartedAt)}</p>
<p><strong>Visit Location:</strong> ${
    review.visitLocation || 'Not recorded'
  }</p>

${
  review.referralReason
    ? `<h3>Referral Reason</h3><p>${review.referralReason}</p>`
    : ''
}

<h2>Patient Medical History</h2>
${
  review.pastMedicalHistory
    ? `<p>${review.pastMedicalHistory}</p>`
    : '<p><em>To be completed...</em></p>'
}

<h3>Known Allergies</h3>
${
  review.allergies
    ? `<p>${review.allergies}</p>`
    : '<p><em>No known allergies recorded</em></p>'
}

${
  review.pathology
    ? `<h3>Relevant Pathology</h3><p>${review.pathology}</p>`
    : ''
}

<h2>Current Medications</h2>
${
  review.medications && review.medications.length > 0
    ? `<ul>${review.medications.map(formatMedication).join('')}</ul>`
    : '<p><em>No medications recorded</em></p>'
}

<h2>Patient Interview Summary</h2>

<h3>Health Goals and Barriers</h3>
${
  review.medicalGoals
    ? `<p><strong>Goals:</strong> ${review.medicalGoals}</p>`
    : ''
}
${
  review.goalBarriers
    ? `<p><strong>Barriers:</strong> ${review.goalBarriers}</p>`
    : ''
}

<h3>Symptom Assessment</h3>
<h4>Central Nervous System</h4>
<ul>
${
  review.dizziness
    ? `<li><strong>Dizziness:</strong> ${review.dizziness}</li>`
    : ''
}
${
  review.drowsiness
    ? `<li><strong>Drowsiness:</strong> ${review.drowsiness}</li>`
    : ''
}
${review.fatigue ? `<li><strong>Fatigue:</strong> ${review.fatigue}</li>` : ''}
${review.memory ? `<li><strong>Memory:</strong> ${review.memory}</li>` : ''}
${review.anxiety ? `<li><strong>Anxiety:</strong> ${review.anxiety}</li>` : ''}
${review.sleep ? `<li><strong>Sleep:</strong> ${review.sleep}</li>` : ''}
${
  review.headaches
    ? `<li><strong>Headaches:</strong> ${review.headaches}</li>`
    : ''
}
</ul>

<h4>Musculoskeletal</h4>
<ul>
${review.pain ? `<li><strong>Pain:</strong> ${review.pain}</li>` : ''}
${
  review.mobility
    ? `<li><strong>Mobility:</strong> ${review.mobility}</li>`
    : ''
}
${review.falls ? `<li><strong>Falls:</strong> ${review.falls}</li>` : ''}
</ul>

<h4>Bladder and Bowel</h4>
<ul>
${
  review.bladderControl
    ? `<li><strong>Bladder Control:</strong> ${review.bladderControl}</li>`
    : ''
}
${
  review.bowelControl
    ? `<li><strong>Bowel Control:</strong> ${review.bowelControl}</li>`
    : ''
}
${
  review.nightSymptoms
    ? `<li><strong>Night Symptoms:</strong> ${review.nightSymptoms}</li>`
    : ''
}
${
  review.signsOfBleeding
    ? `<li><strong>Signs of Bleeding:</strong> ${review.signsOfBleeding}</li>`
    : ''
}
</ul>

<h4>Other Symptoms</h4>
<ul>
${review.rashes ? `<li><strong>Rashes:</strong> ${review.rashes}</li>` : ''}
${
  review.bruising
    ? `<li><strong>Bruising:</strong> ${review.bruising}</li>`
    : ''
}
</ul>

<h3>Living Arrangements and Support</h3>
${
  review.livingArrangement
    ? `<p><strong>Living Arrangement:</strong> ${review.livingArrangement}</p>`
    : ''
}
${
  review.usesWebster !== null
    ? `<p><strong>Webster Pack:</strong> ${
        review.usesWebster ? 'Yes' : 'No'
      }</p>`
    : ''
}
${
  review.socialSupport
    ? `<p><strong>Social Support:</strong> ${review.socialSupport}</p>`
    : ''
}
${
  review.otherSupports
    ? `<p><strong>Other Supports:</strong> ${review.otherSupports}</p>`
    : ''
}

${
  review.assessmentSummary
    ? `<h3>Overall Assessment</h3><p>${review.assessmentSummary}</p>`
    : ''
}

${review.visitNotes ? `<h3>Visit Notes</h3><p>${review.visitNotes}</p>` : ''}

<h2>Pharmacist Recommendations</h2>
<p><em>To be completed by the pharmacist...</em></p>
<ol>
  <li></li>
  <li></li>
  <li></li>
</ol>

<h2>Medication Action Plan</h2>
<p><em>To be completed by the pharmacist...</em></p>

<h2>Follow-up Plan</h2>
<p><em>To be completed by the pharmacist...</em></p>

<h2>Conclusion</h2>
<p><em>To be completed by the pharmacist...</em></p>

<hr>

<p><strong>Prepared by:</strong> ${review.user?.name || 'Pharmacist Name'}</p>
<p><strong>Date:</strong> ${formatDate(new Date().toISOString())}</p>
<p><strong>MRN:</strong> ${review.user?.mrnNumber || 'MRN Number'}</p>
`

  return template.trim()
}

/**
 * AI-assisted suggestion generator (placeholder for future AI integration)
 * This can be enhanced to call an AI service for intelligent recommendations
 */
export const generateAISuggestions = (review: HmrReview): string[] => {
  const suggestions: string[] = []

  // Check for polypharmacy
  if (review.medications && review.medications.length >= 5) {
    suggestions.push(
      'Consider reviewing for potential drug interactions due to polypharmacy (5+ medications)'
    )
  }

  // Check for CNS symptoms that might be medication-related
  const cnsSymptoms = [
    review.dizziness,
    review.drowsiness,
    review.fatigue,
    review.memory,
  ].filter(Boolean)
  if (cnsSymptoms.length >= 2) {
    suggestions.push(
      'Multiple CNS symptoms reported - review medications that may contribute (e.g., anticholinergics, sedatives)'
    )
  }

  // Check for fall risk
  if (review.falls) {
    suggestions.push(
      'Falls reported - assess medication-related fall risk factors (sedatives, antihypertensives, etc.)'
    )
  }

  // Check for adherence support
  if (review.usesWebster === false) {
    suggestions.push(
      'Consider recommending Webster pack to improve medication adherence'
    )
  }

  // Check for social support
  if (
    review.socialSupport?.toLowerCase().includes('limited') ||
    review.socialSupport?.toLowerCase().includes('none')
  ) {
    suggestions.push(
      'Limited social support noted - consider community resources or support services'
    )
  }

  // Check for bladder/bowel issues
  if (review.bladderControl || review.bowelControl) {
    suggestions.push(
      'Bladder/bowel symptoms reported - review medications that may contribute (anticholinergics, opioids, etc.)'
    )
  }

  return suggestions
}

/**
 * Generates a summary section with key findings (for AI assistance)
 */
export const generateKeySummary = (review: HmrReview): string => {
  const points: string[] = []

  // Medication count
  const medCount = review.medications?.length || 0
  if (medCount > 0) {
    points.push(`Patient currently taking ${medCount} medication(s)`)
  }

  // Key health goals
  if (review.medicalGoals) {
    points.push(`Health goals: ${review.medicalGoals}`)
  }

  // Significant symptoms
  const significantSymptoms: string[] = []
  if (review.dizziness) significantSymptoms.push('dizziness')
  if (review.falls) significantSymptoms.push('falls')
  if (review.pain) significantSymptoms.push('pain')
  if (review.memory) significantSymptoms.push('memory issues')

  if (significantSymptoms.length > 0) {
    points.push(`Reported symptoms: ${significantSymptoms.join(', ')}`)
  }

  // Living situation
  if (review.livingArrangement) {
    points.push(`Living arrangement: ${review.livingArrangement}`)
  }

  return points.join('\n')
}
