# Before Launch Checklist

## ⚠️ Database setup required

The store currently uses **hardcoded products** so it works on Vercel without `DATABASE_URL`. Before launch you must:

1. **Add `DATABASE_URL` to Vercel**
   - Supabase → Project Settings → Database → Connection string (URI) → **Transaction** (port 6543)
   - Copy the URI, replace `[YOUR-PASSWORD]` with your DB password
   - Vercel → Project → Settings → Environment Variables → add `DATABASE_URL`

2. **Sync the database**
   ```bash
   DATABASE_URL="your-pooler-uri" pnpm db:push
   DATABASE_URL="your-pooler-uri" pnpm db:seed
   ```

3. **Switch store back to database**
   - Update `src/components/store/store-grid.tsx` to fetch from `db` instead of `getHardcodedProducts`
   - Update `src/app/store/[slug]/page.tsx` to fetch from `db` instead of `getHardcodedProductBySlug`
   - Remove or archive `src/lib/products-data.ts` (or keep as fallback)

4. **Redeploy** on Vercel after env vars and code changes.
