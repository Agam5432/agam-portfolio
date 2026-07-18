const { chromium } = require("playwright");

async function crawlPage(url) {
  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: "networkidle",
    timeout: 60000,
  });

  // Page ko dheere dheere poora scroll karo
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 500;

      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (
          totalHeight >=
          document.body.scrollHeight
        ) {
          clearInterval(timer);
          resolve();
        }
      }, 300);
    });
  });

  await page.waitForTimeout(3000);

  // innerText use karo
  const text = await page.locator("body").innerText();

  await browser.close();

  return text
    ?.replace(/\s+/g, " ")
    .trim();
}

module.exports = {
  crawlPage,
};