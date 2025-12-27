import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var prisma: PrismaClient | undefined;
}

// Create PostgreSQL connection pool
// In Prisma v7, we use pg.Pool directly with the connection string from env
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL must be set');
}

const pool = new Pool({ connectionString });

// Create Prisma adapter
const adapter = new PrismaPg(pool);

const prismaClient = globalThis.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prismaClient;
}

export const prisma = prismaClient;
