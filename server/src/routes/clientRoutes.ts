import type { Request, Response } from 'express';
import { Router } from 'express';
import { Prisma } from '@prisma/client';

import {
  createClient,
  createHostingInfoForClient,
  createSubscriptionForClient,
  deleteClient,
  deleteHostingInfoForClient,
  deleteSubscriptionForClient,
  getClientById,
  listClients,
  listHostingInfoForClient,
  listSubscriptionsForClient,
  updateClient,
  updateHostingInfoForClient,
  updateSubscriptionForClient,
} from '../services/clientService';
import { asyncHandler } from './utils/asyncHandler';
import { clientCreateSchema, clientUpdateSchema } from '../validators/clientSchemas';
import {
  hostingInfoCreateSchema,
  hostingInfoUpdateSchema,
} from '../validators/hostingInfoSchemas';
import {
  subscriptionCreateSchema,
  subscriptionUpdateSchema,
} from '../validators/subscriptionSchemas';

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
      return res.status(409).json({ message: 'Record already exists' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Record not found' });
    }
  }

  throw error;
};

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const clients = await listClients(search ? { search } : undefined);
    res.json(clients);
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = clientCreateSchema.parse(req.body);
    try {
      const client = await createClient(payload);
      res.status(201).json(client);
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
      return res.status(400).json({ message: 'Invalid client id' });
    }
    const client = await getClientById(id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  }),
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: 'Invalid client id' });
    }
    const payload = clientUpdateSchema.parse(req.body);

    try {
      const client = await updateClient(id, payload);
      res.json(client);
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
      return res.status(400).json({ message: 'Invalid client id' });
    }

    try {
      await deleteClient(id);
      res.status(204).send();
    } catch (error) {
      return handlePrismaError(error, res);
    }
  }),
);

router.get(
  '/:clientId/hosting',
  asyncHandler(async (req, res) => {
    const clientId = parseId(req.params.clientId);
    if (clientId === null) {
      return res.status(400).json({ message: 'Invalid client id' });
    }
    const details = await listHostingInfoForClient(clientId);
    res.json(details);
  }),
);

router.post(
  '/:clientId/hosting',
  asyncHandler(async (req, res) => {
    const clientId = parseId(req.params.clientId);
    if (clientId === null) {
      return res.status(400).json({ message: 'Invalid client id' });
    }
    const payload = hostingInfoCreateSchema.parse(req.body);

    try {
      const record = await createHostingInfoForClient(clientId, payload);
      res.status(201).json(record);
    } catch (error) {
      return handlePrismaError(error, res);
    }
  }),
);

router.patch(
  '/:clientId/hosting/:id',
  asyncHandler(async (req, res) => {
    const clientId = parseId(req.params.clientId);
    const id = parseId(req.params.id);
    if (clientId === null || id === null) {
      return res.status(400).json({ message: 'Invalid identifier' });
    }
    const payload = hostingInfoUpdateSchema.parse(req.body);

    const record = await updateHostingInfoForClient(clientId, id, payload);
    if (!record) {
      return res.status(404).json({ message: 'Hosting record not found for this client' });
    }

    res.json(record);
  }),
);

router.delete(
  '/:clientId/hosting/:id',
  asyncHandler(async (req, res) => {
    const clientId = parseId(req.params.clientId);
    const id = parseId(req.params.id);
    if (clientId === null || id === null) {
      return res.status(400).json({ message: 'Invalid identifier' });
    }

    const deleted = await deleteHostingInfoForClient(clientId, id);
    if (!deleted) {
      return res.status(404).json({ message: 'Hosting record not found for this client' });
    }

    res.status(204).send();
  }),
);

router.get(
  '/:clientId/subscriptions',
  asyncHandler(async (req, res) => {
    const clientId = parseId(req.params.clientId);
    if (clientId === null) {
      return res.status(400).json({ message: 'Invalid client id' });
    }
    const subscriptions = await listSubscriptionsForClient(clientId);
    res.json(subscriptions);
  }),
);

router.post(
  '/:clientId/subscriptions',
  asyncHandler(async (req, res) => {
    const clientId = parseId(req.params.clientId);
    if (clientId === null) {
      return res.status(400).json({ message: 'Invalid client id' });
    }
    const payload = subscriptionCreateSchema.parse(req.body);

    try {
      const record = await createSubscriptionForClient(clientId, payload);
      res.status(201).json(record);
    } catch (error) {
      return handlePrismaError(error, res);
    }
  }),
);

router.patch(
  '/:clientId/subscriptions/:id',
  asyncHandler(async (req, res) => {
    const clientId = parseId(req.params.clientId);
    const id = parseId(req.params.id);
    if (clientId === null || id === null) {
      return res.status(400).json({ message: 'Invalid identifier' });
    }
    const payload = subscriptionUpdateSchema.parse(req.body);

    const record = await updateSubscriptionForClient(clientId, id, payload);
    if (!record) {
      return res.status(404).json({ message: 'Subscription not found for this client' });
    }

    res.json(record);
  }),
);

router.delete(
  '/:clientId/subscriptions/:id',
  asyncHandler(async (req, res) => {
    const clientId = parseId(req.params.clientId);
    const id = parseId(req.params.id);
    if (clientId === null || id === null) {
      return res.status(400).json({ message: 'Invalid identifier' });
    }

    const deleted = await deleteSubscriptionForClient(clientId, id);
    if (!deleted) {
      return res.status(404).json({ message: 'Subscription not found for this client' });
    }

    res.status(204).send();
  }),
);

export const clientRouter = router;
