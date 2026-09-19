import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";

async function waitForImages(page, selector = "body", { includeLazy = false } = {}) {
  await page.locator(selector).evaluate(
    async (root, options) => {
      const images = Array.from(root.querySelectorAll("img")).filter(
        (image) => options.includeLazy || image.loading !== "lazy",
      );

      const settleImage = async (image) => {
        if (!image.complete) {
          await Promise.race([
            new Promise((resolve) => {
              image.addEventListener("load", resolve, { once: true });
              image.addEventListener("error", resolve, { once: true });
            }),
            new Promise((resolve) => window.setTimeout(resolve, 3000)),
          ]);
        }

        if (image.complete && image.naturalWidth > 0) {
          try {
            await image.decode();
          } catch {
            // A loaded image may still reject decode(); rendering can safely continue.
          }
        }
      };

      await Promise.all(images.map(settleImage));
    },
    { includeLazy },
  );
}

async function captureScene(page, selector, path) {
  const scene = page.locator(selector);
  await scene.scrollIntoViewIfNeeded();
  await waitForImages(page, selector, { includeLazy: true });
  await page.waitForTimeout(450);
  await page.screenshot({ path, fullPage: false });
}

async function warmFullPage(page) {
  await page.evaluate(async () => {
    const step = Math.max(320, Math.floor(window.innerHeight * 0.72));

    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => window.setTimeout(resolve, 55));
    }

    window.scrollTo(0, 0);
  });
}

test("capture visual preview", async ({ page }, testInfo) => {
  const isDesktop = testInfo.project.name === "chromium";
  const isMobile = testInfo.project.name === "mobile-chromium";

  test.skip(!isDesktop && !isMobile, "Representative desktop/mobile render only");

  await mkdir("visual-artifacts", { recursive: true });

  const prefix = isMobile ? "mobile" : "desktop";

  await page.goto("/");
  await waitForImages(page);
  await expect(page.getByRole("heading", { level: 1, name: /nordic depths/i })).toBeVisible();

  await page.screenshot({
    path: `visual-artifacts/${prefix}-hero.png`,
    fullPage: false,
  });

  await captureScene(page, "#xray", `visual-artifacts/${prefix}-xray.png`);
  await captureScene(page, "#mist", `visual-artifacts/${prefix}-depth.png`);
  await captureScene(page, '[data-scene="night"]', `visual-artifacts/${prefix}-night.png`);
  await captureScene(page, "#principles", `visual-artifacts/${prefix}-principles.png`);
  await captureScene(page, '[data-scene="aurora"]', `visual-artifacts/${prefix}-aurora.png`);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await warmFullPage(page);
  await waitForImages(page, "body", { includeLazy: true });
  await page.waitForTimeout(200);

  await page.screenshot({
    path: `visual-artifacts/${prefix}-full-static.png`,
    fullPage: true,
  });
});
