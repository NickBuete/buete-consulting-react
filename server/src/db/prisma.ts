import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var prisma: PrismaClient | undefined;
}

// Prisma v7 requires a driver adapter
// Create connection pool using pg directly
console.log('[Prisma Setup] DATABASE_URL:', {
  type: typeof process.env.DATABASE_URL,
  value: process.env.DATABASE_URL?.substring(0, 30) + '...',
  isString: typeof process.env.DATABASE_URL === 'string',
});

// Configure pg.Pool with prepared statements disabled for PgBouncer compatibility
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // Disable prepared statements for Transaction Pooler mode
  // @ts-ignore - This option exists in pg but types may not reflect it
  statement_timeout: 0,
});
const adapter = new PrismaPg(pool, { prepareStatements: false });

const prismaClient = globalThis.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prismaClient;
}

export const prisma = prismaClient;
