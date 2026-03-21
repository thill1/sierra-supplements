# Launch checklist

**→ See `docs/MONDAY-LAUNCH.md` for a focused launch plan.**

## Required before production traffic

1. **Postgres** — Supabase (or other) with **pooler 6543** on Vercel. `pnpm db:push` + `pnpm db:seed` (or equivalent) on production.

2. **Environment variables on Vercel (Production + Preview)**  
   - `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`  
   - **`ADMIN_EMAILS`** — comma-separated; who may sign in and use admin  
   - `RESEND_API_KEY`, `ADMIN_EMAIL`  
   - Optional: Google OAuth, Supabase Storage for uploads  

3. **Verify**  
   - `/store` loads products from DB (not static fallback — do **not** set `ALLOW_HARDCODED_CATALOG` unless intentional).  
   - `/api/health` returns `"database": true`.  
   - Non-allowlisted email **cannot** sign in.  
   - Allowlisted email can use `/admin` and uploads (if Storage configured).  

4. **Security**  
   - CSP + headers active in production (`next.config.ts`).  
   - `SUPABASE_SERVICE_ROLE_KEY` only in server env.  

5. **Backups** — `docs/BACKUP-RECOVERY.md`

## Reference docs

| Doc | Topic |
|-----|--------|
| `docs/ADMIN-AUTH.md` | Allowlist admin model |
| `docs/DEPLOYMENT.md` | Vercel + Supabase setup |
| `docs/DATABASE.md` | Database providers |
| `docs/SUPABASE-STORAGE.md` | Image uploads |

## After launch

- Monitor Vercel logs and `/api/health`.  
- Add Sentry (or similar) via `captureException` in `src/lib/observability.ts`.  
- Consider Upstash Redis (or Vercel KV) for **distributed** rate limiting if traffic grows (current limits are per instance).
