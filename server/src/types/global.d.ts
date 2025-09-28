import type { PrismaClient, UserRole } from '../generated/prisma';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

declare namespace Express {
  interface Request {
    user?: {
      id: number;
      email: string;
      role: UserRole;
    };
  }
}

export {};
