/**
 * Database Configuration
 * Prisma client singleton — import this instead of from index.ts
 * to avoid circular dependency issues.
 */

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
});

/**
 * Test the database connection
 */
export async function testDatabaseConnection(): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;
  console.log('✓ Database connected');
}

/**
 * Gracefully disconnect from the database
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
