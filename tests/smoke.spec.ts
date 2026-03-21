import { test, expect } from "@playwright/test";

test.describe("Sierra Strength critical flows", () => {
    test("home page loads with brand in title", async ({ page }) => {
        await page.goto("/");
        await expect(page).toHaveTitle(/Sierra Strength/i);
    });

    test("store page renders", async ({ page }) => {
        await page.goto("/store");
        await expect(page.getByRole("heading", { name: /The Store/i })).toBeVisible();
    });

    test("navigate to services", async ({ page }) => {
        await page.goto("/");
        await page
            .getByRole("navigation")
            .getByRole("link", { name: "Services" })
            .click();
        await expect(page).toHaveURL(/\/services/);
        await expect(
            page.getByRole("heading", { name: /Everything You Need to Thrive/i }),
        ).toBeVisible();
    });

    test("contact form submits and shows success", async ({ page }) => {
        await page.goto("/contact");
        await page.locator("#name").fill("Playwright User");
        await page.locator("#email").fill("playwright-test@example.com");
        await page.locator("#message").fill("Hello from Playwright smoke test.");
        await page.locator("#contact-form button[type='submit']").click();
        await expect(page.getByRole("heading", { name: "Message Sent!" })).toBeVisible({
            timeout: 15000,
        });
    });

    test("booking page shows consultation heading", async ({ page }) => {
        await page.goto("/");
        await page
            .getByRole("banner")
            .getByRole("link", { name: "Book Now" })
            .click();
        await expect(page).toHaveURL(/\/book/);
        await expect(
            page.getByRole("heading", { name: /Free Consultation/i }),
        ).toBeVisible();
    });
});
