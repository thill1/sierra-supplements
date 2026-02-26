import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.pg";

// Supabase-Vercel integration injects POSTGRES_URL; local .env uses DATABASE_URL
const dbUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL;

if (!dbUrl) {
    throw new Error(
        "No database URL found. Set DATABASE_URL or connect the Supabase-Vercel integration.",
    );
}

const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });
export type Database = typeof db;
