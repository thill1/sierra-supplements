import { execSync } from "node:child_process";
import path from "node:path";
import "../src/db/load-local-env";
import { mergeAdminEmailsForPlaywright } from "./e2e-constants";

/**
 * Upsert admin_users for every email in ADMIN_EMAILS (merged with Playwright test admin).
 * Skips when DATABASE_URL is unset (authenticated admin e2e will be skipped).
 */
export default async function globalSetup() {
    const dbUrl = process.env.DATABASE_URL?.trim();
    if (!dbUrl) {
        console.warn(
            "[playwright globalSetup] DATABASE_URL unset — skipping pnpm db:seed-admins; set DATABASE_URL to run authenticated admin e2e.",
        );
        return;
    }

    const root = path.resolve(__dirname, "..");
    const adminEmails = mergeAdminEmailsForPlaywright();

    execSync("pnpm exec tsx src/db/seed-admins.ts", {
        cwd: root,
        stdio: "inherit",
        env: { ...process.env, ADMIN_EMAILS: adminEmails },
    });
}
