import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.pg";

// Supabase-Vercel integration injects POSTGRES_URL; local .env uses DATABASE_URL
const dbUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL;

const isBuild = process.env.npm_lifecycle_event === "build" || process.env.NEXT_PHASE;

if (!dbUrl && !isBuild) {
    throw new Error(
        "No database URL found. Set DATABASE_URL or connect the Supabase-Vercel integration.",
    );
}

// Strip sslmode param from URL (we configure SSL via the pool options)
const cleanUrl = dbUrl
    ? dbUrl.replace(/[?&]sslmode=[^&]*/g, "").replace(/\?$/, "")
    : "postgres://dummy:dummy@localhost:5432/dummy";

const pool = new Pool({
    connectionString: cleanUrl,
    ssl:
        process.env.NODE_ENV === "production" ||
            dbUrl?.includes("supabase") ||
            dbUrl?.includes("pooler")
            ? { rejectUnauthorized: false }
            : undefined,
});

export const db = drizzle(pool, { schema });
export type Database = typeof db;
