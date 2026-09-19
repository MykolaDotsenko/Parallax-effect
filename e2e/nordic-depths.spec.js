import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("renders the complete narrative without page errors or horizontal overflow", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: /nordic depths/i })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /motion should create hierarchy/i })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /motion with purpose/i })).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  expect(errors).toEqual([]);
});

test("primary navigation reaches the engineering principles", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Principles" }).click();
  await expect(page.locator("#principles")).toBeInViewport();
});

test("reduced motion becomes the active profile", async ({ page }) => {
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
