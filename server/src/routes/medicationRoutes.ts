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
import {
  searchMedications,
  upsertMedicationKnowledgeBase,
  getPopularMedications,
  searchIndications,
  CreateMedicationKnowledgeBaseInput,
} from '../services/medicationKnowledgeBaseService';
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

// ==========================================
// KNOWLEDGE BASE ROUTES (Autocomplete/Search)
// ==========================================

/**
 * GET /api/medications/search
 * Search medications by name, generic name, or indication
 */
router.get(
  '/search',
  asyncHandler(async (req, res) => {
    const query = req.query.q as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    if (query.trim().length < 2) {
      return res
        .status(400)
        .json({ message: 'Search query must be at least 2 characters' });
    }

    const results = await searchMedications(query, limit);

    return res.json({
      results,
      count: results.length,
    });
  }),
);

/**
 * GET /api/medications/popular
 * Get most frequently used medications
 */
router.get(
  '/popular',
  asyncHandler(async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const medications = await getPopularMedications(limit);

    return res.json({
      medications,
      count: medications.length,
    });
  }),
);

/**
 * GET /api/medications/indications/search
 * Search indications for autocomplete
 */
router.get(
  '/indications/search',
  asyncHandler(async (req, res) => {
    const query = req.query.q as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const indications = await searchIndications(query, limit);

    return res.json({
      indications,
      count: indications.length,
    });
  }),
);

/**
 * POST /api/medications/knowledge-base
 * Add medication to knowledge base (auto-learning)
 */
router.post(
  '/knowledge-base',
  asyncHandler(async (req, res) => {
    const input: CreateMedicationKnowledgeBaseInput = req.body;

    if (!input.name || input.name.trim().length === 0) {
      return res.status(400).json({ message: 'Medication name is required' });
    }

    const medication = await upsertMedicationKnowledgeBase(input);

    return res.status(201).json(medication);
  }),
);

// ==========================================
// CRUD ROUTES (Existing)
// ==========================================

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
