import { defineConfig } from "drizzle-kit";

const dbUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

if (!dbUrl) {
    throw new Error(
        "No database URL. Set DATABASE_URL, POSTGRES_URL, or POSTGRES_URL_NON_POOLING. " +
            "See .env.example and docs/DATABASE.md"
    );
}

export default defineConfig({
    schema: "./src/db/schema.pg.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: dbUrl,
    },
});
