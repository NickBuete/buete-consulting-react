import { Router } from 'express';
import { asyncHandler } from './utils/asyncHandler';
import { hmrReportGenerateSchema, hmrReportUpsertSchema } from '../validators/hmrReportSchemas';
import {
  generateReportDraft,
  getReportForReview,
  listAuditEntries,
  recordReportAudit,
  upsertReportForReview,
} from '../services/hmrReportService';

const router = Router();

const parseId = (raw: string | undefined) => {
  if (!raw) {
    return null;
  }
  const id = Number.parseInt(raw, 10);
  if (Number.isNaN(id)) {
    return null;
  }
  return id;
};

router.get(
  '/:reviewId',
  asyncHandler(async (req, res) => {
    const reviewId = parseId(req.params.reviewId);
    if (reviewId === null) {
      return res.status(400).json({ message: 'Invalid review id' });
    }

    const ownerId = req.user!.id;
    const report = await getReportForReview(ownerId, reviewId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    return res.json(report);
  }),
);

router.post(
  '/:reviewId',
  asyncHandler(async (req, res) => {
    const reviewId = parseId(req.params.reviewId);
    if (reviewId === null) {
      return res.status(400).json({ message: 'Invalid review id' });
    }

    const payload = hmrReportUpsertSchema.parse(req.body);
    const ownerId = req.user!.id;
    const report = await upsertReportForReview(ownerId, reviewId, payload);
    if (!report) {
      return res.status(404).json({ message: 'Review not found' });
    }

    return res.status(200).json(report);
  }),
);

router.post(
  '/:reviewId/generate',
  asyncHandler(async (req, res) => {
    const reviewId = parseId(req.params.reviewId);
    if (reviewId === null) {
      return res.status(400).json({ message: 'Invalid review id' });
    }

    const payload = hmrReportGenerateSchema.parse(req.body ?? {});
    const ownerId = req.user!.id;
    const result = await generateReportDraft(ownerId, reviewId, payload);
    if (!result) {
      return res.status(404).json({ message: 'Review not found or prompt unavailable' });
    }

    return res.status(200).json(result);
  }),
);

router.get(
  '/:reviewId/audit',
  asyncHandler(async (req, res) => {
    const reviewId = parseId(req.params.reviewId);
    if (reviewId === null) {
      return res.status(400).json({ message: 'Invalid review id' });
    }

    const ownerId = req.user!.id;
    const entries = await listAuditEntries(ownerId, reviewId);
    return res.json(entries);
  }),
);

router.post(
  '/:reviewId/audit',
  asyncHandler(async (req, res) => {
    const reviewId = parseId(req.params.reviewId);
    if (reviewId === null) {
      return res.status(400).json({ message: 'Invalid review id' });
    }

    const ownerId = req.user!.id;
    const { model, prompt, completion } = req.body ?? {};

    if (typeof model !== 'string' || typeof prompt !== 'string' || typeof completion !== 'string') {
      return res.status(400).json({ message: 'model, prompt, and completion are required strings' });
    }

    const audit = await recordReportAudit(ownerId, reviewId, model, prompt, completion);
    if (!audit) {
      return res.status(404).json({ message: 'Report not found' });
    }

    return res.status(201).json(audit);
  }),
);

export const hmrReportRouter = router;
