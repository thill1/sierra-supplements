# Sierra Supplements – Vercel + Supabase Setup

## 1. Supabase Database

### Create project (if needed)
1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose org, name, region, set a DB password (save it)

### Get connection string
1. Supabase Dashboard → **Project Settings** (gear) → **Database**
2. Under **Connection string**, select **URI**
3. Choose **Transaction** (connection pooler) – required for Vercel serverless
4. Copy the URI – it uses port **6543**
5. Replace `[YOUR-PASSWORD]` with your actual DB password

Example format:
```
postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### Run migrations & seed
```bash
# Set DATABASE_URL in .env, then:
pnpm db:push
pnpm db:seed
```

---

## 2. Vercel Environment Variables

### Option A: Vercel Dashboard (recommended)
1. [vercel.com](https://vercel.com) → your project → **Settings** → **Environment Variables**
2. Add:

| Name | Value | Environments |
|------|-------|--------------|
| `DATABASE_URL` | (Supabase pooler URI from step 1) | Production, Preview |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` output | Production, Preview |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` | Production |

3. **Redeploy** after adding vars (Deployments → ⋮ → Redeploy)

### Option B: Vercel CLI
```bash
vercel login
vercel link   # if not linked

# Add each var (will prompt for value)
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add NEXT_PUBLIC_APP_URL production

# Redeploy
vercel --prod
```

---

## 3. One-time database sync

After deployment, ensure production DB has schema and seed data:

```bash
# Temporarily use production DATABASE_URL
DATABASE_URL="postgresql://..." pnpm db:push
DATABASE_URL="postgresql://..." pnpm db:seed
```

Or from Supabase: **SQL Editor** → run migrations manually if you have SQL files.

---

## 4. Verify

- Store: `https://your-domain.vercel.app/store`
- Admin: `https://your-domain.vercel.app/admin`
- If 500: check Vercel **Functions** → logs for the real error
