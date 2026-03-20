# Image Upload Workflow – HEIC to Supabase Storage

## The Problem

- **HEIC** (iPhone format) is not supported in most browsers (Chrome, Firefox, Safari has limited support).
- Images need to be **converted to JPG or WebP** for web use.
- Goal: **Admin upload** → convert if HEIC → save to Supabase Storage → use URLs on site.

---

## Phase 1: Get Current HEIC Photos on the Site (Today)

### Option A: Quick convert on Mac (no code)

1. Select HEIC files in Finder.
2. **Right-click** → **Quick Actions** → **Convert Image** (if available), or open in Preview.
3. **File → Export** → Choose JPG, quality 80–90%.
4. Upload to Supabase Storage manually (Dashboard → Storage → create bucket → Upload), or drop into `public/images/store/` for now.

### Option B: Batch convert via script

```bash
# Install heic-convert (one-time)
pnpm add -D heic-convert

# Create a script: scripts/convert-heic.ts
```

```typescript
// scripts/convert-heic.ts
import fs from "fs/promises";
import path from "path";
import convert from "heic-convert";

const inputDir = "public/images/Supplement Photos";
const outputDir = "public/images/store";

async function main() {
  const files = await fs.readdir(inputDir);
  const heicFiles = files.filter((f) => f.toLowerCase().endsWith(".heic"));

  for (const file of heicFiles) {
    const inputPath = path.join(inputDir, file);
    const baseName = path.basename(file, path.extname(file)) + ".jpg";
    const outputPath = path.join(outputDir, baseName);

    const inputBuffer = await fs.readFile(inputPath);
    const outputBuffer = await convert({
      buffer: inputBuffer,
      format: "JPEG",
      quality: 0.9,
    });
    await fs.writeFile(outputPath, outputBuffer as Buffer);
    console.log(`Converted ${file} → ${baseName}`);
  }
}

main().catch(console.error);
```

Run: `npx tsx scripts/convert-heic.ts`

---

## Phase 2: Admin Upload to Supabase Storage (Build This)

### Architecture

```
Admin page (/admin/media or /admin/products → upload) 
  → User selects HEIC/JPG/PNG
  → POST /api/admin/upload
  → Server: convert HEIC → JPG if needed
  → Upload to Supabase Storage bucket "images"
  → Return public URL
  → Admin can paste URL into product form, or we auto-link
```

### What You Need

| Item | Where to Get |
|------|--------------|
| **Supabase URL** | Supabase Dashboard → Project Settings → API → Project URL |
| **Supabase Service Role Key** | Same page → `service_role` key (secret – server only) |
| **Storage bucket** | Dashboard → Storage → New bucket, e.g. `images`, set to **Public** if images should be served directly |

### Env vars

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Server-side only, never expose to client
```

### Implementation Outline

1. **Install:** `@supabase/supabase-js`, `heic-convert`
2. **Create bucket** in Supabase: `images` (public)
3. **API route:** `POST /api/admin/upload`
   - Check auth via `requireAuth()`
   - Accept `multipart/form-data` (file)
   - If HEIC: convert to JPG with heic-convert
   - Upload to `images/{timestamp}-{slug}.jpg`
   - Return `{ url: "https://xxx.supabase.co/storage/v1/object/public/images/..." }`
4. **Admin UI:** File input + dropzone, call API, show preview + copy URL
5. **Product form:** Add image URL field (or picker that uses upload API)

### RLS / Policies

- Use **service_role** key server-side → bypasses RLS. No client-side Supabase needed for uploads.
- Or: use anon key + RLS policy allowing authenticated users to insert. Service role is simpler for admin-only.

---

## Phase 3: Product Image Field

Products already have an `image` column (text). After upload:

- Admin uploads image → gets URL
- Admin edits product → pastes URL (or we add an "Upload & use" button in the product form)
- Product page renders `<img src={product.image} />`

---

## Summary

| Phase | What | Effort |
|-------|------|--------|
| 1 | Convert HEIC → JPG now (manual or script), use in `public/` or upload to Supabase manually | 15–30 min |
| 2 | Build admin upload API + UI, Supabase Storage | 2–3 hours |
| 3 | Wire product form to use uploaded images | 30 min |

**Recommended order:** Do Phase 1 now to get photos live. Build Phase 2 for ongoing uploads, then Phase 3 to connect products.
