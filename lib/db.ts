import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

const globalForDb = global as unknown as { db: ReturnType<typeof drizzle> | undefined };

const client = postgres(process.env.DATABASE_URL!);

export const db = globalForDb.db ?? drizzle(client, { schema });

export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;
