import type { Express } from 'express';

import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { UserRole } from '../generated/prisma';
import { authRouter } from './authRoutes';
import { clientRouter } from './clientRoutes';
import { userRouter } from './userRoutes';
import { clinicRouter } from './clinicRoutes';
import { prescriberRouter } from './prescriberRoutes';
import { patientRouter } from './patientRoutes';
import { medicationRouter } from './medicationRoutes';
import { hmrReviewRouter } from './hmrReviewRoutes';
import { hmrReportRouter } from './hmrReportRoutes';
import { hmrEducationRouter } from './hmrEducationRoutes';
import { hmrRecommendationRouter } from './hmrRecommendationRoutes';
import { hmrReportRouter } from './hmrReportRoutes';

export const registerRoutes = (app: Express) => {
  app.use('/api/auth', authRouter);

  app.use('/api/clients', authenticate, authorize(UserRole.PRO, UserRole.ADMIN), clientRouter);
  app.use('/api/users', authenticate, authorize(UserRole.ADMIN), userRouter);
  app.use('/api/clinics', authenticate, authorize(UserRole.PRO, UserRole.ADMIN), clinicRouter);
  app.use('/api/prescribers', authenticate, authorize(UserRole.PRO, UserRole.ADMIN), prescriberRouter);
  app.use('/api/patients', authenticate, authorize(UserRole.PRO, UserRole.ADMIN), patientRouter);
  app.use('/api/medications', authenticate, authorize(UserRole.PRO, UserRole.ADMIN), medicationRouter);
  app.use('/api/hmr', authenticate, authorize(UserRole.PRO, UserRole.ADMIN), hmrReviewRouter);
  app.use('/api/hmr/reports', authenticate, authorize(UserRole.PRO, UserRole.ADMIN), hmrReportRouter);
  app.use('/api/hmr/reviews/:reviewId/education', authenticate, authorize(UserRole.PRO, UserRole.ADMIN), hmrEducationRouter);
  app.use('/api/hmr/reviews/:reviewId/recommendations', authenticate, authorize(UserRole.PRO, UserRole.ADMIN), hmrRecommendationRouter);
};
