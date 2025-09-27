import { PrismaClient } from '../generated/prisma';
import { env } from '../config/env';

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var prisma: PrismaClient | undefined;
}

const prismaClient = globalThis.prisma ??
  new PrismaClient({
    datasources: { db: { url: env.databaseUrl } },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prismaClient;
}

export const prisma = prismaClient;
