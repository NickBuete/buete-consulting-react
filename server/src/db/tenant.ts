import type { Prisma } from '../generated/prisma';
import { prisma } from './prisma';

/**
 * Executes the provided callback within a transaction that scopes all queries
 * to the given owner by leveraging a Postgres session variable. This enables
 * row-level security policies that rely on `current_setting('app.current_user_id')`.
 */
export const withTenantContext = async <T>(
  ownerId: number,
  callback: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> => {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.current_user_id', ${ownerId.toString()}, true)`;
    return callback(tx);
  });
};
