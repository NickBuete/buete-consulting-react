import { Router, Request, Response } from 'express'
import { openaiService } from '../services/ai/openaiClient'
import { authenticate } from '../middleware/auth'
import { aiLimiter } from '../middleware/rateLimiter'
import { aiLogger } from '../utils/logger'
import { prisma } from '../db/prisma'

const router = Router()

// Apply authentication middleware to all routes
router.use(authenticate)

/**
 * POST /api/ai/recommendations
 * Generate medication recommendations using AI
 */
router.post(
  '/recommendations',
  aiLimiter,
  async (req: Request, res: Response) => {
    try {
      const { reviewId } = req.body

      if (!reviewId) {
        return res.status(400).json({ error: 'Review ID is required' })
      }

      // Fetch review data
      const review = await prisma.hmrReview.findUnique({
        where: { id: Number(reviewId) },
        include: {
          patient: true,
          medications: true,
          symptoms: true,
        },
      })

      if (!review) {
        return res.status(400).json({ error: 'Review not found' })
      }

      // Prepare patient data
      const patientAge = review.patient.dateOfBirth
        ? Math.floor(
            (Date.now() - new Date(review.patient.dateOfBirth).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000)
          )
        : undefined

      const symptoms = review.symptoms
        .filter((s) => s.present)
        .map(
          (s) =>
            \`\${s.symptom}\${s.severity ? \` (\${s.severity})\` : ''}\${
              s.notes ? \`: \${s.notes}\` : ''
            }\`
        )

      // Add text-based symptoms from review fields
      const textSymptoms: string[] = []
      if (review.dizziness) textSymptoms.push(\`Dizziness: \${review.dizziness}\`)
      if (review.pain) textSymptoms.push(\`Pain: \${review.pain}\`)
      if (review.falls) textSymptoms.push(\`Falls: \${review.falls}\`)
      if (review.mobility)
        textSymptoms.push(\`Mobility issues: \${review.mobility}\`)

      const allSymptoms = [...symptoms, ...textSymptoms]

      const recommendations = await openaiService.generateHmrRecommendations({
        medications: review.medications.map((med) => ({
          name: med.name,
          ...(med.dose && { dose: med.dose }),
          ...(med.frequency && { frequency: med.frequency }),
          ...(med.indication && { indication: med.indication }),
        })),
        symptoms: allSymptoms,
        ...(review.pastMedicalHistory && {
          medicalHistory: review.pastMedicalHistory,
        }),
        ...(review.allergies && { allergies: review.allergies }),
        ...(patientAge && { age: patientAge }),
        ...(review.medicalGoals && { goals: review.medicalGoals }),
      })

      res.json({ recommendations })
    } catch (error) {
      aiLogger.error(
        { error, reviewId: req.body.reviewId },
        'AI recommendations error'
      )
      res.status(500).json({
        error: 'Failed to generate recommendations',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
)

/**
 * POST /api/ai/assessment-summary
 * Generate assessment summary using AI
 */
router.post(
  '/assessment-summary',
  aiLimiter,
  async (req: Request, res: Response) => {
    try {
      const { reviewId } = req.body

      if (!reviewId) {
        return res.status(400).json({ error: 'Review ID is required' })
      }

      // Fetch review data
      const review = await prisma.hmrReview.findUnique({
        where: { id: Number(reviewId) },
        include: {
          patient: true,
          medications: true,
          symptoms: true,
        },
      })

      if (!review) {
        return res.status(400).json({ error: 'Review not found' })
      }

      const patientName = \`\${review.patient.firstName} \${review.patient.lastName}\`

      const symptoms = review.symptoms
        .filter((s) => s.present)
        .map((s) => \`\${s.symptom}\${s.severity ? \` (\${s.severity})\` : ''}\`)

      // Add text-based symptoms
      const textSymptoms: string[] = []
      if (review.dizziness) textSymptoms.push('dizziness')
      if (review.pain) textSymptoms.push('pain')
      if (review.falls) textSymptoms.push('falls history')
      if (review.mobility) textSymptoms.push('mobility concerns')

      const allSymptoms = [...symptoms, ...textSymptoms]

      const summary = await openaiService.generateAssessmentSummary({
        name: patientName,
        medications: review.medications.map((med) => ({
          name: med.name,
          ...(med.dose && { dose: med.dose }),
          ...(med.frequency && { frequency: med.frequency }),
        })),
        symptoms: allSymptoms,
        ...(review.medicalGoals && { goals: review.medicalGoals }),
        ...(review.goalBarriers && { barriers: review.goalBarriers }),
        ...(review.livingArrangement && {
          livingArrangement: review.livingArrangement,
        }),
        ...(review.socialSupport && { socialSupport: review.socialSupport }),
      })

      res.json({ summary })
    } catch (error) {
      aiLogger.error(
        { error, reviewId: req.body.reviewId },
        'AI assessment summary error'
      )
      res.status(500).json({
        error: 'Failed to generate assessment summary',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
)

/**
 * POST /api/ai/enhance-section
 * Enhance a specific report section using AI
 */
router.post(
  '/enhance-section',
  aiLimiter,
  async (req: Request, res: Response) => {
    try {
      const { sectionTitle, content, reviewId } = req.body

      if (!sectionTitle || !content) {
        return res
          .status(400)
          .json({ error: 'Section title and content are required' })
      }

      // Optionally fetch review context
      let context = ''
      if (reviewId) {
        const review = await prisma.hmrReview.findUnique({
          where: { id: Number(reviewId) },
          include: {
            patient: true,
            medications: true,
          },
        })

        if (review) {
          context = \`Patient: \${review.patient.firstName} \${
            review.patient.lastName
          }
Medications: \${review.medications.map((m) => m.name).join(', ')}
Medical History: \${review.pastMedicalHistory || 'Not provided'}\`
        }
      }

      const enhanced = await openaiService.enhanceReportSection(
        sectionTitle,
        content,
        context
      )

      res.json({ enhanced })
    } catch (error) {
      aiLogger.error(
        { error, sectionTitle: req.body.sectionTitle },
        'AI enhance section error'
      )
      res.status(500).json({
        error: 'Failed to enhance section',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
)

/**
 * GET /api/ai/health
 * Check AI service health
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const isConfigured = openaiService.isConfigured()

    res.json({
      status: isConfigured ? 'configured' : 'not_configured',
      provider: 'openai',
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      message: isConfigured
        ? 'OpenAI is configured and ready'
        : 'OpenAI API key not configured. Set OPENAI_API_KEY environment variable.',
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

export default router
