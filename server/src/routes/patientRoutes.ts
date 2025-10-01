import type { Response } from 'express';
import { Router } from 'express';
import { Prisma } from '@prisma/client';

import {
  createPatient,
  deletePatient,
  getPatientById,
  listPatients,
  type ListPatientsOptions,
  updatePatient,
} from '../services/patientService';
import { asyncHandler } from './utils/asyncHandler';
import { patientCreateSchema, patientUpdateSchema } from '../validators/patientSchemas';

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
      return res.status(409).json({ message: 'Patient already exists' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Patient not found' });
    }
  }

  throw error;
};

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const clientIdValue =
      typeof req.query.clientId === 'string' ? Number.parseInt(req.query.clientId, 10) : undefined;

    const options: ListPatientsOptions = {};
    if (search) {
      options.search = search;
    }
    if (typeof clientIdValue === 'number' && Number.isFinite(clientIdValue)) {
      options.clientId = clientIdValue;
    }

    const ownerId = req.user!.id;
    const patients = await listPatients(ownerId, options);
    res.json(patients);
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = patientCreateSchema.parse(req.body);

    try {
      const ownerId = req.user!.id;
      const patient = await createPatient(ownerId, payload);
      res.status(201).json(patient);
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
      return res.status(400).json({ message: 'Invalid patient id' });
    }

    const ownerId = req.user!.id;
    const patient = await getPatientById(ownerId, id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(patient);
  }),
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: 'Invalid patient id' });
    }

    const payload = patientUpdateSchema.parse(req.body);

    try {
      const ownerId = req.user!.id;
      const patient = await updatePatient(ownerId, id, payload);
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }

      res.json(patient);
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
      return res.status(400).json({ message: 'Invalid patient id' });
    }

    try {
      const ownerId = req.user!.id;
      const deleted = await deletePatient(ownerId, id);
      if (!deleted) {
        return res.status(404).json({ message: 'Patient not found' });
      }

      res.status(204).send();
    } catch (error) {
      return handlePrismaError(error, res);
    }
  }),
);

export const patientRouter = router;
