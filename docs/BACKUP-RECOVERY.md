# Backup & Recovery – Sierra Supplements

## Database (Supabase Postgres)

### Automatic backups

- Supabase provides **daily backups** for projects (retention depends on your plan).
- **Dashboard** → **Database** → **Backups** – view restore points and instructions.

### Point-in-Time Recovery (PITR)

- Available on **paid** plans for finer restore windows.
- See [Supabase Database Backups](https://supabase.com/docs/guides/platform/backups).

### Manual export (extra safety)

- **Supabase** → **SQL Editor** or `pg_dump` via connection string (use non-pooling host if required).
- Optional: schedule **GitHub Actions** to run `pg_dump` and store artifacts (see Supabase docs: *Automated backups using GitHub Actions*).

### After restore

- Redeploy the app if env vars changed.
- Run `pnpm db:push` only if schema drifted; usually not needed after a pure data restore.

---

## Product catalog (Drizzle / `products` table)

- **Source of truth in production:** Postgres (`products` rows).
- **Seed file:** `src/db/seed-products.ts` – use `pnpm db:seed` to repopulate from code after a wipe (overwrites by slug).
- **Admin edits** are only in the database – keep backups current for client-managed copy.

---

## Images

| Location | Backup approach |
|----------|-----------------|
| **`public/images/store/`** (slug-based JPGs) | Versioned in **Git**; redeploy restores them. |
| **Supabase Storage** (`store-images` bucket) | Rely on Supabase platform backups / export objects periodically from Dashboard or S3-compatible tooling. |

---

## Orders & leads

- Stored in `orders` and `leads` tables – included in **database backups**.
- For compliance, export or archive periodically if you need long-term retention beyond Supabase retention.

---

## Rate limits (app)

- Public APIs (`/api/orders`, `/api/leads`, `/api/events`) use **in-memory** per-IP limits (best effort on serverless).
- For strict, distributed limits, add **Upstash Redis** or **Vercel KV** later.

---

## Quick recovery checklist

1. Restore database from Supabase backup (or re-seed + re-upload images if acceptable).
2. Confirm `DATABASE_URL`, auth, and Resend env vars on Vercel.
3. If using Storage uploads, confirm bucket + `SUPABASE_*` env vars.
4. Redeploy and smoke-test store checkout and admin product edit.
