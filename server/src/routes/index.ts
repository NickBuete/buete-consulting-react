import type { Express } from 'express';

import { clientRouter } from './clientRoutes';
import { userRouter } from './userRoutes';
import { clinicRouter } from './clinicRoutes';
import { prescriberRouter } from './prescriberRoutes';
import { patientRouter } from './patientRoutes';
import { medicationRouter } from './medicationRoutes';
import { hmrReviewRouter } from './hmrReviewRoutes';

export const registerRoutes = (app: Express) => {
  app.use('/api/clients', clientRouter);
  app.use('/api/users', userRouter);
  app.use('/api/clinics', clinicRouter);
  app.use('/api/prescribers', prescriberRouter);
  app.use('/api/patients', patientRouter);
  app.use('/api/medications', medicationRouter);
  app.use('/api/hmr', hmrReviewRouter);
};
