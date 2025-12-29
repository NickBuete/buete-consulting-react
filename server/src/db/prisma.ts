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
// Parse connection string explicitly to avoid pg.Pool parsing issues
const connectionString = process.env.DATABASE_URL || '';

// Force Session Pooler by replacing port 6543 with 5432 and removing pgbouncer param
const finalConnectionString = connectionString
  .replace(':6543/', ':5432/')
  .replace('?pgbouncer=true', '')
  .replace('&pgbouncer=true', '');

// Parse the connection string to extract components
const urlMatch = finalConnectionString.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
if (!urlMatch) {
  throw new Error('Invalid DATABASE_URL format');
}

const [, user, password, host, port, database] = urlMatch;

console.log('[Prisma Setup] Connection config:', {
  host,
  port,
  database,
  user,
  hasPassword: !!password,
});

// Rebuild connection string with explicit SSL
const poolConnectionString = `postgresql://${user}:${password}@${host}:${port}/${database}?sslmode=require`;

console.log('[Prisma Setup] Reconstructed connection string:', {
  format: `postgresql://${user}:***@${host}:${port}/${database}?sslmode=require`,
});

const pool = new pg.Pool({
  connectionString: poolConnectionString,
  max: 1,
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

// Test the pool connection immediately
pool.query('SELECT 1').then(() => {
  console.log('[Prisma Setup] Pool test query successful');
}).catch((err) => {
  console.error('[Prisma Setup] Pool test query failed:', err);
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
