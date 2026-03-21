# Supabase – Production (Sierra Supplements)

This doc matches the **Sierra Strength** Supabase project used for production Postgres + Storage.

| | |
|--|--|
| **Project** | Sierra Strength |
| **Project ref** | `kkxvtztyrhupeaojwigq` |
| **Region** | `us-west-1` |
| **API URL** | `https://kkxvtztyrhupeaojwigq.supabase.co` → set as `NEXT_PUBLIC_SUPABASE_URL` |

Keep the project **active** (paused projects stop resolving the DB host and break deploys).

## Database

- **Connection string:** Supabase → **Project Settings → Database → Connection string → URI** → **Transaction** (pooler, port **6543**). Append `?pgbouncer=true` if not already present (see `docs/DATABASE.md`).
- Set `DATABASE_URL` in Vercel and local `.env`.

### Schema

App tables in `public`: `events`, `leads`, `products`, `orders`, `testimonials` (aligned with `src/db/schema.pg.ts`).

**Row Level Security (RLS)** is enabled on all of these tables. There are **no** policies for `anon` / `authenticated`, so the **Supabase Data API** cannot read or write these rows without you adding policies. The Next.js app uses **Drizzle** over the Postgres connection string; the table owner (`postgres`) bypasses RLS, so the app continues to work as before.

If you later expose tables to the browser via Supabase client + anon key, add explicit RLS policies first.

### Local sync

From a machine that can reach Supabase (correct `DATABASE_URL`):

```bash
pnpm db:push    # if you change schema in code
pnpm db:seed    # upserts products; inserts testimonials if table was empty
```

## Storage

- **Bucket:** `store-images` (public) — product images for admin upload.
- See **`docs/SUPABASE-STORAGE.md`** for details.
- **Secrets:** `SUPABASE_SERVICE_ROLE_KEY` (server-only) from **Settings → API**.

## Vercel checklist

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Pooler URI (6543) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://kkxvtztyrhupeaojwigq.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Storage uploads (never expose to the client) |
| `SUPABASE_STORAGE_BUCKET` | Optional; default is `store-images` |

Redeploy after changing env vars.

## Supabase linter

After DDL changes, check **Database → Advisors** in the dashboard. “RLS enabled, no policy” is **expected** for this setup until you add client-facing policies.
