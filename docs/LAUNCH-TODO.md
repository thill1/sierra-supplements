# Before Launch Checklist

**→ See `docs/MONDAY-LAUNCH.md` for a focused Monday launch plan.**

## Database (required for store/admin)

The store uses **db-first with hardcoded fallback** – it works without `DATABASE_URL`, but admin, leads, and orders need the database.

1. **Choose a provider** — Supabase, Neon, or Vercel Postgres. See `docs/DATABASE.md`.

2. **Add `DATABASE_URL` to Vercel**
   - Supabase: Transaction pooler URI (port 6543)
   - Neon: Connection string from dashboard
   - Vercel Postgres: `POSTGRES_URL` is auto-injected

3. **Sync the database**
   ```bash
   pnpm db:push
   pnpm db:seed
   ```

4. **Redeploy** on Vercel after env vars.

## Other env vars (Vercel)

| Variable | Purpose |
|----------|---------|
| `NEXTAUTH_SECRET` | Auth sessions |
| `NEXTAUTH_URL` | Production URL |
| `NEXT_PUBLIC_APP_URL` | Same as production site URL |
| `RESEND_API_KEY` | Order + contact emails |
| `ADMIN_EMAIL` | Where to send notifications |
| `NEXT_PUBLIC_SUPABASE_URL` | (Optional) Admin image uploads – see `docs/SUPABASE-STORAGE.md` |
| `SUPABASE_SERVICE_ROLE_KEY` | (Optional) Server-only; never expose to the browser |
| `SUPABASE_STORAGE_BUCKET` | (Optional) Default `store-images` |

## Backups

See **`docs/BACKUP-RECOVERY.md`** for database, Storage, and recovery steps.
