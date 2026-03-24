# Admin authentication and authorization

## Model

- **Authentication**: Auth.js (NextAuth v5) with Resend magic links and/or Google OAuth (`src/lib/auth.ts`).
- **Authorization (two layers)**:
  - **Login + middleware**: Same rules as **`resolveAdmin()`** — active **`admin_users`** row, or while the table is **empty**, emails on **`ADMIN_EMAILS`** (bootstrap). JWT/session carry `isAdmin`, `adminRole`, and `adminDbId` (null during bootstrap before a row exists).
  - **Mutations + sensitive APIs**: **`requireAdmin()`** in `src/lib/require-admin.ts` (delegates to `requireAdminDb()` / `resolveAdmin()` in `src/lib/admin-auth.ts`). Keep env allowlist aligned with real admins for seeding and bootstrap.

Roles (highest to lowest): **owner**, **manager**, **editor**.

- **Editors** cannot change pricing, inventory counts, publish flags, product status, or Stripe price IDs through the API (fields are stripped server-side).
- **Managers** (and owners) can create products, archive, inventory mutations, and order status updates.

## Enforcement layers

1. **`signIn` callback** — allows login when `resolveAdmin()` succeeds (DB row or empty `admin_users` + allowlist / dev rules). Uses a dynamic import of `admin-auth` so this module stays free of a top-level DB graph.
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
