/**
 * Availability slot CRUD operations
 * Extracted from bookingRoutes.ts lines 56-148
 */

import { prisma } from '../../db/prisma';
import { withTenantContext } from '../../db/tenant';
import type { AvailabilitySlot, DayOfWeek } from '@prisma/client';

export interface AvailabilitySlotCreateInput {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isAvailable?: boolean;
}

export interface AvailabilitySlotUpdateInput {
  dayOfWeek?: DayOfWeek;
  startTime?: string;
  endTime?: string;
  isAvailable?: boolean;
}

/**
 * List all availability slots for a user
 */
export const listAvailabilitySlots = async (ownerId: number): Promise<AvailabilitySlot[]> => {
  return withTenantContext(ownerId, async (tx) => {
    return tx.availabilitySlot.findMany({
      where: { userId: ownerId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  });
};

/**
 * Create a new availability slot
 */
export const createAvailabilitySlot = async (
  ownerId: number,
  data: AvailabilitySlotCreateInput
): Promise<AvailabilitySlot> => {
  return withTenantContext(ownerId, async (tx) => {
    return tx.availabilitySlot.create({
      data: {
        userId: ownerId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
      },
    });
  });
};

/**
 * Update an availability slot
 */
export const updateAvailabilitySlot = async (
  ownerId: number,
  slotId: number,
  data: AvailabilitySlotUpdateInput
): Promise<AvailabilitySlot | null> => {
  return withTenantContext(ownerId, async (tx) => {
    // Build update payload
    const updateData: any = {};
    if (data.dayOfWeek !== undefined) updateData.dayOfWeek = data.dayOfWeek;
    if (data.startTime !== undefined) updateData.startTime = data.startTime;
    if (data.endTime !== undefined) updateData.endTime = data.endTime;
    if (data.isAvailable !== undefined) updateData.isAvailable = data.isAvailable;

    return tx.availabilitySlot.update({
      where: {
        id: slotId,
        userId: ownerId, // Ensure ownership
      },
      data: updateData,
    });
  });
};

/**
 * Delete an availability slot
 */
export const deleteAvailabilitySlot = async (
  ownerId: number,
  slotId: number
): Promise<boolean> => {
  return withTenantContext(ownerId, async (tx) => {
    await tx.availabilitySlot.delete({
      where: {
        id: slotId,
        userId: ownerId, // Ensure ownership
      },
    });
    return true;
  });
};
