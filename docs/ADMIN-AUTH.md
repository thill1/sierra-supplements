# Admin authentication and authorization

## Model

- **Authentication**: Auth.js (NextAuth v5) with Resend magic links and/or Google OAuth (`src/lib/auth.ts`).
- **Authorization (two layers)**:
  - **Login + middleware**: Same rules as **`resolveAdmin()`** — an **active** **`admin_users`** row for that email wins (role from DB). If there is **no** row (or only an inactive one), **`ADMIN_EMAILS`** grants **owner** so Vercel env can authorize admins without re-seeding whenever another admin row already exists. JWT/session carry `isAdmin`, `adminRole`, and `adminDbId` (null for allowlist-only until a row exists).
  - **Mutations + sensitive APIs**: **`requireAdmin()`** in `src/lib/require-admin.ts` (delegates to `requireAdminDb()` / `resolveAdmin()` in `src/lib/admin-auth.ts`). Keep **`ADMIN_EMAILS`** in sync with who may sign in; run **`pnpm db:seed-admins`** so the table matches for roles and audit FKs.

Roles (highest to lowest): **owner**, **manager**, **editor**.

- **Editors** cannot change pricing, inventory counts, publish flags, product status, or Stripe price IDs through the API (fields are stripped server-side).
- **Managers** (and owners) can create products, archive, inventory mutations, and order status updates.

## Enforcement layers

1. **`signIn` callback** — allows login when `resolveAdmin()` succeeds (active DB row, or allowlist when no active row; in dev with an empty allowlist and non-production, any authenticated user). Uses a dynamic import of `admin-auth` so this module stays free of a top-level DB graph.
2. **Middleware** (`middleware.ts`) — `/admin/*` and `/api/admin/*` require `user.isAdmin === true` on the session JWT (set when the token was issued/refreshed on the server).
3. **Route handlers** — mutations call `requireAdmin()`, which loads the admin row again (or bootstrap) and attaches `admin` with `id` (nullable during bootstrap) for audit FKs.

## Bootstrap admins

After the first schema deploy:

```bash
DATABASE_URL="postgresql://..." pnpm db:seed-admins
```

This **upserts** `owner` rows for every email in `ADMIN_EMAILS`.

## Audit and rate limits

- Product, image, inventory, and order status changes write to **`audit_logs`** where applicable.
- Admin **writes** (including uploads) use in-memory per-IP rate limits (`src/lib/admin-rate-limit.ts`); limits are best-effort on multi-instance serverless.

## Related docs

- **Operator guide**: `docs/ADMIN-OPERATIONS.md`
- **Deployment / env**: `docs/DEPLOYMENT.md`, `README.md` (Admin control center section)
