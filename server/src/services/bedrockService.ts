import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput,
} from '@aws-sdk/client-bedrock-runtime'

// Initialize Bedrock client
const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

// Available models
export const BEDROCK_MODELS = {
  CLAUDE_3_5_SONNET: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
  CLAUDE_3_HAIKU: 'anthropic.claude-3-haiku-20240307-v1:0',
  CLAUDE_3_SONNET: 'anthropic.claude-3-sonnet-20240229-v1:0',
} as const

export type BedrockModel = (typeof BEDROCK_MODELS)[keyof typeof BEDROCK_MODELS]

interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ClaudeRequest {
  anthropic_version: string
  max_tokens: number
  messages: ClaudeMessage[]
  temperature?: number
  top_p?: number
  system?: string
}

interface ClaudeResponse {
  id: string
  type: string
  role: string
  content: Array<{
    type: string
    text: string
  }>
  model: string
  stop_reason: string
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

/**
 * Invoke Claude model via AWS Bedrock
 */
export async function invokeClaude(
  prompt: string,
  options: {
    model?: BedrockModel
    systemPrompt?: string
    maxTokens?: number
    temperature?: number
  } = {}
): Promise<string> {
  const {
    model = BEDROCK_MODELS.CLAUDE_3_5_SONNET,
    systemPrompt,
    maxTokens = 4096,
    temperature = 0.7,
  } = options

  const requestBody: ClaudeRequest = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: maxTokens,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature,
  }

  if (systemPrompt) {
    requestBody.system = systemPrompt
  }

  const input: InvokeModelCommandInput = {
    modelId: model,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(requestBody),
  }

  try {
    const command = new InvokeModelCommand(input)
    const response = await client.send(command)

    // Parse the response
    const responseBody = JSON.parse(
      new TextDecoder().decode(response.body)
    ) as ClaudeResponse

    // Extract the text from the first content block
    if (
      responseBody.content &&
      responseBody.content.length > 0 &&
      responseBody.content[0]
    ) {
      return responseBody.content[0].text
    }

    throw new Error('No content in response')
  } catch (error) {
    console.error('Bedrock invocation error:', error)
    throw new Error(
      `Failed to invoke Bedrock model: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}

/**
 * Generate HMR recommendations using Claude
 */
export async function generateHmrRecommendations(patientData: {
  medications: Array<{
    name: string
    dose?: string
    frequency?: string
    indication?: string
  }>
  symptoms: string[]
  medicalHistory?: string
  allergies?: string
  age?: number
  goals?: string
}): Promise<string> {
  const systemPrompt = `You are an experienced clinical pharmacist conducting a Home Medicines Review (HMR). 
Your role is to provide evidence-based, practical recommendations to optimize medication therapy and improve patient outcomes.

Focus on:
- Drug interactions and contraindications
- Medication-related problems (effectiveness, safety, adherence)
- Deprescribing opportunities
- Non-pharmacological alternatives
- Patient-specific factors (age, comorbidities, goals)

Provide clear, actionable recommendations in a professional tone suitable for a report to a GP.`

  const prompt = `Please analyze the following patient information and provide evidence-based medication recommendations:

**Current Medications:**
${patientData.medications
  .map(
    (med, idx) =>
      `${idx + 1}. ${med.name}${med.dose ? ` ${med.dose}` : ''}${
        med.frequency ? ` - ${med.frequency}` : ''
      }${med.indication ? ` (${med.indication})` : ''}`
  )
  .join('\n')}

**Reported Symptoms:**
${
  patientData.symptoms.length > 0
    ? patientData.symptoms.join(', ')
    : 'None reported'
}

${
  patientData.medicalHistory
    ? `**Medical History:**\n${patientData.medicalHistory}\n`
    : ''
}
${patientData.allergies ? `**Allergies:**\n${patientData.allergies}\n` : ''}
${patientData.age ? `**Patient Age:** ${patientData.age} years\n` : ''}
${patientData.goals ? `**Patient Goals:**\n${patientData.goals}\n` : ''}

Please provide:
1. Key medication-related issues identified
2. Specific recommendations for the GP
3. Suggested medication adjustments (if any)
4. Non-pharmacological recommendations
5. Monitoring suggestions

Format as a structured report section.`

  return invokeClaude(prompt, {
    systemPrompt,
    maxTokens: 4096,
    temperature: 0.7,
  })
}

/**
 * Generate assessment summary using Claude
 */
export async function generateAssessmentSummary(patientData: {
  name: string
  medications: Array<{ name: string; dose?: string; frequency?: string }>
  symptoms: string[]
  goals?: string
  barriers?: string
  livingArrangement?: string
  socialSupport?: string
}): Promise<string> {
  const systemPrompt = `You are an experienced clinical pharmacist writing a concise assessment summary for an HMR report.
Write in professional medical language suitable for a GP. Be objective and factual.`

  const prompt = `Write a brief assessment summary (2-3 paragraphs) for the following patient:

**Patient:** ${patientData.name}

**Medications (${patientData.medications.length}):**
${patientData.medications.map((m) => m.name).join(', ')}

**Key Symptoms/Concerns:**
${patientData.symptoms.join(', ')}

${patientData.goals ? `**Patient Goals:** ${patientData.goals}\n` : ''}
${patientData.barriers ? `**Barriers:** ${patientData.barriers}\n` : ''}
${
  patientData.livingArrangement
    ? `**Living Arrangement:** ${patientData.livingArrangement}\n`
    : ''
}
${
  patientData.socialSupport
    ? `**Social Support:** ${patientData.socialSupport}\n`
    : ''
}

Summarize the patient's current medication use, key clinical concerns, and overall medication management needs.`

  return invokeClaude(prompt, {
    systemPrompt,
    maxTokens: 1024,
    temperature: 0.5,
  })
}

/**
 * Enhance report content with AI suggestions
 */
export async function enhanceReportSection(
  sectionTitle: string,
  currentContent: string,
  context: string
): Promise<string> {
  const systemPrompt = `You are an experienced clinical pharmacist reviewing an HMR report section.
Enhance the content to be more professional, comprehensive, and evidence-based.
Maintain the original meaning but improve clarity and clinical relevance.`

  const prompt = `Please enhance the following section of an HMR report:

**Section:** ${sectionTitle}

**Current Content:**
${currentContent}

**Additional Context:**
${context}

Provide an enhanced version that is more professional, detailed, and clinically relevant.
Keep the same structure but improve the quality and depth of information.`

  return invokeClaude(prompt, {
    systemPrompt,
    maxTokens: 2048,
    temperature: 0.6,
  })
}
