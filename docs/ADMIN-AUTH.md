# Admin authentication and authorization

## Model

- **Authentication**: Auth.js (NextAuth v5) with Resend magic links and/or Google OAuth, configured in `src/lib/auth.ts`.
- **Authorization**: Email **allowlist** via the `ADMIN_EMAILS` environment variable (comma-separated, case-insensitive).

Only addresses in `ADMIN_EMAILS` may complete sign-in. The `signIn` callback rejects everyone else, so non-admin users never receive a valid session.

## Enforcement layers

1. **`signIn` callback** — blocks login for emails not on the allowlist (production and preview on Vercel always use a non-empty list).
2. **Middleware** (`middleware.ts`) — `/admin/*` and `/api/admin/*` require a session with `user.isAdmin === true` (derived from the same allowlist in the JWT/session callbacks).
3. **Route handlers** — each `/api/admin/*` handler calls `requireAdmin()`, which re-checks the session and allowlist before performing work.

## Environment

| Variable        | Required on Vercel | Purpose                                      |
|-----------------|--------------------|----------------------------------------------|
| `ADMIN_EMAILS`  | Yes                | Comma-separated admin emails                 |
| `NEXTAUTH_SECRET` | Yes              | Session encryption                           |
| `NEXTAUTH_URL`  | Yes                | Canonical site URL for Auth.js               |
| `DATABASE_URL`  | Yes                | Postgres (store, leads, orders, admin data)  |

Startup validation: on Vercel (`VERCEL=1`) with `NODE_ENV=production`, `src/instrumentation.ts` runs `assertProductionEnv()` so missing critical variables fail deployment early.

## Local development

- If `ADMIN_EMAILS` is **unset or empty**, any successful sign-in is treated as admin (convenience only). Set `ADMIN_EMAILS` locally to mirror production behavior.
- To run the same env checks as production: `FORCE_PRODUCTION_ENV_CHECK=true pnpm start`

## Uploads

`/api/admin/upload` uses `requireAdmin()` and Supabase service role credentials **only on the server** (`SUPABASE_SERVICE_ROLE_KEY`). Never expose the service role to the client.
