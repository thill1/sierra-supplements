# Before Launch Checklist

## Database (recommended for full features)

The store uses **db-first with hardcoded fallback** – it works without `DATABASE_URL`, but admin, leads, and orders need the database.

1. **Add `DATABASE_URL` to Vercel**
   - Supabase → Project Settings → Database → Connection string (URI) → **Transaction** (port 6543)
   - Copy the URI, replace `[YOUR-PASSWORD]` with your DB password
   - Vercel → Project → Settings → Environment Variables → add `DATABASE_URL`

2. **Sync the database**
   ```bash
   DATABASE_URL="your-pooler-uri" pnpm db:push
   DATABASE_URL="your-pooler-uri" pnpm db:seed
   ```

3. **Redeploy** on Vercel after env vars.

## Other env vars (Vercel)

| Variable | Purpose |
|----------|---------|
| `NEXTAUTH_SECRET` | Auth sessions |
| `NEXTAUTH_URL` | Production URL |
| `RESEND_API_KEY` | Order + contact emails |
| `ADMIN_EMAIL` | Where to send notifications |
