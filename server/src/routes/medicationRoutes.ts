import type { Response } from 'express';
import { Router } from 'express';
import { Prisma } from '../generated/prisma';

import {
  createMedication,
  deleteMedication,
  getMedicationById,
  listMedications,
  updateMedication,
} from '../services/medicationService';
import { asyncHandler } from './utils/asyncHandler';
import {
  medicationCreateSchema,
  medicationUpdateSchema,
} from '../validators/medicationSchemas';

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
      return res.status(409).json({ message: 'Medication already exists' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Medication not found' });
    }
  }

  throw error;
};

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const medications = await listMedications();
    res.json(medications);
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = medicationCreateSchema.parse(req.body);

    try {
      const medication = await createMedication(payload);
      res.status(201).json(medication);
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
      return res.status(400).json({ message: 'Invalid medication id' });
    }

    const medication = await getMedicationById(id);
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    res.json(medication);
  }),
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: 'Invalid medication id' });
    }

    const payload = medicationUpdateSchema.parse(req.body);

    try {
      const medication = await updateMedication(id, payload);
      res.json(medication);
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
      return res.status(400).json({ message: 'Invalid medication id' });
    }

    try {
      await deleteMedication(id);
      res.status(204).send();
    } catch (error) {
      return handlePrismaError(error, res);
    }
  }),
);

export const medicationRouter = router;
