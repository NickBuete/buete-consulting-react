import type { NextFunction, Request, Response } from 'express';
import { UserRole } from '../generated/prisma';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const role = req.user.role as UserRole;
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return next();
  };
};
