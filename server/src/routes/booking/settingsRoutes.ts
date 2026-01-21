import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../../middleware/auth';
import { bookingSettingsSchema } from '../../validators/bookingSchemas';
import {
  getOrCreateBookingSettings,
  updateBookingSettings,
} from '../../services/booking';

const router = Router();

/**
 * Get booking settings (creates defaults if missing)
 * GET /api/booking/settings
 */
router.get(
  '/settings',
  authenticate,
  asyncHandler(async (req, res) => {
    const ownerId = req.user!.id;
    const settings = await getOrCreateBookingSettings(ownerId);
    res.json(settings);
  })
);

/**
 * Update booking settings
 * PATCH /api/booking/settings
 */
router.patch(
  '/settings',
  authenticate,
  asyncHandler(async (req, res) => {
    const ownerId = req.user!.id;
    const validated = bookingSettingsSchema.partial().parse(req.body);

    const settings = await updateBookingSettings(ownerId, validated);
    res.json(settings);
  })
);

export const settingsRouter = router;
