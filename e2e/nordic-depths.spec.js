import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("renders the complete narrative without page errors or horizontal overflow", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: /nordic depths/i })).toBeVisible();

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

test("forest parallax preserves correct depth physics", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile-chromium", "Desktop depth contract uses the full motion profile");

  await page.goto("/");
  await page.evaluate(() => {
    localStorage.removeItem("nordic-depths:motion");
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
  });
  await page.reload();
  await page.waitForFunction(() => document.documentElement.dataset.motion === "full");
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
  });

  const sampleTops = async () =>
    page.locator("[data-parallax-layer]").evaluateAll((layers) =>
      layers.map((layer) => layer.getBoundingClientRect().top),
    );

  const before = await sampleTops();
  const foregroundBefore = await page.locator("[data-parallax-foreground]").evaluate(
    (layer) => layer.getBoundingClientRect().top,
  );
  const dimensions = await page.locator("#forest").evaluate((hero) => {
    const viewport = hero.querySelector("[data-hero-viewport]");
    return {
      heroHeight: hero.getBoundingClientRect().height,
      viewportHeight: viewport.getBoundingClientRect().height,
    };
  });

  expect(dimensions.heroHeight).toBeGreaterThan(dimensions.viewportHeight * 1.2);

  const targetScroll = (dimensions.heroHeight - dimensions.viewportHeight) * 0.85;
  await page.evaluate((distance) => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, distance);
  }, targetScroll);
  await page.waitForFunction(
    (distance) => Math.abs(window.scrollY - distance) < 2,
    targetScroll,
  );
  await page.waitForFunction(() => {
    const transforms = Array.from(document.querySelectorAll("[data-parallax-layer]"))
      .map((layer) => layer.style.transform);
    return transforms.length === 3 && new Set(transforms).size === 3;
  });

  const after = await sampleTops();
  const foregroundAfter = await page.locator("[data-parallax-foreground]").evaluate(
    (layer) => layer.getBoundingClientRect().top,
  );
  const delta = after.map((top, index) => top - before[index]);

  expect(delta).toHaveLength(3);
  expect(delta[0]).toBeGreaterThan(delta[1]);
  expect(delta[1]).toBeGreaterThan(delta[2]);
  expect(delta[0]).toBeGreaterThan(25);
  expect(delta[2]).toBeLessThan(-20);
  expect(delta[0] - delta[2]).toBeGreaterThan(120);
  expect(foregroundAfter - foregroundBefore).toBeLessThan(-40);
});

test("desktop scene compass follows the current scene", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile-chromium", "Desktop compass is intentionally hidden on mobile");

  await page.goto("/");
  const xray = page.locator("#xray");
  await xray.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);

  await expect(page.locator('[data-scene-link="xray"]')).toHaveAttribute("aria-current", "step");
});

test("hero entry cue reaches the X-Ray scene", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Scroll to feel depth" }).click();
  await expect(page.locator("#xray")).toBeInViewport();
});

test("desktop primary navigation reaches the experience", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile-chromium", "Mobile intentionally uses a compact nav");

  await page.goto("/");
  await page.getByRole("link", { name: "Experience", exact: true }).click();
  await expect(page.locator("#xray")).toBeInViewport();
});

test("mobile keeps a compact source-first navigation", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile-specific contract");

  await page.goto("/");
  await expect(page.getByRole("link", { name: "Source", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Experience", exact: true })).toBeHidden();
});

test("Motion Lab changes and persists the real motion profile", async ({ page }) => {
  await page.goto("/");
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

  await expect(page.getByRole("heading", { name: "One model. Bounded adapters." })).toBeVisible();
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
