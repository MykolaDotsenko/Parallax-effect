import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";

async function waitForImages(page) {
  await page.locator("img").evaluateAll(async (images) => {
    await Promise.all(
      images.map(async (image) => {
        if (image.complete) {
          if (image.decode) await image.decode().catch(() => {});
          return;
        }

        await new Promise((resolve) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
        });
        if (image.decode) await image.decode().catch(() => {});
      }),
    );
  });
}

async function captureScene(page, selector, path) {
  const scene = page.locator(selector);
  await scene.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.screenshot({ path, fullPage: false });
}

test("capture visual preview", async ({ page }, testInfo) => {
  const isDesktop = testInfo.project.name === "chromium";
  const isMobile = testInfo.project.name === "mobile-chromium";

  test.skip(!isDesktop && !isMobile, "Representative desktop/mobile renders only");

  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await waitForImages(page);
  await mkdir("visual-artifacts", { recursive: true });

  const prefix = isMobile ? "mobile" : "desktop";

  await page.locator('[data-scene="forest"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await expect(page.getByRole("heading", { level: 1, name: /nordic depths/i })).toBeVisible();
  await page.screenshot({
    path: `visual-artifacts/${prefix}-hero.png`,
    fullPage: false,
  });

  await captureScene(
    page,
    "#experience",
    `visual-artifacts/${prefix}-depth.png`,
  );

  await captureScene(
    page,
    '[data-scene="night"]',
    `visual-artifacts/${prefix}-night.png`,
  );

  await captureScene(
    page,
    "#principles",
    `visual-artifacts/${prefix}-principles.png`,
  );

  await captureScene(
    page,
    '[data-scene="aurora"]',
    `visual-artifacts/${prefix}-aurora.png`,
  );
});
