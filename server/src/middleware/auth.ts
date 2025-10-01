import type { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { verifyToken } from '../utils/jwt';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!Object.values(UserRole).includes(payload.role as UserRole)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  req.user = {
    id: payload.sub,
    email: payload.email,
    role: payload.role as UserRole,
  };

  return next();
};
