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

  const auroraHeading = page.locator("#aurora-title");
  await auroraHeading.scrollIntoViewIfNeeded();
  await expect(auroraHeading).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  expect(errors).toEqual([]);
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
  await page.getByRole("link", { name: "Reveal the layers" }).click();
  await expect(page.locator("#xray")).toBeInViewport();
});

test("desktop primary navigation reaches the experience", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile-chromium", "Mobile intentionally uses a compact nav");

  await page.goto("/");
  await page.getByRole("link", { name: "Experience" }).click();
  await expect(page.locator("#xray")).toBeInViewport();
});

test("mobile keeps a compact source-first navigation", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile-specific contract");

  await page.goto("/");
  await expect(page.getByRole("link", { name: "Source", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Experience" })).toBeHidden();
});

test("Motion Lab changes and persists the real motion profile", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Motion Lab" }).click();
  await page.getByText("Reduced", { exact: true }).click();\n  await expect(page.getByLabel("Reduced")).toBeChecked();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
});

test("reduced system motion becomes the active profile when no override is stored", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
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
