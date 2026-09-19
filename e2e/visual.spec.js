import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";

async function revealPage(page) {
  await page.evaluate(async () => {
    const step = Math.max(360, Math.floor(window.innerHeight * 0.72));
    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 90));
    }
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 260));
  });
}

test("capture visual preview", async ({ page }, testInfo) => {
  const isDesktop = testInfo.project.name === "chromium";
  const isMobile = testInfo.project.name === "mobile-chromium";

  test.skip(!isDesktop && !isMobile, "Visual artifact only needs representative desktop/mobile renders");

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /nordic depths/i })).toBeVisible();

  await mkdir("visual-artifacts", { recursive: true });

  const prefix = isMobile ? "mobile" : "desktop";
  await page.screenshot({
    path: `visual-artifacts/${prefix}-hero.png`,
    fullPage: false,
  });

  await revealPage(page);

  await page.screenshot({
    path: `visual-artifacts/${prefix}-full.png`,
    fullPage: true,
  });
});
