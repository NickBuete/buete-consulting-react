import type { Response } from 'express';
import { Router } from 'express';
import { Prisma } from '../generated/prisma';

import {
  createPrescriber,
  deletePrescriber,
  getPrescriberById,
  listPrescribers,
  updatePrescriber,
} from '../services/prescriberService';
import { asyncHandler } from './utils/asyncHandler';
import {
  prescriberCreateSchema,
  prescriberUpdateSchema,
} from '../validators/prescriberSchemas';

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
      return res.status(409).json({ message: 'Prescriber already exists' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Prescriber not found' });
    }
  }

  throw error;
};

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const ownerId = req.user!.id;
    const prescribers = await listPrescribers(ownerId);
    res.json(prescribers);
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = prescriberCreateSchema.parse(req.body);

    try {
      const ownerId = req.user!.id;
      const prescriber = await createPrescriber(ownerId, payload);
      if (!prescriber) {
        return res.status(404).json({ message: 'Clinic not found' });
      }

      res.status(201).json(prescriber);
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
      return res.status(400).json({ message: 'Invalid prescriber id' });
    }

    const ownerId = req.user!.id;
    const prescriber = await getPrescriberById(ownerId, id);
    if (!prescriber) {
      return res.status(404).json({ message: 'Prescriber not found' });
    }

    res.json(prescriber);
  }),
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: 'Invalid prescriber id' });
    }

    const payload = prescriberUpdateSchema.parse(req.body);

    try {
      const ownerId = req.user!.id;
      const prescriber = await updatePrescriber(ownerId, id, payload);
      if (!prescriber) {
        return res.status(404).json({ message: 'Prescriber not found' });
      }

      res.json(prescriber);
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
      return res.status(400).json({ message: 'Invalid prescriber id' });
    }

    try {
      const ownerId = req.user!.id;
      const deleted = await deletePrescriber(ownerId, id);
      if (!deleted) {
        return res.status(404).json({ message: 'Prescriber not found' });
      }

      res.status(204).send();
    } catch (error) {
      return handlePrismaError(error, res);
    }
  }),
);

export const prescriberRouter = router;
