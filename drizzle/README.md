# Drizzle migrations

This project primarily applies schema changes with:

```bash
pnpm db:push
```

For an existing database that was created before the admin control center work, `db:push` compares [src/db/schema.pg.ts](../src/db/schema.pg.ts) to the live schema and applies additive changes safely.

If you need raw SQL (e.g. a DBA-run script), see [docs/migrations/admin-control-center-upgrade.sql](../docs/migrations/admin-control-center-upgrade.sql).
