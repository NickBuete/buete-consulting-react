/**
 * Shared Prisma error handling utility
 * Extracted from duplicated handlePrismaError functions across 14+ route files
 */

import type { Response } from 'express';
import { Prisma } from '@prisma/client';
import { InvalidTransitionError } from '../services/hmr/workflowStateManager';

/**
 * Handles Prisma and custom domain errors, converting them to appropriate HTTP responses
 * This is NOT Express middleware - it's a utility function used in try/catch blocks
 *
 * @param error - The error to handle
 * @param res - Express response object
 * @returns Response with appropriate status code, or throws if error is unknown
 */
export const handlePrismaError = (error: unknown, res: Response) => {
  // Handle Prisma-specific errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Resource already exists' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Resource not found' });
    }
  }

  // Handle custom domain errors
  if (error instanceof InvalidTransitionError) {
    return res.status(400).json({ message: error.message });
  }

  // Unknown error - let asyncHandler catch it
  throw error;
};
