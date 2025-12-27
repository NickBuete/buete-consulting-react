import { prisma } from '../db/prisma';
import {
  BOOKING_TIME_ZONE,
  addMinutesToDate,
  getDateRangeForDate,
} from '../utils/bookingTime';

export interface BusyInterval {
  start: Date;
  end: Date;
}

export const getBusyIntervals = async (
  userId: number,
  startDate: Date,
  endDate: Date,
  durationMinutes: number
): Promise<BusyInterval[]> => {
  const reviews = await prisma.hmrReview.findMany({
    where: {
      ownerId: userId,
      status: { not: 'CANCELLED' },
      scheduledAt: {
        not: null,
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      scheduledAt: true,
    },
  });

  return reviews.map((review) => {
    const start = review.scheduledAt as Date;
    const end = addMinutesToDate(start, durationMinutes);
    return { start, end };
  });
};

export const hasBookingConflict = async (
  userId: number,
  appointmentStart: Date,
  durationMinutes: number,
  bufferBefore: number,
  bufferAfter: number,
  appointmentDate: string,
  timeZone = BOOKING_TIME_ZONE
) => {
  const { start, end } = getDateRangeForDate(appointmentDate, timeZone);
  const busyIntervals = await getBusyIntervals(userId, start, end, durationMinutes);
  const appointmentEnd = addMinutesToDate(appointmentStart, durationMinutes);

  return busyIntervals.some((interval) => {
    const bufferedStart = addMinutesToDate(interval.start, -bufferBefore);
    const bufferedEnd = addMinutesToDate(interval.end, bufferAfter);
    return appointmentStart < bufferedEnd && appointmentEnd > bufferedStart;
  });
};
