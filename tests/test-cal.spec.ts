import { test, expect } from '@playwright/test';

test('load book page', async ({ page }) => {
  const messages: string[] = [];
  page.on('console', msg => messages.push(msg.text()));
  page.on('pageerror', err => messages.push(err.message));
  
  await page.goto('http://localhost:3000/book');
  // Wait for Cal.com iframe element to appear (we will take a pic)
  await page.waitForTimeout(5000);
  
  console.log("Console Messages:", messages);
  await page.screenshot({ path: 'cal-embed-screenshot.png', fullPage: true });
});
