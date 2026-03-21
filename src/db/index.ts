import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.pg";

let dbUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL;

const isBuild =
    process.env.npm_lifecycle_event === "build" || process.env.NEXT_PHASE;

if (!dbUrl && !isBuild) {
    throw new Error(
        "No database URL found. Set DATABASE_URL or connect the Supabase-Vercel integration.",
    );
}

if (
    dbUrl &&
    dbUrl.includes("supabase") &&
    dbUrl.includes("6543") &&
    !dbUrl.includes("pgbouncer=true")
) {
    const sep = dbUrl.includes("?") ? "&" : "?";
    dbUrl = `${dbUrl}${sep}pgbouncer=true`;
}

const cleanUrl = dbUrl
    ? dbUrl.replace(/[?&]sslmode=[^&]*/g, "").replace(/\?$/, "")
    : "postgres://dummy:dummy@localhost:5432/dummy";

const hostish = cleanUrl.toLowerCase();
const isLocalHost =
    hostish.includes("localhost") ||
    hostish.includes("127.0.0.1") ||
    hostish.includes("@192.168.") ||
    hostish.includes(".internal");

const rejectUnauthorized =
    process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === "false" ? false : true;

const pool = new Pool({
    connectionString: cleanUrl,
    ssl: !isLocalHost ? { rejectUnauthorized } : undefined,
});

export const db = drizzle(pool, { schema });
export type Database = typeof db;
