import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.pg";

let pool: Pool | undefined;
let dbInstance: NodePgDatabase<typeof schema> | undefined;

/**
 * Resolve connection string at use time (not at module load).
 * Avoids Next.js build loading this module with a dummy pool that would otherwise
 * stick around in some serverless bundles.
 */
function resolveCleanUrl(): string {
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

    if (!dbUrl) {
        dbUrl = "postgres://dummy:dummy@localhost:5432/dummy";
    }

    if (
        dbUrl.includes("supabase") &&
        dbUrl.includes("6543") &&
        !dbUrl.includes("pgbouncer=true")
    ) {
        const sep = dbUrl.includes("?") ? "&" : "?";
        dbUrl = `${dbUrl}${sep}pgbouncer=true`;
    }

    return dbUrl
        .replace(/[?&]sslmode=[^&]*/g, "")
        .replace(/\?$/, "");
}

function getPool(): Pool {
    if (pool) return pool;

    const cleanUrl = resolveCleanUrl();

    const hostish = cleanUrl.toLowerCase();
    const isLocalHost =
        hostish.includes("localhost") ||
        hostish.includes("127.0.0.1") ||
        hostish.includes("@192.168.") ||
        hostish.includes(".internal");

    const rejectUnauthorized =
        process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === "false"
            ? false
            : true;

    pool = new Pool({
        connectionString: cleanUrl,
        ssl: !isLocalHost ? { rejectUnauthorized } : undefined,
    });
    return pool;
}

function getDb(): NodePgDatabase<typeof schema> {
    if (!dbInstance) {
        dbInstance = drizzle(getPool(), { schema });
    }
    return dbInstance;
}

export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
    get(_target, prop) {
        const real = getDb() as unknown as Record<string | symbol, unknown>;
        const value = real[prop as string];
        return typeof value === "function" ? value.bind(real) : value;
    },
}) as NodePgDatabase<typeof schema>;

export type Database = NodePgDatabase<typeof schema>;
/** Argument to `db.transaction(async (tx) => ...)` */
export type DbTransaction = Parameters<
    Parameters<Database["transaction"]>[0]
>[0];
