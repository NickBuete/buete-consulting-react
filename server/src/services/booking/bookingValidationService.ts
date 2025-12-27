/**
 * Booking validation service
 * Consolidates booking validation logic from multiple locations
 * Single source of truth for booking business rules
 */

import { prisma } from '../../db/prisma';
import { getDayOfWeekFromDateString, buildDateTime } from '../../utils/bookingTime';
import { hasBookingConflict } from '../bookingAvailability';

/**
 * Validates if an appointment falls within an availability slot
 * @param params - Validation parameters
 * @returns True if appointment is within availability, false otherwise
 */
export const isAppointmentWithinAvailability = async (params: {
  userId: number;
  appointmentDate: string;
  appointmentStart: Date;
  appointmentEnd: Date;
}): Promise<boolean> => {
  const dayOfWeek = getDayOfWeekFromDateString(params.appointmentDate);
  const availabilitySlots = await prisma.availabilitySlot.findMany({
    where: {
      userId: params.userId,
      dayOfWeek,
      isAvailable: true,
    },
  });

  return availabilitySlots.some((slot) => {
    const slotStart = buildDateTime(params.appointmentDate, slot.startTime);
    const slotEnd = buildDateTime(params.appointmentDate, slot.endTime);
    return params.appointmentStart >= slotStart && params.appointmentEnd <= slotEnd;
  });
};

/**
 * Validates that a booking doesn't conflict with existing bookings
 * @param pharmacistId - ID of the pharmacist
 * @param appointmentStart - Start time of appointment
 * @param appointmentEnd - End time of appointment
 * @returns True if there's a conflict, false otherwise
 */
export const validateBookingConflicts = async (
  pharmacistId: number,
  appointmentStart: Date,
  appointmentEnd: Date
): Promise<boolean> => {
  return hasBookingConflict(pharmacistId, appointmentStart, appointmentEnd);
};

/**
 * Validates a reschedule token
 * @param token - The reschedule token to validate
 * @returns The token record if valid, null if invalid or expired
 */
export const validateRescheduleToken = async (token: string) => {
  const rescheduleToken = await prisma.rescheduleToken.findUnique({
    where: { token },
    include: {
      hmrReview: {
        include: {
          patient: true,
          owner: {
            select: {
              id: true,
              username: true,
              email: true,
              calendarSyncEnabled: true,
              microsoftAccessToken: true,
              microsoftRefreshToken: true,
              microsoftTokenExpiry: true,
            },
          },
        },
      },
    },
  });

  if (!rescheduleToken) {
    return null;
  }

  // Check if token is expired
  if (rescheduleToken.expiresAt < new Date()) {
    return null;
  }

  return rescheduleToken;
};
