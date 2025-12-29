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

// Use Session Pooler (port 5432) for Supabase with Vercel
// Remove pgbouncer parameter and ensure we're using session pooler
const connectionString = process.env.DATABASE_URL || '';

// Force Session Pooler by replacing port 6543 with 5432 and removing pgbouncer param
const finalConnectionString = connectionString
  .replace(':6543/', ':5432/')
  .replace('?pgbouncer=true', '')
  .replace('&pgbouncer=true', '');

console.log('[Prisma Setup] Connection config:', {
  hasConnectionString: !!connectionString,
  originalPort: connectionString.match(/:(\d+)\//)?.[1] || 'unknown',
  finalPort: finalConnectionString.match(/:(\d+)\//)?.[1] || 'unknown',
  length: finalConnectionString.length,
});

const pool = new pg.Pool({
  connectionString: finalConnectionString,
  max: 1, // Vercel serverless needs minimal connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Add error logging for pool
pool.on('error', (err) => {
  console.error('[Prisma Setup] Pool error:', err);
});

pool.on('connect', () => {
  console.log('[Prisma Setup] Pool connected successfully');
});

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
