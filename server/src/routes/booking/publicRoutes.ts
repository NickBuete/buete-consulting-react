import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { prisma } from '../../db/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { handlePrismaError } from '../../middleware/prismaErrorHandler';
import { logger } from '../../utils/logger';
import { BOOKING_TIME_ZONE, getDateRangeFromToday } from '../../utils/bookingTime';
import { getBusyIntervals } from '../../services/bookingAvailability';
import { publicBookingSchema, rescheduleSchema } from '../../validators/bookingSchemas';
import {
  createPublicBooking,
  getBookingByToken,
  rescheduleBooking,
} from '../../services/booking';

const router = Router();

// Configure multer for memory storage (file will be in req.file.buffer)
// Make it optional - only process if Content-Type is multipart/form-data
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

// Optional upload middleware - only applies if multipart/form-data
const optionalUpload = (req: any, res: any, next: any) => {
  const contentType = req.get('Content-Type') || '';
  if (contentType.includes('multipart/form-data')) {
    upload.single('referralDocument')(req, res, next);
  } else {
    next();
  }
};

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
 * Create public booking
 * POST /api/booking/public/:bookingUrl
 */
router.post(
  '/public/:bookingUrl',
  optionalUpload, // Handle optional file upload only if multipart/form-data
  asyncHandler(async (req, res) => {
    const bookingUrl = req.params.bookingUrl;
    if (!bookingUrl) {
      return res.status(400).json({ message: 'Booking URL is required' });
    }

    // Validate request body
    let validated;
    try {
      validated = publicBookingSchema.parse(req.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error({ validation: error.format(), body: req.body }, 'Validation failed');
        return res.status(400).json({
          error: 'Validation failed',
          details: error.format(),
        });
      }
      throw error;
    }

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

export const publicBookingRouter = router;
