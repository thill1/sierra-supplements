# Sierra homepage latency upgrade

The homepage previously rendered on every request and fetched published testimonials from Postgres every time. Public HTML now uses Next.js ISR with a five-minute refresh interval. Homepage copy and testimonials use tagged data caches with the same interval.

Successful CMS saves expire the affected data tag immediately and invalidate `/`. Testimonial create, update, publish/unpublish and delete do the same after their database transaction commits. Failed or unauthorized writes do not invalidate the cache. Database read failures propagate instead of being cached as default copy; background refreshes can retain the last successful content. A first build or cold render still requires a healthy database.

Admin pages, authentication, store prices, inventory and checkout retain their existing behavior. This change does not establish that every customer page load finishes within one second; monitor HTTP response time and browser rendering separately.

## Source and branches

| Role | Branch | Starting commit |
| --- | --- | --- |
| Repository root | `main` | `fa6e09390033d7752c5c349ebf071421a3fc5370` |
| Recovered deployed source | `production/sierra-2026-05-11` | `4bfb118` |
| Homepage upgrade | `fix/sierra-homepage-latency` | Recovered deployed source |

The recovery branch contains the already-deployed payment, admin and analytics changes that were absent from `main`. The source manifest in `docs/releases/production-2026-05-11.json` records SHA-1 hashes verified against Vercel deployment `dpl_Fkmy2SnapL78aDUdtrSfymgorSki`. It covers 364 Git-managed source files and non-ignored additions. Private environment files, local databases, generated output and test artifacts are excluded. The original checkout at `/Volumes/Passport/Sierra Supplements/sierra-supplements` remains unchanged, including its local image deletions.

The upgrade adds `.vercelignore` to exclude local environment files and generated/test artifacts from future CLI uploads.

## Verification

- The existing Vitest suite passed: 30 files, 128 tests.
- Production compilation and TypeScript checks passed against isolated local Postgres. Next.js classified `/` as prerendered with a five-minute refresh interval; `/admin`, authentication and store routes remained dynamic where previously configured.
- Real `next start` HTTP tests passed for cache hits, cached direct DB changes, all testimonial mutations, homepage CMS updates, rejected writes and failed database writes. These tests use a locally signed admin session to exercise the normal middleware and route authorization; they do not test an external login provider.
- Targeted ESLint and deployment-input checks passed. No private environment files, local databases or test artifacts appeared in the deployment inputs.

Run the cache integration checks against an isolated local database named `sierra_cache_test`, after applying `src/db/schema.pg.ts` to that database:

```sh
SIERRA_CACHE_TEST_DATABASE_URL=postgresql://sierra_cache_test@127.0.0.1:55439/sierra_cache_test pnpm test:homepage-cache
```

The script refuses non-local databases and any other database name. It seeds and mutates the test database, builds the real app, starts a local production server and shuts that server down afterward. Add `SIERRA_CACHE_TEST_REVALIDATION=1` to also test a database read failure after the actual five-minute refresh interval.

Stage a production-environment build with `vercel deploy --prod --skip-domain`. Verify the deployment URL and content before `vercel promote`; keep the prior deployment available for rollback. No database migration is part of this upgrade.

## Live release, October 2

The tested deployment `dpl_3CWnZgtT4pRXGCb4GgjypqMh62iR` was promoted to `https://www.sierrastrengthsupplements.com`. Vercel identifies source commit `3942ac3ea408d8086ecc8768ebdc4c50cb30aece` on `fix/sierra-homepage-latency`, with Node 24.x. Later documentation commits on this branch are not part of that deployed artifact.

All ten local integration checks passed, including the real five-minute timed-refresh database failure. The staged health endpoint reported a working database, public store/booking/checkout pages returned 200, and an unauthorized admin content request returned 401. Staged and previous public homepage text matched before promotion.

After promotion, the initial direct-www HTTP request took 477 ms to headers (`PRERENDER`), followed by five cache hits at 55–108 ms to headers and 56–109 ms for the complete HTML response. A desktop browser check measured 242 ms to headers and 557 ms to document completion, preserving the visible text, headings and links. These samples do not establish a percentile or native iPhone performance result.

Structured verification evidence is in `docs/releases/homepage-cache-2026-10-02.json`. [Baseline PR #2](https://github.com/thill1/sierra-supplements/pull/2) and [cache PR #3](https://github.com/thill1/sierra-supplements/pull/3) remain drafts for branch reconciliation and review. The original checkout remains untouched. Roll back to `dpl_Fkmy2SnapL78aDUdtrSfymgorSki` if production checks show a regression.

## Follow-up work

1. Cache the public catalog separately, with invalidation for product, variant, inventory, restock, in-store sale and payment settlement changes. Checkout must continue to read current prices and stock.
2. Add query and connection timing to uncached storefront requests before choosing a function-region change. The historical deployment runs in `iad1`; a working connection from the deployed source backup points to a Supabase `us-west-1` pooler. Current sensitive environment values still need region confirmation.
3. Measure warm/cold production responses and real browser loads. Track the five-minute monitor history over several days before claiming the response-time target is met.
4. Use the final `www` destination for direct links where appropriate; continue checking the apex redirect separately so redirect regressions remain visible.

References: [Next.js ISR](https://nextjs.org/docs/app/guides/incremental-static-regeneration), [immediate tag expiry from route handlers](https://nextjs.org/docs/app/api-reference/functions/revalidateTag), [Vercel staged production deployments](https://vercel.com/docs/cli/deploy).
