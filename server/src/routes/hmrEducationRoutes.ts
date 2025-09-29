import { Router } from 'express';
import { asyncHandler } from './utils/asyncHandler';
import {
  createEducationForReview,
  deleteEducationEntry,
  listEducationForReview,
  updateEducationEntry,
} from '../services/hmrEducationService';
import {
  hmrEducationCreateSchema,
  hmrEducationUpdateSchema,
} from '../validators/hmrEducationSchemas';

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
    const entries = await listEducationForReview(ownerId, reviewId);
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

    const payload = hmrEducationCreateSchema.parse(req.body);
    const ownerId = req.user!.id;
    const entry = await createEducationForReview(ownerId, reviewId, payload);
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
      return res.status(400).json({ message: 'Invalid education entry id' });
    }

    const payload = hmrEducationUpdateSchema.parse(req.body);
    const ownerId = req.user!.id;
    const updated = await updateEducationEntry(ownerId, id, payload);
    if (!updated) {
      return res.status(404).json({ message: 'Education entry not found' });
    }

    return res.json(updated);
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: 'Invalid education entry id' });
    }

    const ownerId = req.user!.id;
    const deleted = await deleteEducationEntry(ownerId, id);
    if (!deleted) {
      return res.status(404).json({ message: 'Education entry not found' });
    }

    return res.status(204).send();
  }),
);

export const hmrEducationRouter = router;
