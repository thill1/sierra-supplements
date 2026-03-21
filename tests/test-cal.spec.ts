import { test } from "@playwright/test";

/** Manual / visual check for Cal embed; uses the same baseURL as other tests. */
test("load book page", async ({ page }) => {
    const messages: string[] = [];
    page.on("console", (msg) => messages.push(msg.text()));
    page.on("pageerror", (err) => messages.push(err.message));

    await page.goto("/book");
    await page.waitForTimeout(5000);

    console.log("Console Messages:", messages);
    await page.screenshot({ path: "cal-embed-screenshot.png", fullPage: true });
});
