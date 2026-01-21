/**
 * Booking routes
 * Refactored from 931 lines to follow routes → services pattern
 * Services handle all business logic, routes handle HTTP orchestration
 */

import { Router } from 'express';
import { availabilityRouter } from './booking/availabilityRoutes';
import { settingsRouter } from './booking/settingsRoutes';
import { publicBookingRouter } from './booking/publicRoutes';
import { directBookingRouter } from './booking/directRoutes';

const router = Router();

router.use(availabilityRouter);
router.use(settingsRouter);
router.use(publicBookingRouter);
router.use(directBookingRouter);

export const bookingRouter = router;
