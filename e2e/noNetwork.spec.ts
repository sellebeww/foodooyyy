// e2e/noNetwork.spec.ts
import { expect, test } from "@playwright/test";

test.use({ timezoneId: "Asia/Jakarta" });

test("local fallback: every screen works with all non-local requests blocked", async ({
  page,
  context,
  baseURL,
}) => {
  const origin = new URL(baseURL ?? "http://localhost:4173").origin;
  const blocked: string[] = [];
  await context.route("**/*", async (route) => {
    const url = route.request().url();
    if (url.startsWith(origin) || url.startsWith("data:")) {
      await route.continue();
      return;
    }
    blocked.push(url);
    await route.abort();
  });
  await page.clock.setFixedTime(new Date("2026-03-02T09:00:00+07:00"));

  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: /Cook the right amount/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Try demo stall" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Open with the real clock" })
    .click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Today" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Plan today's portions" }).click();
  await page.getByRole("button", { name: "Accept all" }).click();
  await expect(page.getByText("Plan saved")).toBeVisible();

  await page.goto("/service");
  await page.getByRole("button", { name: /^Nasi Uduk Cooked/ }).click();
  await expect(page.getByText(/^Sold out \d\d:\d\d$/).first()).toBeVisible();

  await page.goto("/close");
  await expect(
    page.getByRole("heading", { level: 1, name: "Close" }),
  ).toBeVisible();

  await page.goto("/how");
  await expect(
    page.getByRole("heading", { level: 1, name: "How FOODOO calculates" }),
  ).toBeVisible();
  await expect(page.getByText("≈ 81 (estimate)").first()).toBeVisible();

  await page.goto("/settings");
  await expect(
    page.getByRole("heading", { level: 1, name: "Settings" }),
  ).toBeVisible();

  const loadedFonts = await page.evaluate(async () => {
    await document.fonts.ready;
    const families: string[] = [];
    document.fonts.forEach((face) => {
      if (face.status === "loaded") {
        families.push(face.family.replace(/"/g, ""));
      }
    });
    return families;
  });
  expect(loadedFonts).toContain("Space Grotesk");
  expect(blocked).toEqual([]);
});
