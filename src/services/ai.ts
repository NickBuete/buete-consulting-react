import { api } from './api'

export interface AIRecommendationsResponse {
  recommendations: string
}

export interface AIAssessmentSummaryResponse {
  summary: string
}

export interface AIEnhanceSectionResponse {
  enhanced: string
}

export interface AIHealthResponse {
  status: 'configured' | 'not_configured' | 'error'
  region?: string
  message: string
}

/**
 * Generate AI-powered medication recommendations
 */
export const generateAIRecommendations = async (
  reviewId: number
): Promise<string> => {
  const response = await api.post<AIRecommendationsResponse>(
    '/ai/recommendations',
    {
      reviewId,
    }
  )
  return response.recommendations
}

/**
 * Generate AI-powered assessment summary
 */
export const generateAIAssessmentSummary = async (
  reviewId: number
): Promise<string> => {
  const response = await api.post<AIAssessmentSummaryResponse>(
    '/ai/assessment-summary',
    {
      reviewId,
    }
  )
  return response.summary
}

/**
 * Enhance a report section using AI
 */
export const enhanceReportSection = async (
  sectionTitle: string,
  content: string,
  reviewId?: number
): Promise<string> => {
  const response = await api.post<AIEnhanceSectionResponse>(
    '/ai/enhance-section',
    {
      sectionTitle,
      content,
      reviewId,
    }
  )
  return response.enhanced
}

/**
 * Check AI service health/configuration status
 */
export const checkAIHealth = async (): Promise<AIHealthResponse> => {
  const response = await api.get<AIHealthResponse>('/ai/health')
  return response
}
