import type { Response } from 'express';
import { Router } from 'express';
import { Prisma } from '@prisma/client';

import {
  createUser,
  deleteUser,
  getUserById,
  listUsers,
  updateUser,
} from '../services/userService';
import { asyncHandler } from './utils/asyncHandler';
import { userCreateSchema, userUpdateSchema } from '../validators/userSchemas';
import { prisma } from '../db/prisma';
import { z } from 'zod';

const router = Router();

const parseId = (value: string | undefined) => {
  if (!value) {
    return null;
  }
  const id = Number.parseInt(value, 10);
  if (Number.isNaN(id)) {
    return null;
  }
  return id;
};

const handlePrismaError = (error: unknown, res: Response) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'User already exists' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
  }

  throw error;
};

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const users = await listUsers();
    res.json(users);
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = userCreateSchema.parse(req.body);

    try {
      const user = await createUser(payload);
      res.status(201).json(user);
    } catch (error) {
      return handlePrismaError(error, res);
    }
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  }),
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const payload = userUpdateSchema.parse(req.body);
    try {
      const user = await updateUser(id, payload);
      res.json(user);
    } catch (error) {
      return handlePrismaError(error, res);
    }
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    try {
      await deleteUser(id);
      res.status(204).send();
    } catch (error) {
      return handlePrismaError(error, res);
    }
  }),
);

// Profile endpoints (authenticated user only)
const profileUpdateSchema = z.object({
  pharmacyBusinessName: z.string().min(1).max(150).optional(),
  pharmacyPhone: z.string().max(50).optional(),
  pharmacyAddress: z.string().max(255).optional(),
});

router.get(
  '/profile',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        email: true,
        pharmacyBusinessName: true,
        pharmacyPhone: true,
        pharmacyAddress: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  }),
);

router.patch(
  '/profile',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const validated = profileUpdateSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: userId },
      data: validated,
      select: {
        username: true,
        email: true,
        pharmacyBusinessName: true,
        pharmacyPhone: true,
        pharmacyAddress: true,
      },
    });

    res.json(user);
  }),
);

export const userRouter = router;
