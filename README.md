# Sierra Strength Supplements

Marketing site, supplement store (order intake — not payment capture), and admin portal. Stack: **Next.js 16 (App Router)**, **TypeScript**, **Postgres + Drizzle**, **Auth.js**, **Resend**, optional **Supabase Storage** for admin image uploads.

## Requirements

- **Node.js 20+** (see `package.json` `engines`)
- **pnpm**

## Quick start

```bash
pnpm install
cp .env.example .env
# Edit .env — at minimum DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, ADMIN_EMAILS
pnpm db:push
pnpm db:seed
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
| `ADMIN_EMAILS` | **Comma-separated** emails that may sign in and use `/admin` and `/api/admin/*`. Required on Vercel. |
| `RESEND_API_KEY` | Contact + order notification email |
| `ADMIN_EMAIL` | Inbound address for lead/order notifications |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional Google sign-in |
| `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Optional; admin product image uploads (`docs/SUPABASE-STORAGE.md`) |
| `ALLOW_HARDCODED_CATALOG` | Set `true` only if you intentionally want static catalog fallback in production (not recommended). |
| `DISABLE_HARDCODED_CATALOG` | Local: `true` to test DB-only catalog behavior. |

Full template: `.env.example`. Admin model: **`docs/ADMIN-AUTH.md`**.

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` / `pnpm start` | Production build and run |
| `pnpm db:push` | Apply Drizzle schema to Postgres |
| `pnpm db:seed` | Seed products |
| `pnpm setup:check` | Env sanity check |
| `pnpm test:e2e` | Playwright tests |

## Testing

```bash
pnpm test:e2e
```

Uses the dev server on port **3001** (see `playwright.config.ts`). Tests cover homepage, store, contact form, public API validation, and unauthenticated admin API rejection.

## Deployment (Vercel)

See **`docs/DEPLOYMENT.md`** for Supabase connection strings, Vercel env vars, and verification. **`docs/LAUNCH-TODO.md`** is the launch checklist.

**Production hardening (summary):**

- Admin is allowlist-based (`ADMIN_EMAILS`); sign-in and APIs enforce it.
- Public POST endpoints use stricter in-memory rate limits (approximate on serverless).
- Production catalog uses the database unless `ALLOW_HARDCODED_CATALOG=true`.
- Content-Security-Policy and security headers apply in production builds.
- `GET /api/health` for uptime / DB connectivity checks.

## Customization

Site copy and structure: `src/lib/site-config.ts`. Visual tokens: `src/app/globals.css`.
