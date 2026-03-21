# Sierra Supplements – Vercel + Supabase

## 1. Supabase database

### Create project (if needed)

1. [supabase.com](https://supabase.com) → New Project  
2. Save the database password  

### Connection string

1. **Project Settings → Database**  
2. **Connection string → URI**  
3. Use **Transaction** (pooler), port **6543**  
4. Replace `[YOUR-PASSWORD]` in the URI  

Example:

```text
postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### Schema and seed

```bash
DATABASE_URL="postgresql://..." pnpm db:push
DATABASE_URL="postgresql://..." pnpm db:seed-admins
DATABASE_URL="postgresql://..." pnpm db:seed
```

---

## 2. Vercel environment variables

**Project → Settings → Environment Variables** (set for **Production** and **Preview** as needed):

| Name | Purpose |
|------|---------|
| `DATABASE_URL` | Supabase pooler URI (port **6543**) |
| `NEXTAUTH_SECRET` | Output of `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` (production) or preview URL |
| `NEXT_PUBLIC_APP_URL` | Same canonical URL as the site |
| `ADMIN_EMAILS` | **Required.** Used to bootstrap `admin_users` (`db:seed-admins`) and as temporary allowlist if the table is empty |
| `BLOB_READ_WRITE_TOKEN` | **Vercel Blob** (server) for admin product photos |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Optional — Stripe Checkout + webhook (`/api/webhooks/stripe`) |
| `RESEND_API_KEY` | Transactional email |
| `ADMIN_EMAIL` | Where lead/order notifications are sent |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional OAuth |
| `NEXT_PUBLIC_SUPABASE_URL` | Legacy optional — Supabase Storage uploads |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** — never expose to the browser |
| `SUPABASE_STORAGE_BUCKET` | Optional; default `store-images` |

Prefer **Vercel Blob** for new deployments. See **`docs/SUPABASE-STORAGE.md`** only if you still use Supabase Storage.

On deploy, Next.js runs **`src/instrumentation.ts`**: if `VERCEL=1` and `NODE_ENV=production`, missing `ADMIN_EMAILS`, auth secrets, or database URL **fails startup** so misconfiguration is obvious.

**Local parity:** `FORCE_PRODUCTION_ENV_CHECK=true pnpm start` runs the same assertions.

**Emergency bypass (avoid):** `SKIP_PRODUCTION_ENV_CHECK=true`

### TLS to Postgres

By default the app uses `rejectUnauthorized: true` for non-localhost connections. If your provider requires a custom CA, set `DATABASE_SSL_REJECT_UNAUTHORIZED=false` only after understanding the risk.

---

## 3. Admin access

After `db:push`, run **`pnpm db:seed-admins`** so **`admin_users`** contains your team. Sign-in is then gated by active rows in that table (with a temporary `ADMIN_EMAILS` fallback only while the table is empty).

Details: **`docs/ADMIN-AUTH.md`**, **`docs/ADMIN-OPERATIONS.md`**.

---

## 4. Post-deploy checks

- Store: `https://your-domain.vercel.app/store`  
- Health: `https://your-domain.vercel.app/api/health` (`database: true` when Postgres is reachable)  
- Admin: `https://your-domain.vercel.app/admin` (should redirect to sign-in, then allow only allowlisted users)  

If you see 500s: **Vercel → Logs** (Functions).

---

## 5. Vercel CLI (optional)

```bash
vercel login
vercel link
vercel env add DATABASE_URL production
# ... repeat for each variable
vercel --prod
```

---

## 6. Observability

- Structured JSON logs: `src/lib/observability.ts` (`logServerError`, `logAdminFailure`, `captureException`).  
- **Sentry** (optional): add **`SENTRY_DSN`** (server) and **`NEXT_PUBLIC_SENTRY_DSN`** (client — use the same DSN string) in Vercel. Events are sent via the built-in **`/monitoring`** tunnel to reduce ad-blocker interference. For source maps and releases, add **`SENTRY_AUTH_TOKEN`**, **`SENTRY_ORG`**, and **`SENTRY_PROJECT`** to CI or Vercel build env.  
- Vercel **Runtime Logs** and **Speed Insights** cover baseline monitoring.
