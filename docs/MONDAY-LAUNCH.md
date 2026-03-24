# Sierra Supplements – Monday Launch Plan

**Goal:** Site live in production by Monday.

---

## What's Already Done ✅

- Store with products, cart, checkout
- Order capture (no Stripe; email-based flow)
- 10% auto-pay discount, free shipping threshold
- Admin: orders, leads, products, testimonials
- Auth: sign-in, admin protection
- Legal pages: Privacy, Terms, Shipping
- Error boundaries, security hardening
- Mobile UX improvements
- Database schema with multi-provider support (Supabase, Neon, Vercel Postgres)

---

## Critical Path (Must Do)

### 1. Database (required for store orders, admin, leads)

| Step | Action |
|------|--------|
| 1a | Choose provider: **Neon** (recommended) or Supabase. See `docs/DATABASE.md`. |
| 1b | Create project → get connection string |
| 1c | Add `DATABASE_URL` to Vercel (Settings → Environment Variables) |
| 1d | Run locally: `pnpm db:push` then `pnpm db:seed` |
| 1e | Redeploy on Vercel after adding env vars |

### 2. Vercel Environment Variables

Add to Vercel → Project → Settings → Environment Variables:

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Neon/Supabase pooler connection string |
| `NEXTAUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | `https://your-domain.vercel.app` (or prod domain) |
| `NEXT_PUBLIC_APP_URL` | Recommended | Same as NEXTAUTH_URL |
| `RESEND_API_KEY` | For emails | Order confirmations + contact form |
| `ADMIN_EMAIL` | Optional fallback | Used if `admin_app_settings` has no row; otherwise set **Admin → Settings → Admin notification email** |
| `CALCOM_WEBHOOK_SECRET` | For booking emails | Same secret as Cal.com webhook; endpoint `https://<domain>/api/webhooks/calcom`, trigger **Booking Created** |

### 3. Domain (if you have one)

- Vercel → Project → Settings → Domains
- Add `sierrastrengthsupplements.com` (or your domain)
- Point DNS as instructed (A/CNAME records)
- Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to the production domain

---

## Quick Polish (Recommended)

| Item | Status | Action |
|------|--------|--------|
| OG image | Missing | Add `public/og-image.jpg` (1200×630) for social sharing. Can reuse a product or hero image. |
| Logo | Optional | `public/logo.svg` used in schema; header uses Mountain icon. Add if you have a logo. |
| Contact info | Check | Verify `siteConfig` phone, email, address in `src/lib/site-config.ts` |
| Admin notification email | Check | **Admin → Settings** (leads, Cal.com, low stock). `ADMIN_EMAIL` env is fallback only |
| Cal.com webhook | Optional | `/api/webhooks/calcom` + `CALCOM_WEBHOOK_SECRET` for new-booking emails |

---

## Launch Day Checklist

- [ ] Database provider chosen and project created
- [ ] `DATABASE_URL` in Vercel
- [ ] `pnpm db:push` and `pnpm db:seed` run (with prod URL if different)
- [ ] `NEXTAUTH_SECRET` generated and in Vercel
- [ ] `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` set to production URL
- [ ] `RESEND_API_KEY` added; ops inbox set in **Admin → Settings** (or `ADMIN_EMAIL` fallback)
- [ ] `CALCOM_WEBHOOK_SECRET` + Cal.com webhook URL (if using booking emails)
- [ ] DB migration for `notify_email_*` columns (`pnpm db:migrate` or `pnpm db:push`)
- [ ] Redeploy after env vars
- [ ] Domain connected (if applicable)
- [ ] Smoke test: browse store, add to cart, checkout, contact form
- [ ] Admin: sign in at `/admin`, verify orders/leads work

---

## Post-Launch (Can Wait)

- Stripe integration (current flow: order form → email → manual fulfillment)
- OG image and logo assets (social previews will be generic without them)
- Product images from Supplement Photos (HEIC) – convert to JPG/WebP if needed for web
- Membership sign-up (pricing page says "Coming Soon")

---

## Verify Before Going Live

```bash
# Run locally with prod env to sanity-check
node scripts/check-env.js
pnpm db:push
pnpm db:seed
pnpm build
```

If `pnpm build` succeeds and env check passes, you're good to deploy.
