import { Router } from 'express';
import { prisma } from '../../db/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { handlePrismaError } from '../../middleware/prismaErrorHandler';
import { parseId } from '../utils/parseId';
import { authenticate } from '../../middleware/auth';
import { BOOKING_TIME_ZONE, getDateRangeFromToday } from '../../utils/bookingTime';
import { getBusyIntervals } from '../../services/bookingAvailability';
import { availabilitySlotSchema } from '../../validators/bookingSchemas';
import {
  listAvailabilitySlots,
  createAvailabilitySlot,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
} from '../../services/booking';

const router = Router();

/**
 * Get pharmacist's availability slots
 * GET /api/booking/availability
 */
router.get(
  '/availability',
  authenticate,
  asyncHandler(async (req, res) => {
    const ownerId = req.user!.id;
    const slots = await listAvailabilitySlots(ownerId);
    res.json(slots);
  })
);

/**
 * Create availability slot
 * POST /api/booking/availability
 */
router.post(
  '/availability',
  authenticate,
  asyncHandler(async (req, res) => {
    const ownerId = req.user!.id;
    const validated = availabilitySlotSchema.parse(req.body);

    const slot = await createAvailabilitySlot(ownerId, validated);
    res.status(201).json(slot);
  })
);

/**
 * Update availability slot
 * PATCH /api/booking/availability/:id
 */
router.patch(
  '/availability/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const ownerId = req.user!.id;
    const slotId = parseId(req.params.id);
    if (!slotId) {
      return res.status(400).json({ message: 'Invalid slot ID' });
    }
    const validated = availabilitySlotSchema.partial().parse(req.body);

    try {
      const slot = await updateAvailabilitySlot(ownerId, slotId, validated);
      res.json(slot);
    } catch (error) {
      return handlePrismaError(error, res);
    }
  })
);

/**
 * Delete availability slot
 * DELETE /api/booking/availability/:id
 */
router.delete(
  '/availability/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const ownerId = req.user!.id;
    const slotId = parseId(req.params.id);
    if (!slotId) {
      return res.status(400).json({ message: 'Invalid slot ID' });
    }

    try {
      await deleteAvailabilitySlot(ownerId, slotId);
      res.status(204).send();
    } catch (error) {
      return handlePrismaError(error, res);
    }
  })
);

/**
 * Get busy slots for authenticated user
 * GET /api/booking/busy
 */
router.get(
  '/busy',
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;

    const settings = await prisma.bookingSettings.findUnique({
      where: { userId },
    });

    const { start: rangeStart, end: rangeEnd } = getDateRangeFromToday(90, BOOKING_TIME_ZONE);

    const busyIntervals = await getBusyIntervals(
      userId,
      rangeStart,
      rangeEnd,
      settings?.defaultDuration ?? 60
    );

    res.json({
      busySlots: busyIntervals.map((interval) => ({
        start: interval.start.toISOString(),
        end: interval.end.toISOString(),
      })),
    });
  })
);

export const availabilityRouter = router;
