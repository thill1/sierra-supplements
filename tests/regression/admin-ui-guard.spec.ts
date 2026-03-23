/**
 * Regression — functional area: admin-auth (middleware + UI entry)
 * Unauthenticated users must not reach admin app routes.
 */
import { test, expect } from "@playwright/test";

test.describe("Regression: admin UI — unauthenticated guard", () => {
    test("redirects /admin/settings to sign-in with callbackUrl", async ({
        page,
    }) => {
        await page.goto("/admin/settings");
        await expect(page).toHaveURL(/\/auth\/signin/);
        const url = new URL(page.url());
        expect(url.searchParams.get("callbackUrl")).toMatch(/\/admin/);
    });

    test("returns 401 for GET /api/admin/settings without session", async ({
        request,
    }) => {
        const res = await request.get("/api/admin/settings");
        expect(res.status()).toBe(401);
    });
});
