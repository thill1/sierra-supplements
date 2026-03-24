/**
 * Full browser flow: E2E credentials → session JWT → /admin dashboard.
 * Requires DATABASE_URL (globalSetup runs db:seed-admins with merged ADMIN_EMAILS).
 */
import { expect, test } from "@playwright/test";
import {
    playwrightAdminEmail,
    playwrightE2eAdminSecret,
} from "./e2e-constants";

test.describe("Admin authenticated E2E", () => {
    test("credentials sign-in opens admin dashboard", async ({ page }) => {
        test.skip(
            !process.env.DATABASE_URL?.trim(),
            "DATABASE_URL must be set; globalSetup runs pnpm db:seed-admins for the Playwright admin email.",
        );

        await page.goto("/auth/signin");
        await expect(page.getByTestId("e2e-admin-signin-section")).toBeVisible();
        await page.getByTestId("e2e-admin-email").fill(playwrightAdminEmail());
        await page.getByTestId("e2e-admin-secret").fill(playwrightE2eAdminSecret());
        await page.getByTestId("e2e-admin-submit").click();

        await expect(page).toHaveURL(/\/admin/, { timeout: 30_000 });
        await expect(
            page.getByRole("heading", { name: "Control center" }),
        ).toBeVisible({ timeout: 20_000 });
        await expect(
            page.getByRole("link", { name: "Admin Portal" }),
        ).toBeVisible();
    });
});
