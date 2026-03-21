# Supabase Storage – Product Images

Admin uploads (`/api/admin/upload`) store files in a **public** Supabase Storage bucket.

## 1. Create the bucket

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Storage**.
2. **New bucket**
   - Name: `store-images` (or set `SUPABASE_STORAGE_BUCKET` to match).
   - **Public bucket**: enable (so product images load without signed URLs).
3. Save.

## 2. Policies (public read, service role upload)

If uploads fail with permission errors:

- The app uses the **service role** key server-side, which bypasses RLS for Storage when policies allow service role access.
- Default: service role can upload; ensure the bucket exists and is public for reads.

Optional SQL (if you use RLS on the bucket):

```sql
-- Allow public read
CREATE POLICY "Public read store images"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-images');

-- Authenticated admins: if you switch to anon + user JWT later, add INSERT policies here.
```

## 3. Environment variables

Add to `.env` and Vercel:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL (Settings → API) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** – server only, never commit or expose to the client |
| `SUPABASE_STORAGE_BUCKET` | Optional; default `store-images` |

`DATABASE_URL` can stay as your existing Postgres connection string; it may be the same Supabase project.

## 4. Verify

1. Sign in to `/admin`, open **Products** → edit a product.
2. Use **Upload image** and save.
3. The image URL should point to `https://<project>.supabase.co/storage/v1/object/public/store-images/...`

## 5. HEIC

iPhone HEIC files are converted to JPEG on the server before upload. If conversion fails, export as JPG from Photos and upload again.
