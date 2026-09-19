import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";

async function decodeImages(page, selector) {
  await page.locator(selector).evaluateAll(async (images) => {
    await Promise.all(
      images.map(async (image) => {
        if (!image.complete) {
          await Promise.race([
            new Promise((resolve) => {
              image.addEventListener("load", resolve, { once: true });
              image.addEventListener("error", resolve, { once: true });
            }),
            new Promise((resolve) => setTimeout(resolve, 2500)),
          ]);
        }

        if (image.complete && image.naturalWidth > 0) {
          try {
            await image.decode();
          } catch {
            // A loaded image may reject decode(); capture can still continue.
          }
        }
      }),
    );
  });
}

async function captureScene(page, selector, path) {
  const scene = page.locator(selector);
  await scene.scrollIntoViewIfNeeded();
  await decodeImages(page, `${selector} img`);
  await page.waitForTimeout(500);
  await page.screenshot({ path, fullPage: false });
}

async function warmLazyImages(page) {
  const lazyImages = page.locator('img[loading="lazy"]');
  const count = await lazyImages.count();

  for (let index = 0; index < count; index += 1) {
    const image = lazyImages.nth(index);
    await image.scrollIntoViewIfNeeded();
    await decodeImages(page, 'img[loading="lazy"]');
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(180);
}

test("capture visual preview", async ({ page }, testInfo) => {
  const isDesktop = testInfo.project.name === "chromium";
  const isMobile = testInfo.project.name === "mobile-chromium";

  test.skip(!isDesktop && !isMobile, "Representative desktop/mobile render only");

  await mkdir("visual-artifacts", { recursive: true });

  const prefix = isMobile ? "mobile" : "desktop";

  await page.goto("/");
  await decodeImages(page, '.hero img:not([loading="lazy"])');
  await expect(page.getByRole("heading", { level: 1, name: /nordic depths/i })).toBeVisible();

  await page.screenshot({
    path: `visual-artifacts/${prefix}-hero.png`,
    fullPage: false,
  });

  if (isDesktop) {
    const heroHeight = await page.locator("#forest").evaluate((hero) => hero.getBoundingClientRect().height);
    await page.evaluate((distance) => {
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, distance);
    }, heroHeight * 0.55);
    await page.waitForTimeout(180);
    await page.screenshot({
      path: "visual-artifacts/desktop-hero-parallax-mid.png",
      fullPage: false,
    });
    await page.evaluate(() => window.scrollTo(0, 0));
  }

  await page.getByRole("button", { name: "Motion Lab" }).click();
  await page.waitForTimeout(180);
  await page.screenshot({
    path: `visual-artifacts/${prefix}-motion-lab.png`,
    fullPage: false,
  });
  await page.getByRole("button", { name: "Close Motion Lab" }).click();

  await captureScene(page, "#xray", `visual-artifacts/${prefix}-xray.png`);
  await captureScene(page, "#mist", `visual-artifacts/${prefix}-depth.png`);
  await captureScene(page, '[data-scene="night"]', `visual-artifacts/${prefix}-night.png`);
  await captureScene(page, "#principles", `visual-artifacts/${prefix}-principles.png`);
  await captureScene(page, "#system", `visual-artifacts/${prefix}-system.png`);
  await captureScene(page, '[data-scene="aurora"]', `visual-artifacts/${prefix}-aurora.png`);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await decodeImages(page, '.hero img:not([loading="lazy"])');
  await warmLazyImages(page);

  await page.screenshot({
    path: `visual-artifacts/${prefix}-full-static.png`,
    fullPage: true,
  });
});
