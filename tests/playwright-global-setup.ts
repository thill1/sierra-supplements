import { bootstrapPlaywrightE2eDatabase } from "./playwright-e2e-db-bootstrap";

/**
 * Runs after the webServer is up (Playwright order). DB for `next start` is prepared in
 * `scripts/playwright-e2e-serve.cjs` first; this repeats bootstrap idempotently for
 * `PLAYWRIGHT_USE_EXISTING_SERVER=1` (no webServer) and keeps env file current.
 */
export default async function globalSetup() {
    await bootstrapPlaywrightE2eDatabase();
}
