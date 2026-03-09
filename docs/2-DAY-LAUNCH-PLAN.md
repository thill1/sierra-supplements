# Sierra Supplements – 2-Day Launch Plan

## Goal
Production-ready site in 48 hours. Close all gaps, hot-load the current UI.

---

## Day 1: Foundation & Store

### Morning – Images & Assets
| Task | Action |
|------|--------|
| 1. Product images | Create `public/images/store/`. Use placeholder images (Unsplash, placeholder.com, or SVG placeholders) for: `protein.jpg`, `preworkout.jpg`, `stim-free.jpg`, `electrolytes.jpg`, `creatine-mono.jpg`, `fish-oil.jpg`. Products reference these paths. |
| 2. OG image | Add `public/og-image.jpg` (or reuse one asset) for social sharing. |
| 3. Favicon / logo | Ensure `public/logo.svg` exists or add a simple favicon. |

### Midday – Database & Store Data
| Task | Action |
|------|--------|
| 4. DATABASE_URL | Add Supabase pooler URI to Vercel env vars. |
| 5. DB sync | Run `pnpm db:push` and `pnpm db:seed` with production DATABASE_URL. |
| 6. Switch store to DB | Revert StoreGrid and `store/[slug]` to use `db` instead of `getHardcodedProducts`. Keep `products-data.ts` as fallback only. |

### Afternoon – Checkout Placeholder & Legal
| Task | Action |
|------|--------|
| 7. Checkout page | Add `/store/checkout` page: collect email + shipping, show “We’ll reach out to confirm your order” (no Stripe yet). Optionally POST to an API that emails you or writes to leads. |
| 8. Legal pages | Add `/privacy` and `/terms` (basic templates). Add `/shipping` with shipping & returns policy. Link from footer. |

### EOD Day 1
- Store browsable with real images
- DB-driven products (or fallback if env not ready)
- Checkout captures intent
- Legal pages live

---

## Day 2: Checkout, Domain & Polish

### Morning – Stripe (or Order Capture)
| Task | Action |
|------|--------|
| 9. Stripe setup | Create Stripe account, products, Checkout Session API. Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to Vercel. |
| 10. Checkout flow | Replace placeholder checkout with Stripe Checkout. Cart → redirect to Stripe → success/cancel pages. |
| 11. Webhook | Add `/api/webhooks/stripe` to handle `checkout.session.completed`. Store order in DB or send email. |

**Alternative (if Stripe is too much in 2 days):** Keep order-capture form; email order to admin; manually process. Ship Stripe in week 2.

### Midday – Domain & Config
| Task | Action |
|------|--------|
| 12. Domain | Connect `sierrastrengthsupplements.com` in Vercel. Update `siteConfig.url` and `NEXTAUTH_URL` to production domain. |
| 13. Env audit | Verify all Vercel env vars: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, RESEND_API_KEY, STRIPE_*, NEXT_PUBLIC_APP_URL. |

### Afternoon – Hot Load & QA
| Task | Action |
|------|--------|
| 14. Hot load | Dev uses Turbopack (`next dev --turbo`). Ensure `next dev` in package.json uses turbo for fast HMR. |
| 15. Smoke test | Run Playwright smoke tests. Manually test: store browse, add to cart, checkout, contact form, booking. |
| 16. Error handling | Ensure store error boundary and 404/500 handling are solid. |

### EOD Day 2
- Stripe checkout (or order-capture form) live
- Domain pointed
- Smoke tests passing
- Ready for soft launch

---

## Task Checklist (Quick Reference)

- [ ] Product images in `public/images/store/`
- [ ] OG image, favicon/logo
- [ ] DATABASE_URL in Vercel
- [ ] `pnpm db:push` and `pnpm db:seed`
- [ ] Store using DB (with hardcoded fallback)
- [ ] Checkout page (Stripe or order-capture)
- [ ] Privacy, Terms, Shipping pages
- [ ] Domain + siteConfig updates
- [ ] Env vars verified
- [ ] Hot reload (`next dev --turbo`)
- [ ] Smoke tests passing

---

## Scope Decisions

| Decision | Recommendation for 2 days |
|----------|---------------------------|
| Stripe vs form | Stripe if you have an account and API keys ready; otherwise order-capture form. |
| Product images | Placeholders or one generic image per category to avoid 404s. |
| Inventory | No real-time inventory; assume in-stock for launch. |
| Order confirmation email | Resend template; send on checkout completion. |
