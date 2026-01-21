import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { handlePrismaError } from '../../middleware/prismaErrorHandler';
import { authenticate } from '../../middleware/auth';
import { logger } from '../../utils/logger';
import { directBookingSchema } from '../../validators/bookingSchemas';
import { createDirectBooking } from '../../services/booking';

const router = Router();

/**
 * Create direct booking (from inline widget)
 * POST /api/booking/direct
 */
router.post(
  '/direct',
  authenticate,
  asyncHandler(async (req, res) => {
    const validated = directBookingSchema.parse(req.body);

    try {
      const result = await createDirectBooking(validated);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        logger.error({ err: error }, 'Direct booking creation failed');
        return res.status(400).json({ error: error.message });
      }
      return handlePrismaError(error, res);
    }
  })
);

export const directBookingRouter = router;
