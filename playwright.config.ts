import "./src/db/load-local-env";
import { defineConfig, devices } from "@playwright/test";
import {
    mergeAdminEmailsForPlaywright,
    playwrightAdminEmail,
    playwrightE2eAdminSecret,
} from "./tests/e2e-constants";

/** Set PLAYWRIGHT_USE_EXISTING_SERVER=1 when port 3001 is already served (e.g. `pnpm build && PORT=3001 pnpm start`) to avoid a second `next dev` fighting `.next/dev/lock`. */
const useExistingServer = process.env.PLAYWRIGHT_USE_EXISTING_SERVER === "1";

const authSecret =
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "playwright-local-auth-secret-32chars-min____";

function webServerEnv(): Record<string, string> {
    const env: Record<string, string> = {};
    for (const [key, value] of Object.entries(process.env)) {
        if (value !== undefined) env[key] = value;
    }
    env.AUTH_SECRET = authSecret;
    env.NEXTAUTH_SECRET = authSecret;
    env.NEXTAUTH_URL = "http://localhost:3001";
    env.AUTH_URL = "http://localhost:3001";
    env.ADMIN_EMAILS = mergeAdminEmailsForPlaywright();
    env.E2E_ADMIN_CREDENTIALS_SECRET = playwrightE2eAdminSecret();
    env.PLAYWRIGHT_ADMIN_EMAIL = playwrightAdminEmail();
    // Playwright-launched server only; allows E2E credentials under `next start` if we switch webServer mode.
    env.ALLOW_E2E_CREDENTIALS_ADMIN = "true";
    return env;
}

export default defineConfig({
    globalSetup: require.resolve("./tests/playwright-global-setup.ts"),
    globalTeardown: require.resolve("./tests/playwright-global-teardown.ts"),
    testDir: "./tests",
    testMatch: "**/*.spec.ts",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: "html",
    use: {
        baseURL: "http://localhost:3001",
        trace: "on-first-retry",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
        {
            name: "webkit",
            use: { ...devices["Desktop Safari"] },
        },
    ],
    webServer: useExistingServer
        ? undefined
        : {
              // `next start` avoids `.next/dev/lock` when another `next dev` (Turbopack) is already running.
              // Sources `.playwright/e2e-runtime.env` written by globalSetup (DATABASE_URL).
              command: "bash scripts/playwright-e2e-serve.sh",
              url: "http://localhost:3001",
              reuseExistingServer: !process.env.CI,
              timeout: 180_000,
              env: webServerEnv(),
          },
});
