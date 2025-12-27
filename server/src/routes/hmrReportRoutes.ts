import { Router } from 'express';

// NOTE: Old hmrReportService removed (used AWS Bedrock)
// These routes have been deprecated. Use the OpenAI-based endpoints instead:
// - POST /api/ai/recommendations - Generate HMR recommendations
// - POST /api/ai/assessment-summary - Generate assessment summary
// - POST /api/ai/enhance-section - Enhance report sections
//
// TODO: Migrate any frontend code that uses these old routes to the new /api/ai endpoints

const router = Router();

// Stub routes that return helpful migration messages
router.use((_req, res) => {
  res.status(410).json({
    error: 'These endpoints have been deprecated',
    message: 'Please use the new AI endpoints: /api/ai/recommendations, /api/ai/assessment-summary, /api/ai/enhance-section',
    migration: {
      'POST /:reviewId/generate': 'Use POST /api/ai/assessment-summary or /api/ai/recommendations',
      'GET /:reviewId': 'Report data should be stored in hmr_reviews table',
      'POST /:reviewId': 'Update hmr_reviews table directly',
    },
  });
});

export const hmrReportRouter = router;
