# Sierra Strength Supplements

Marketing site, supplement store (order intake + optional **Stripe Checkout**), and an **admin control center**. Stack: **Next.js 16 (App Router)**, **TypeScript**, **Postgres + Drizzle**, **Auth.js**, **Resend**, **Vercel Blob** for product images (HEIC → JPEG pipeline), optional **Stripe**.

## Requirements

- **Node.js 20+** (see `package.json` `engines`)
- **pnpm**

## Quick start

```bash
pnpm install
cp .env.example .env
# Edit .env — at minimum DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, ADMIN_EMAILS
pnpm db:push
pnpm db:seed-admins   # upsert admin_users from ADMIN_EMAILS (required for DB-backed admin)
pnpm db:seed          # optional demo products
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Validate environment (recommended after editing `.env`):

```bash
pnpm setup:check
```

## Environment variables

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Postgres (Supabase pooler **6543** on Vercel). See `docs/DATABASE.md`. |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Public origin, e.g. `http://localhost:3000` or `https://your-domain.vercel.app` |
| `ADMIN_EMAILS` | **Comma-separated** emails — used to **bootstrap** `admin_users` (`pnpm db:seed-admins`) and as a temporary allowlist only while `admin_users` is empty. Required on Vercel. |
| `PAYMENT_PROVIDER` | Optional. Defaults to `stripe`. Set to `signapay` only after the official SignaPay checkout/token flow is configured. |
| `BLOB_READ_WRITE_TOKEN` | **Vercel Blob** read-write token (server only) for admin image uploads. |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Optional — **Stripe Checkout** and `/api/webhooks/stripe` for paid orders + inventory decrement. |
| `SIGNAPAY_CLIENT_ID` / `SIGNAPAY_API_KEY` / `SIGNAPAY_REDIRECT_URI` | Placeholder SignaPay provider config. The provider slot exists, but the live checkout launch step still needs official merchant docs or sandbox credentials. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Shared rate limiting backend for public/admin APIs. Required by production env checks. |
| `RESEND_API_KEY` | Contact + order notification email |
| `ADMIN_EMAIL` | Inbound address for lead/order notifications |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional Google sign-in |
| `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Optional legacy path; prefer **Vercel Blob** for new installs (`docs/SUPABASE-STORAGE.md`). |
| `ALLOW_HARDCODED_CATALOG` | Set `true` only if you intentionally want static catalog fallback in production (not recommended). |
| `DISABLE_HARDCODED_CATALOG` | Local: `true` to test DB-only catalog behavior. |
| `SENTRY_DSN` | Server/edge error reporting (optional). |
| `NEXT_PUBLIC_SENTRY_DSN` | Same DSN for browser + `/monitoring` tunnel (optional). |
| `AUTH_DEBUG_LOGS` | Optional. Set `true` only when you intentionally need verbose auth callback logs in production. |

Full template: `.env.example`. AuthZ details: **`docs/ADMIN-AUTH.md`**. Operator tips: **`docs/ADMIN-OPERATIONS.md`**.

### Admin control center (summary)

- **Access**: `admin_users` table + roles (`owner` / `manager` / `editor`). Run `pnpm db:seed-admins` after `db:push` so sign-in works once the table exists.
- **Media**: `/api/admin/upload` — validates type/size, converts HEIC, processes with **sharp** (orientation + no EXIF), uploads main + thumb to **Vercel Blob**.
- **Inventory**: all stock changes go through **transactions** (`inventory_movements` + `audit_logs`); storefront catalog requires **active** status, **published**, and **`stockQuantity > 0`**.
- **Stripe**: `POST /api/checkout/session` starts Checkout; `POST /api/webhooks/stripe` fulfills `checkout.session.completed` (order + `order_items` + stock decrement). Card data never touches your database.
- **Migrations**: prefer `pnpm db:push`; optional SQL reference: `docs/migrations/admin-control-center-upgrade.sql`.

### Sentry

The app includes `@sentry/nextjs`. Set **`SENTRY_DSN`** and **`NEXT_PUBLIC_SENTRY_DSN`** (same value) in Vercel to enable reporting. Without them, the SDK stays disabled. Optional: **`SENTRY_AUTH_TOKEN`**, **`SENTRY_ORG`**, **`SENTRY_PROJECT`** for release/source map upload on CI.

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` / `pnpm start` | Production build and run |
| `pnpm db:push` | Apply Drizzle schema to Postgres |
| `pnpm db:seed` | Seed products |
| `pnpm db:seed-admins` | Upsert `admin_users` from `ADMIN_EMAILS` |
| `pnpm setup:check` | Env sanity check |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright tests |

## Testing

```bash
pnpm test        # Vitest — schemas, image magic bytes, Stripe signature helper, roles
pnpm test:e2e    # Playwright — homepage, store, contact, API hardening
```

Playwright uses the dev server on port **3001** (see `playwright.config.ts`).

## Deployment (Vercel)

See **`docs/DEPLOYMENT.md`** for Supabase connection strings, Vercel env vars, and verification. **`docs/LAUNCH-TODO.md`** is the launch checklist.

**Production hardening (summary):**

- Admin uses **`admin_users`** (seeded from `ADMIN_EMAILS`); APIs re-check on every mutation.
- Public and admin APIs use shared Redis-backed rate limits in production, with an in-memory fallback for local development.
- Production rate limiting uses Upstash Redis for shared limits across instances.
- Production catalog uses the database unless `ALLOW_HARDCODED_CATALOG=true`.
- Content-Security-Policy and security headers apply in production builds.
- Stripe mock mode is disabled by runtime checks on production deployments.
- Checkout now runs through a provider-neutral payment service with Stripe as the active working adapter.
- `GET /api/health` for uptime / DB connectivity checks.

## Customization

Site copy and structure: `src/lib/site-config.ts`. Visual tokens: `src/app/globals.css`.
