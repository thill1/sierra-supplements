import { test, expect } from "@playwright/test";

test.describe("Sierra Supplements Critical Flows", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("http://localhost:3001");
    });

    test("should load home page with correct title", async ({ page }) => {
        await expect(page).toHaveTitle(/Sierra Supplements/);
    });

    test("should allow navigating to services", async ({ page }) => {
        await page.click('nav >> text="Services"');
        await expect(page).toHaveURL(/.*services/);
        await expect(page.locator("h1")).toContainText(/Everything You Need to Thrive/);
    });

    test("should submit contact form successfully", async ({ page }) => {
        await page.goto("http://localhost:3001/contact");
        await page.fill('#contact-form input[placeholder="Your name"]', "Test User");
        await page.fill('#contact-form input[placeholder="you@example.com"]', "test@example.com");
        await page.fill('#contact-form textarea[placeholder="How can we help you?"]', "Hello from Playwright!");
        await page.click('#contact-form button[type="submit"]');

        // Expect success message
        await expect(page.locator("text=Message Sent!")).toBeVisible();
    });

    test("should open booking page and show cal.com placeholder", async ({ page }) => {
        await page.click('nav >> text="Book Now"');
        await expect(page).toHaveURL(/.*book/);
        await expect(page.locator("text=Calendar Booking")).toBeVisible();
    });

    test("should show exit intent modal when mouse leaves viewport", async ({ page }) => {
        // Move mouse to center then leave
        await page.mouse.move(500, 500);
        await page.mouse.move(500, -10);

        await expect(page.locator('text="Wait — Before You Go"')).toBeVisible();
    });
});
