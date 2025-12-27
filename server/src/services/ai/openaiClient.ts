import OpenAI from 'openai';
import { logger } from '../../utils/logger';

interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GenerateReportParams {
  patientName: string;
  patientAge?: number;
  medications: Array<{
    name: string;
    dose?: string;
    frequency?: string;
    indication?: string;
  }>;
  medicalHistory?: string;
  allergies?: string;
  symptoms?: Record<string, string>;
  assessmentNotes?: string;
  referrerName?: string;
}

/**
 * OpenAI service for AI-assisted report generation
 */
export class OpenAIService {
  private config: OpenAIConfig;
  private client: OpenAI | null = null;

  constructor() {
    this.config = {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000', 10),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.3'),
    };

    if (this.config.apiKey) {
      this.client = new OpenAI({
        apiKey: this.config.apiKey,
      });
      logger.info('OpenAI service initialized');
    } else {
      logger.warn('OpenAI API key not configured. AI features will be unavailable.');
    }
  }

  /**
   * Check if OpenAI service is configured
   */
  isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Generate a chat completion
   */
  async generateChatCompletion(
    messages: ChatMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
    }
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI service is not configured');
    }

    try {
      const completion = await this.client!.chat.completions.create({
        model: options?.model || this.config.model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: options?.temperature ?? this.config.temperature,
        max_tokens: options?.maxTokens ?? this.config.maxTokens,
      });

      const response = completion.choices[0]?.message?.content || '';

      logger.info(`OpenAI completion generated. Tokens used: ${completion.usage?.total_tokens}`);

      return response;
    } catch (error: any) {
      logger.error('OpenAI API error:', error);
      throw new Error(`Failed to generate completion: ${error.message}`);
    }
  }

  /**
   * Generate an HMR report using GPT-4
   */
  async generateHMRReport(params: GenerateReportParams): Promise<{
    summary: string;
    recommendations: string;
    tokensUsed: number;
  }> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI service is not configured');
    }

    try {
      // Build the medication list text
      const medicationList = params.medications
        .map((med, index) => {
          let text = `${index + 1}. ${med.name}`;
          if (med.dose) text += ` - ${med.dose}`;
          if (med.frequency) text += ` ${med.frequency}`;
          if (med.indication) text += ` (for ${med.indication})`;
          return text;
        })
        .join('\n');

      // Build symptoms text
      const symptomsText = params.symptoms
        ? Object.entries(params.symptoms)
            .filter(([_, value]) => value)
            .map(([symptom, details]) => `- ${symptom}: ${details}`)
            .join('\n')
        : 'No symptoms reported';

      // System prompt for clinical context
      const systemPrompt = `You are an expert clinical pharmacist conducting a Home Medicines Review (HMR) in Australia. Your role is to:

1. Review patient medications for appropriateness, safety, and efficacy
2. Identify drug-related problems including:
   - Adverse drug reactions
   - Drug interactions
   - Inappropriate dosing
   - Therapeutic duplication
   - Non-adherence issues
   - Untreated indications
3. Provide evidence-based recommendations aligned with Australian clinical guidelines
4. Use professional medical terminology appropriate for GP communication
5. Cite relevant resources (PBS, TGA, AMH, NPS MedicineWise) when applicable

Format your response as a structured clinical report suitable for the referring GP.`;

      // User prompt with patient data
      const userPrompt = `Please generate a Home Medicines Review report for the following patient:

**Patient:** ${params.patientName}${params.patientAge ? `, ${params.patientAge} years old` : ''}

**Current Medications:**
${medicationList}

**Medical History:**
${params.medicalHistory || 'Not provided'}

**Known Allergies:**
${params.allergies || 'NKDA (No Known Drug Allergies)'}

**Current Symptoms/Concerns:**
${symptomsText}

**Pharmacist Assessment Notes:**
${params.assessmentNotes || 'No additional notes'}

Please provide:
1. A clinical summary of the medication review
2. Identified drug-related problems
3. Evidence-based recommendations for the GP
4. Patient education points

Format the response professionally for inclusion in the report to ${params.referrerName || 'the referring GP'}.`;

      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ];

      const completion = await this.client!.chat.completions.create({
        model: this.config.model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      });

      const response = completion.choices[0]?.message?.content || '';
      const tokensUsed = completion.usage?.total_tokens || 0;

      logger.info(`HMR report generated. Tokens used: ${tokensUsed}`);

      // Split response into summary and recommendations
      // This is a simple split - you may want to refine this based on actual output
      const sections = response.split(/(?:##\s*Recommendations|Recommendations:)/i);
      const summary = sections[0]?.trim() || response;
      const recommendations = sections[1]?.trim() || '';

      return {
        summary,
        recommendations: recommendations || summary,
        tokensUsed,
      };
    } catch (error: any) {
      logger.error('Failed to generate HMR report:', error);
      throw new Error(`Failed to generate HMR report: ${error.message}`);
    }
  }

  /**
   * Generate patient education advice
   */
  async generatePatientEducation(params: {
    topic: string;
    patientContext?: string;
    medications?: string[];
  }): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI service is not configured');
    }

    const systemPrompt = `You are a clinical pharmacist providing patient education. Explain medical topics in clear, simple language that patients can understand. Focus on practical advice and safety information. Keep explanations concise and actionable.`;

    const userPrompt = `Provide patient education about: ${params.topic}${
      params.patientContext ? `\n\nPatient context: ${params.patientContext}` : ''
    }${
      params.medications?.length
        ? `\n\nRelated medications: ${params.medications.join(', ')}`
        : ''
    }

Keep it brief (2-3 paragraphs) and easy to understand.`;

    return this.generateChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);
  }

  /**
   * Generate HMR recommendations for medications
   */
  async generateHmrRecommendations(params: {
    medications: Array<{ name: string; dose?: string; frequency?: string; indication?: string }>;
    symptoms?: string[];
    medicalHistory?: string;
    allergies?: string;
    age?: number;
    goals?: string;
  }): Promise<string[]> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI service is not configured');
    }

    const medicationList = params.medications
      .map((med, index) => {
        let text = `${index + 1}. ${med.name}`;
        if (med.dose) text += ` - ${med.dose}`;
        if (med.frequency) text += ` ${med.frequency}`;
        if (med.indication) text += ` (for ${med.indication})`;
        return text;
      })
      .join('\n');

    const systemPrompt = `You are an expert Australian clinical pharmacist conducting a Home Medicines Review. Generate specific, actionable recommendations for drug-related problems. Focus on safety, efficacy, and adherence. Reference Australian guidelines (PBS, TGA, AMH) where relevant.`;

    const userPrompt = `Based on this medication review, provide specific clinical recommendations:

**Medications:**
${medicationList}

${params.symptoms?.length ? `**Symptoms:** ${params.symptoms.join(', ')}` : ''}
${params.medicalHistory ? `**Medical History:** ${params.medicalHistory}` : ''}
${params.allergies ? `**Allergies:** ${params.allergies}` : ''}
${params.age ? `**Age:** ${params.age} years` : ''}
${params.goals ? `**Patient Goals:** ${params.goals}` : ''}

Provide 3-5 specific clinical recommendations as a JSON array of strings. Each recommendation should be concise, actionable, and evidence-based.`;

    const response = await this.generateChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    try {
      return JSON.parse(response);
    } catch {
      return response.split('\n').filter((line) => line.trim().length > 0).slice(0, 5);
    }
  }

  /**
   * Generate assessment summary for HMR
   */
  async generateAssessmentSummary(params: {
    name: string;
    medications: Array<{ name: string; dose?: string; frequency?: string }>;
    symptoms?: string[];
    goals?: string;
    barriers?: string;
    livingArrangement?: string;
    socialSupport?: string;
  }): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI service is not configured');
    }

    const medicationList = params.medications.map((med) => med.name).join(', ');

    const systemPrompt = `You are an Australian clinical pharmacist writing an assessment summary for a Home Medicines Review. Be concise, professional, and focus on key clinical findings.`;

    const userPrompt = `Write a brief clinical assessment summary for:

**Patient:** ${params.name}
**Medications:** ${medicationList}
${params.symptoms?.length ? `**Symptoms:** ${params.symptoms.join(', ')}` : ''}
${params.goals ? `**Patient Goals:** ${params.goals}` : ''}
${params.barriers ? `**Barriers:** ${params.barriers}` : ''}
${params.livingArrangement ? `**Living Arrangement:** ${params.livingArrangement}` : ''}
${params.socialSupport ? `**Social Support:** ${params.socialSupport}` : ''}

Provide a 2-3 paragraph clinical assessment suitable for an HMR report.`;

    return this.generateChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);
  }

  /**
   * Enhance a specific section of the report
   */
  async enhanceReportSection(
    sectionTitle: string,
    content: string,
    context?: string
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI service is not configured');
    }

    const systemPrompt = `You are an Australian clinical pharmacist reviewing and enhancing Home Medicines Review documentation. Improve clarity, professionalism, and clinical accuracy while maintaining the original intent.`;

    const userPrompt = `Enhance this "${sectionTitle}" section:

${content}

${context ? `\n**Additional Context:**\n${context}` : ''}

Improve the wording for professionalism and clarity while keeping it concise and clinically accurate.`;

    return this.generateChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);
  }

  /**
   * Get token count estimate for text
   */
  estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}

export const openaiService = new OpenAIService();
