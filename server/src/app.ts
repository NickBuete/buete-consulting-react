import cors from 'cors';
import express from 'express';
import { ZodError } from 'zod';

import { env } from './config/env';
import { registerRoutes } from './routes';

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  registerRoutes(app);

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        issues: err.flatten(),
      });
    }

    console.error(err); // eslint-disable-line no-console
    return res.status(500).json({ message: 'Internal server error' });
  });

  return app;
};

export const port = env.port;
