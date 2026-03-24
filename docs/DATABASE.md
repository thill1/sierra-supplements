# Database Setup

This project uses **PostgreSQL** with Drizzle ORM. It works with any Postgres provider.

## Supported Providers

| Provider | Best for | Connection |
|----------|----------|------------|
| **Supabase** | Full-stack, auth, storage | Transaction pooler (port 6543) |
| **Neon** | Serverless, Vercel | Connection string from dashboard |
| **Vercel Postgres** | Vercel projects | Auto-injects `POSTGRES_URL` |
| **Local Postgres** | Development | `postgresql://localhost:5432` |

## Environment Variables

| Variable | Used by | Notes |
|----------|---------|------|
| `DATABASE_URL` | App + Drizzle | Primary. Use for Supabase, Neon, local. |
| `POSTGRES_URL` | App + Drizzle | Vercel Postgres integration |
| `POSTGRES_URL_NON_POOLING` | App | Fallback |

## Supabase

Production project notes (ref, URL, RLS, Storage): **`docs/SUPABASE-PRODUCTION.md`**.

1. Create a project at [supabase.com](https://supabase.com)
2. **Project Settings → Database → Connection string**
3. Choose **URI** (Transaction mode, port 6543) for serverless
4. Copy and set `DATABASE_URL` in `.env` and Vercel
5. Replace `[YOUR-PASSWORD]` with your database password

```
DATABASE_URL="postgresql://postgres.[ref]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

The pooler hostname uses an `aws-0-` or `aws-1-` prefix depending on your project (copy the exact **Session** or **Transaction** URI from **Supabase → Connect**; a wrong host returns `Tenant or user not found`).

On some hosts (for example Vercel → Supabase pooler), Node may reject the pooler TLS chain unless you set `DATABASE_SSL_REJECT_UNAUTHORIZED=false` (see `src/db/index.ts` and `docs/DEPLOYMENT.md` — use only if you understand the tradeoff).

## Neon

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string from the dashboard
3. Set `DATABASE_URL` in `.env` and Vercel

Neon uses a connection pooler by default; no extra config needed.

## Sync Schema & Seed

```bash
# Push schema to database
pnpm db:push

# Seed products and testimonials
pnpm db:seed
```

## Troubleshooting

- **ENOTFOUND / connection refused**: Check URL, ensure project is active (Supabase free tier can pause)
- **SSL errors**: Use `?sslmode=require` or ensure the provider supports SSL
- **Vercel serverless**: Use pooler URLs (Supabase port 6543, Neon pooler) — direct connections can exhaust limits
