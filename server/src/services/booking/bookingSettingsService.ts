/**
 * Booking settings management service
 * Extracted from bookingRoutes.ts lines 150-220
 */

import { prisma } from '../../db/prisma';
import { withTenantContext } from '../../db/tenant';
import type { BookingSettings } from '@prisma/client';

export interface BookingSettingsUpdateInput {
  bufferTimeBefore?: number;
  bufferTimeAfter?: number;
  defaultDuration?: number;
  allowPublicBooking?: boolean;
  requireApproval?: boolean;
  bookingUrl?: string;
  confirmationEmailText?: string;
  reminderEmailText?: string;
}

/**
 * Get booking settings for a user, creating defaults if they don't exist
 */
export const getOrCreateBookingSettings = async (ownerId: number): Promise<BookingSettings> => {
  return withTenantContext(ownerId, async (tx) => {
    let settings = await tx.bookingSettings.findUnique({
      where: { userId: ownerId },
    });

    if (!settings) {
      // Create default settings
      settings = await tx.bookingSettings.create({
        data: {
          userId: ownerId,
          bufferTimeBefore: 0,
          bufferTimeAfter: 0,
          defaultDuration: 60,
          allowPublicBooking: false,
          requireApproval: true,
          bookingUrl: `pharmacist-${ownerId}`,
        },
      });
    }

    return settings;
  });
};

/**
 * Update booking settings (upsert pattern)
 */
export const updateBookingSettings = async (
  ownerId: number,
  data: BookingSettingsUpdateInput
): Promise<BookingSettings> => {
  return withTenantContext(ownerId, async (tx) => {
    const userId = ownerId;

    // Create data for new settings
    const createData = {
      userId,
      bufferTimeBefore: data.bufferTimeBefore ?? 0,
      bufferTimeAfter: data.bufferTimeAfter ?? 0,
      defaultDuration: data.defaultDuration ?? 60,
      allowPublicBooking: data.allowPublicBooking ?? false,
      requireApproval: data.requireApproval ?? true,
      bookingUrl: data.bookingUrl ?? `pharmacist-${userId}`,
      confirmationEmailText: data.confirmationEmailText ?? null,
      reminderEmailText: data.reminderEmailText ?? null,
    };

    // Filter out undefined values for update
    const updateData: any = {};
    if (data.bufferTimeBefore !== undefined) updateData.bufferTimeBefore = data.bufferTimeBefore;
    if (data.bufferTimeAfter !== undefined) updateData.bufferTimeAfter = data.bufferTimeAfter;
    if (data.defaultDuration !== undefined) updateData.defaultDuration = data.defaultDuration;
    if (data.allowPublicBooking !== undefined) updateData.allowPublicBooking = data.allowPublicBooking;
    if (data.requireApproval !== undefined) updateData.requireApproval = data.requireApproval;
    if (data.bookingUrl !== undefined) updateData.bookingUrl = data.bookingUrl;
    if (data.confirmationEmailText !== undefined) updateData.confirmationEmailText = data.confirmationEmailText;
    if (data.reminderEmailText !== undefined) updateData.reminderEmailText = data.reminderEmailText;

    return tx.bookingSettings.upsert({
      where: { userId },
      create: createData,
      update: updateData,
    });
  });
};
