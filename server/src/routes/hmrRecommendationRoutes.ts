import { Router } from 'express';
import { asyncHandler } from './utils/asyncHandler';
import {
  createRecommendationForReview,
  deleteRecommendationEntry,
  listRecommendationsForReview,
  updateRecommendationEntry,
} from '../services/hmrRecommendationService';
import {
  hmrRecommendationCreateSchema,
  hmrRecommendationUpdateSchema,
} from '../validators/hmrRecommendationSchemas';

const router = Router({ mergeParams: true });

const parseReviewId = (value: string | undefined) => {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const parseId = (value: string | undefined) => {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const reviewId = parseReviewId(req.params.reviewId);
    if (reviewId === null) {
      return res.status(400).json({ message: 'Invalid review id' });
    }

    const ownerId = req.user!.id;
    const entries = await listRecommendationsForReview(ownerId, reviewId);
    return res.json(entries);
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const reviewId = parseReviewId(req.params.reviewId);
    if (reviewId === null) {
      return res.status(400).json({ message: 'Invalid review id' });
    }

    const payload = hmrRecommendationCreateSchema.parse(req.body);
    const ownerId = req.user!.id;
    const entry = await createRecommendationForReview(ownerId, reviewId, payload);
    if (!entry) {
      return res.status(404).json({ message: 'Review not found' });
    }

    return res.status(201).json(entry);
  }),
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: 'Invalid recommendation id' });
    }

    const payload = hmrRecommendationUpdateSchema.parse(req.body);
    const ownerId = req.user!.id;
    const updated = await updateRecommendationEntry(ownerId, id, payload);
    if (!updated) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    return res.json(updated);
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: 'Invalid recommendation id' });
    }

    const ownerId = req.user!.id;
    const deleted = await deleteRecommendationEntry(ownerId, id);
    if (!deleted) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    return res.status(204).send();
  }),
);

export const hmrRecommendationRouter = router;
