import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";

async function waitForImages(page) {
  await page.evaluate(async () => {
    const images = Array.from(document.images);
    await Promise.all(
      images.map(async (image) => {
        if (image.complete && image.naturalWidth > 0) {
          try {
            await image.decode();
          } catch {
            // A loaded image may still reject decode(); rendering can safely continue.
          }
          return;
        }

        await new Promise((resolve) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
        });

        try {
          await image.decode();
        } catch {
          // Decode failure is non-blocking because load/error has already settled.
        }
      }),
    );
  });
}

async function captureScene(page, selector, path) {
  const scene = page.locator(selector);
  await scene.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.screenshot({ path, fullPage: false });
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

  await captureScene(page, "#xray", `visual-artifacts/${prefix}-xray.png`);\n  await captureScene(page, "#mist", `visual-artifacts/${prefix}-depth.png`);
  await captureScene(page, '[data-scene="night"]', `visual-artifacts/${prefix}-night.png`);
  await captureScene(page, "#principles", `visual-artifacts/${prefix}-principles.png`);
  await captureScene(page, '[data-scene="aurora"]', `visual-artifacts/${prefix}-aurora.png`);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await waitForImages(page);
  await page.waitForTimeout(250);

  await page.screenshot({
    path: `visual-artifacts/${prefix}-full-static.png`,
    fullPage: true,
  });
});
