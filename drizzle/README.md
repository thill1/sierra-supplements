# Drizzle migrations

## Option A — `db:push` (typical dev / Supabase)

```bash
pnpm db:push
```

Compares [src/db/schema.pg.ts](../src/db/schema.pg.ts) to the live database and applies changes.

## Option B — versioned SQL (greenfield or CI)

Generated migrations live in this folder (e.g. `0000_baseline.sql`). After editing the schema:

```bash
pnpm db:generate
```

Apply on a **new** database (or one that has never run these files):

```bash
pnpm db:migrate
```

**Existing** databases that were already provisioned with `db:push` should keep using `db:push`, or treat the baseline as documentation-only unless you intentionally baseline-migrate a fresh environment. DBA-oriented SQL for incremental upgrades may also live under [docs/migrations/](../docs/migrations/).
