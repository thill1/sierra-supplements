const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const contextList = [
    { viewport: { width: 390, height: 844 }, name: 'mobile.png' },
    { viewport: { width: 1280, height: 800 }, name: 'desktop.png' }
  ];

  for (const { viewport, name } of contextList) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    try {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
      await page.screenshot({ path: name });
      console.log(`Saved screenshot to ${name}`);
    } catch (e) {
      console.error(`Error on ${name}:`, e);
    }
    await context.close();
  }
  await browser.close();
})();
