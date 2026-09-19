import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("renders the complete narrative without page errors or horizontal overflow", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: /rakennan toimivia digitaalisia tuotteita/i })).toBeVisible();

  const xrayHeading = page.locator("#xray-title");
  await xrayHeading.scrollIntoViewIfNeeded();
  await expect(xrayHeading).toBeVisible();

  const depthHeading = page.locator("#depth-title");
  await depthHeading.scrollIntoViewIfNeeded();
  await expect(depthHeading).toBeVisible();

  const systemHeading = page.locator("#system-title");
  await systemHeading.scrollIntoViewIfNeeded();
  await expect(systemHeading).toBeVisible();

  const auroraHeading = page.locator("#aurora-title");
  await auroraHeading.scrollIntoViewIfNeeded();
  await expect(auroraHeading).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  expect(errors).toEqual([]);
});

test("original 2023 parallax preserves the historical layer ratios", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
  });

  const sampleTops = async () =>
    page.locator("[data-original-layer]").evaluateAll((layers) =>
      layers.map((layer) => layer.getBoundingClientRect().top),
    );

  const before = await sampleTops();
  const targetScroll = await page.evaluate(() => Math.min(460, window.innerHeight * 0.58));

  await page.evaluate((distance) => window.scrollTo(0, distance), targetScroll);
  await page.waitForFunction(
    (distance) => Math.abs(window.scrollY - distance) < 2,
    targetScroll,
  );
  await page.waitForFunction(() => {
    const value = document
      .querySelector("[data-original-experience]")
      ?.style.getPropertyValue("--original-scroll");
    return Number.parseFloat(value || "0") > 100;
  });
  await page.waitForTimeout(900);

  const after = await sampleTops();
  const viewportTravel = after.map((top, index) => Math.abs(top - before[index]));

  expect(viewportTravel).toHaveLength(3);
  expect(viewportTravel[0]).toBeLessThan(viewportTravel[1]);
  expect(viewportTravel[1]).toBeLessThan(viewportTravel[2]);
  expect(viewportTravel[2] - viewportTravel[0]).toBeGreaterThan(120);
});

test("reduced motion freezes the preserved original parallax", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, 360));

  await expect(page.locator("[data-original-experience]")).toHaveCSS("--original-scroll", "0px");
});

test("desktop scene compass follows the current scene", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile-chromium", "Desktop compass is intentionally hidden on mobile");

  await page.goto("/");
  const xray = page.locator("#xray");
  await xray.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);

  await expect(page.locator('[data-scene-link="xray"]')).toHaveAttribute("aria-current", "step");
});

test("the preserved original flows into the Nordic Depths extension", async ({ page }) => {
  await page.goto("/");
  const extension = page.locator("#extension");
  await extension.scrollIntoViewIfNeeded();
  await expect(page.getByRole("heading", { name: "The same idea grew with me." })).toBeVisible();
  await expect(page.locator("body")).toHaveClass(/extension-active/);
});

test("desktop primary navigation reaches the experience", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile-chromium", "Mobile intentionally uses a compact nav");

  await page.goto("/");
  await page.locator("#extension").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.body.classList.contains("extension-active"));
  await page.getByRole("link", { name: "Story", exact: true }).click();
  await expect(page.locator("#xray")).toBeInViewport();
});

test("mobile keeps a compact source-first navigation", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile-specific contract");

  await page.goto("/");
  await page.locator("#extension").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.body.classList.contains("extension-active"));
  await expect(page.getByRole("link", { name: "Source", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Story", exact: true })).toBeHidden();
});

test("Motion Lab changes and persists the real motion profile", async ({ page }) => {
  await page.goto("/");
  await page.locator("#extension").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.body.classList.contains("extension-active"));
  await page.getByRole("button", { name: "Motion Lab" }).click();
  await page.getByText("Reduced", { exact: true }).click();
  await expect(page.getByLabel("Reduced")).toBeChecked();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
});

test("reduced system motion becomes the active profile when no override is stored", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
});

test("system scene exposes the architecture as readable content", async ({ page }) => {
  await page.goto("/");
  const system = page.locator("#system");
  await system.scrollIntoViewIfNeeded();

  await expect(page.getByRole("heading", { name: "Simple parts. Clear boundaries." })).toBeVisible();
  await expect(system.locator("[data-system-node]")).toHaveCount(5);
  await expect(system.getByText("getMotionProfile()", { exact: true })).toBeVisible();
});

test("critical page has no serious or critical automated accessibility violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const blocking = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact),
  );

  expect(blocking).toEqual([]);
});
