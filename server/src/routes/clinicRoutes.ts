import type { Response } from 'express';
import { Router } from 'express';
import { Prisma } from '../generated/prisma';

import {
  createClinic,
  deleteClinic,
  getClinicById,
  listClinics,
  updateClinic,
} from '../services/clinicService';
import { asyncHandler } from './utils/asyncHandler';
import { clinicCreateSchema, clinicUpdateSchema } from '../validators/clinicSchemas';

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
      return res.status(409).json({ message: 'Clinic already exists' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Clinic not found' });
    }
  }

  throw error;
};

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const clinics = await listClinics();
    res.json(clinics);
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = clinicCreateSchema.parse(req.body);

    try {
      const clinic = await createClinic(payload);
      res.status(201).json(clinic);
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
      return res.status(400).json({ message: 'Invalid clinic id' });
    }

    const clinic = await getClinicById(id);
    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }

    res.json(clinic);
  }),
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: 'Invalid clinic id' });
    }

    const payload = clinicUpdateSchema.parse(req.body);

    try {
      const clinic = await updateClinic(id, payload);
      if (!clinic) {
        return res.status(404).json({ message: 'Clinic not found' });
      }

      res.json(clinic);
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
      return res.status(400).json({ message: 'Invalid clinic id' });
    }

    try {
      const deleted = await deleteClinic(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Clinic not found' });
      }

      res.status(204).send();
    } catch (error) {
      return handlePrismaError(error, res);
    }
  }),
);

export const clinicRouter = router;
