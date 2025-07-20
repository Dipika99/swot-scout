import path from 'node:path';

import { PGlite } from '@electric-sql/pglite';
import { eq } from 'drizzle-orm';
import { drizzle as drizzlePglite, type PgliteDatabase } from 'drizzle-orm/pglite';
import { migrate as migratePglite } from 'drizzle-orm/pglite/migrator';

import * as schema from '@/models/Schema';

// Stores the db connection in the global scope to prevent multiple instances due to hot reloading with Next.js
const global = globalThis as unknown as { client: PGlite; drizzle: PgliteDatabase<typeof schema> };

if (!global.client) {
  global.client = new PGlite();
  await global.client.waitReady;

  global.drizzle = drizzlePglite(global.client, { schema });
}

const drizzle = global.drizzle;
await migratePglite(global.drizzle, {
  migrationsFolder: path.join(process.cwd(), 'migrations'),
});

export const db = drizzle;

// Report functions
export const createReport = async (data: {
  userId: string;
  title: string;
  product: string;
  objective: string;
  segment: string;
  metadata?: any;
}) => {
  return await db.insert(schema.reportSchema).values(data).returning();
};

export const getReportsByUserId = async (userId: string) => {
  return await db.select().from(schema.reportSchema).where(eq(schema.reportSchema.userId, userId));
};

export const getReportById = async (id: number) => {
  return await db.select().from(schema.reportSchema).where(eq(schema.reportSchema.id, id)).limit(1);
};

// Insight functions
export const createInsight = async (data: {
  reportId: number;
  category: string;
  prompt: string;
  response: string;
  modelVersion: string;
  processingTime?: number;
}) => {
  return await db.insert(schema.insightSchema).values(data).returning();
};

export const getInsightsByReportId = async (reportId: number) => {
  return await db.select().from(schema.insightSchema).where(eq(schema.insightSchema.reportId, reportId));
};

// Comparison functions
export const createComparison = async (data: {
  userId: string;
  title: string;
  description?: string;
  reportIds: number[];
  comparisonType: string;
  metadata?: any;
}) => {
  return await db.insert(schema.comparisonSchema).values(data).returning();
};

export const getComparisonsByUserId = async (userId: string) => {
  return await db.select().from(schema.comparisonSchema).where(eq(schema.comparisonSchema.userId, userId));
};

export const getComparisonById = async (id: number) => {
  return await db.select().from(schema.comparisonSchema).where(eq(schema.comparisonSchema.id, id)).limit(1);
};
