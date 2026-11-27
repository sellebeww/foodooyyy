// e2e/entry.spec.ts
import { expect, test } from "@playwright/test";
import { launchDemoWithRealClock } from "./helpers.ts";

test.use({ timezoneId: "Asia/Jakarta" });

test("a new visit to any app address lands on the company page first", async ({
  page,
}) => {
  for (const path of ["/today", "/plan", "/settings", "/start"]) {
    await page.goto(path);
    await expect(
      page.getByRole("heading", { level: 1, name: /Cook the right amount/ }),
    ).toBeVisible();
    expect(new URL(page.url()).pathname).toBe("/");
  }
});

test("the demo opens only from the launch button, and a new tab starts at the company page again", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Launch Demo App" }).first(),
  ).toBeVisible();
  await expect(page.getByText("Demo data")).toHaveCount(0);
  await launchDemoWithRealClock(page);
  await expect(
    page.getByRole("heading", { level: 1, name: "Today" }),
  ).toBeVisible();
  await expect(page.getByText("Demo data")).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("heading", { level: 1, name: "Today" }),
  ).toBeVisible();

  const second = await context.newPage();
  await second.goto("/today");
  await expect(
    second.getByRole("heading", { level: 1, name: /Cook the right amount/ }),
  ).toBeVisible();
  await expect(
    second.getByRole("button", { name: "Launch Demo App" }).first(),
  ).toBeVisible();
});

test("the installed app opens on the company page", async ({
  page,
  request,
}) => {
  await page.goto("/");
  const href = await page.locator('link[rel="manifest"]').getAttribute("href");
  const response = await request.get(href ?? "");
  const manifest = (await response.json()) as { start_url: string };
  expect(manifest.start_url).toBe("/");
});
