import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
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
    webServer: {
        command: "pnpm dev --port 3001",
        url: "http://localhost:3001",
        reuseExistingServer: !process.env.CI,
        env: {
            ...process.env,
            // Auth.js requires a secret; without it JWT checks in middleware are unreliable and admin routes may not guard correctly in e2e.
            AUTH_SECRET:
                process.env.AUTH_SECRET ??
                "playwright-local-auth-secret-32chars-min____",
            NEXTAUTH_SECRET:
                process.env.NEXTAUTH_SECRET ??
                "playwright-local-auth-secret-32chars-min____",
        },
    },
});
