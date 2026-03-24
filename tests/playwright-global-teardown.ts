import { existsSync, unlinkSync } from "node:fs";
import path from "node:path";

/**
 * Do not stop Docker here: Playwright may still be serving `next start` while teardown runs.
 * Stop containers with: `docker compose -f docker-compose.e2e.yml down -v`
 */
export default async function globalTeardown() {
    const root = path.resolve(__dirname, "..");
    const marker = path.join(root, ".playwright", "e2e-docker-started");
    const runtimeEnv = path.join(root, ".playwright", "e2e-runtime.env");

    if (existsSync(marker)) {
        try {
            unlinkSync(marker);
        } catch {
            /* best-effort */
        }
    }

    if (existsSync(runtimeEnv)) {
        try {
            unlinkSync(runtimeEnv);
        } catch {
            /* best-effort */
        }
    }
}
