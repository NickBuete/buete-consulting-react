/**
 * Booking routes
 * Refactored from 931 lines to follow routes → services pattern
 * Services handle all business logic, routes handle HTTP orchestration
 */

import express from 'express';
import multer from 'multer';
import { prisma } from '../db/prisma';
import { asyncHandler } from './utils/asyncHandler';
import { handlePrismaError } from '../middleware/prismaErrorHandler';
import { parseId } from './utils/parseId';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';
import { BOOKING_TIME_ZONE, getDateRangeFromToday } from '../utils/bookingTime';
import { getBusyIntervals } from '../services/bookingAvailability';
import {
  availabilitySlotSchema,
  bookingSettingsSchema,
  directBookingSchema,
  publicBookingSchema,
  rescheduleSchema,
} from '../validators/bookingSchemas';
import {
  listAvailabilitySlots,
  createAvailabilitySlot,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
  getOrCreateBookingSettings,
  updateBookingSettings,
  createPublicBooking,
  createDirectBooking,
  getBookingByToken,
  rescheduleBooking,
} from '../services/booking';

const router = express.Router();

// Configure multer for memory storage (file will be in req.file.buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// ========================================
// Availability Slots Management
// ========================================

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

// ========================================
// Booking Settings Management
// ========================================

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

// ========================================
// Public Booking (No Auth Required)
// ========================================

/**
 * Get pharmacist's public booking info
 * GET /api/booking/public/:bookingUrl
 */
router.get(
  '/public/:bookingUrl',
  asyncHandler(async (req, res) => {
    const { bookingUrl } = req.params;

    if (!bookingUrl) {
      return res.status(400).json({ error: 'Booking URL is required' });
    }

    const settings = await prisma.bookingSettings.findUnique({
      where: { bookingUrl },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            calendarSyncEnabled: true,
          },
        },
      },
    });

    if (!settings || !settings.allowPublicBooking) {
      return res.status(404).json({ error: 'Booking page not found' });
    }

    // Get availability slots
    const slots = await prisma.availabilitySlot.findMany({
      where: {
        userId: settings.userId,
        isAvailable: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    const { start: rangeStart, end: rangeEnd } = getDateRangeFromToday(90, BOOKING_TIME_ZONE);

    const busyIntervals = await getBusyIntervals(
      settings.userId,
      rangeStart,
      rangeEnd,
      settings.defaultDuration
    );

    res.json({
      pharmacist: {
        id: settings.user.id,
        name: settings.user.username,
        email: settings.user.email,
      },
      bookingSettings: {
        allowPublicBooking: settings.allowPublicBooking,
        requireApproval: settings.requireApproval,
        bufferTimeBefore: settings.bufferTimeBefore,
        bufferTimeAfter: settings.bufferTimeAfter,
        defaultDuration: settings.defaultDuration,
        bookingUrl: settings.bookingUrl,
      },
      availability: slots,
      busySlots: busyIntervals.map((interval) => ({
        start: interval.start.toISOString(),
        end: interval.end.toISOString(),
      })),
    });
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

/**
 * Create public booking
 * POST /api/booking/public/:bookingUrl
 */
router.post(
  '/public/:bookingUrl',
  upload.single('referralDocument'), // Handle optional file upload
  asyncHandler(async (req, res) => {
    const bookingUrl = req.params.bookingUrl;
    if (!bookingUrl) {
      return res.status(400).json({ message: 'Booking URL is required' });
    }

    const validated = publicBookingSchema.parse(req.body);

    try {
      const result = await createPublicBooking(
        {
          ...validated,
          bookingUrl,
        },
        req.file // Pass the uploaded file to the service
      );
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        logger.error({ err: error }, 'Public booking creation failed');
        return res.status(400).json({ error: error.message });
      }
      return handlePrismaError(error, res);
    }
  })
);

// ========================================
// Direct Booking (Authenticated)
// ========================================

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

// ========================================
// Reschedule Endpoints (Public)
// ========================================

/**
 * Get booking info by reschedule token
 * GET /api/booking/reschedule/:token
 */
router.get(
  '/reschedule/:token',
  asyncHandler(async (req, res) => {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ error: 'Reschedule token is required' });
    }

    const result = await getBookingByToken(token);

    if (!result) {
      return res.status(404).json({ error: 'Invalid reschedule link' });
    }

    if (result.expired) {
      return res.status(400).json({ error: 'This reschedule link has expired' });
    }

    res.json(result);
  })
);

/**
 * Reschedule booking
 * POST /api/booking/reschedule/:token
 */
router.post(
  '/reschedule/:token',
  asyncHandler(async (req, res) => {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ error: 'Reschedule token is required' });
    }

    const validated = rescheduleSchema.parse(req.body);

    try {
      const result = await rescheduleBooking(token, validated);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        logger.error({ err: error }, 'Reschedule failed');
        return res.status(400).json({ error: error.message });
      }
      return handlePrismaError(error, res);
    }
  })
);

export const bookingRouter = router;
