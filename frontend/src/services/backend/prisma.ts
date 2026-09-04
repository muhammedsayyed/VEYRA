import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client singleton.
 *
 * Serverless functions may be hot-reloaded during development; a single
 * shared instance avoids exhausting database connections. The client is
 * created lazily so that importing this module never fails when
 * DATABASE_URL is unavailable (e.g. during static analysis).
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
