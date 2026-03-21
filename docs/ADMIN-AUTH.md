# Admin authentication and authorization

## Model

- **Authentication**: Auth.js (NextAuth v5) with Resend magic links and/or Google OAuth (`src/lib/auth.ts`).
- **Authorization (two layers)**:
  - **Login + middleware**: **`ADMIN_EMAILS`** only (Edge-safe; see `src/lib/auth.ts` and `middleware.ts`).
  - **Mutations + sensitive APIs**: **`admin_users`** via `requireAdmin()` in `src/lib/require-admin.ts` (`resolveAdmin()` in `src/lib/admin-auth.ts`), with a **bootstrap fallback** while `admin_users` is empty. Keep env allowlist aligned with real admins.

Roles (highest to lowest): **owner**, **manager**, **editor**.

- **Editors** cannot change pricing, inventory counts, publish flags, product status, or Stripe price IDs through the API (fields are stripped server-side).
- **Managers** (and owners) can create products, archive, inventory mutations, and order status updates.

## Enforcement layers

1. **`signIn` callback** — allows login when the email is on **`ADMIN_EMAILS`** (or dev bootstrap rules in `admin-allowlist.ts`).
2. **Middleware** (`middleware.ts`) — `/admin/*` and `/api/admin/*` require a session with `user.isAdmin === true` derived from **`ADMIN_EMAILS`** (Edge-safe; no Postgres in the middleware bundle).
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
