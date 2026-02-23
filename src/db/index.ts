import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema.sqlite";
import path from "path";

// Local SQLite — no Docker or Postgres required
const dbUrl =
    process.env.DATABASE_URL?.startsWith("file:")
        ? process.env.DATABASE_URL
        : `file:${path.resolve(process.cwd(), "data", "sierra.db")}`;

const client = createClient({ url: dbUrl });

export const db = drizzle(client, { schema });
export type Database = typeof db;
