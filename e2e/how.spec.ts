// e2e/how.spec.ts
import { expect, test } from "@playwright/test";
import { launchDemoWithRealClock } from "./helpers.ts";

test("How FOODOO calculates works offline and its sliders change the numbers", async ({
  page,
  context,
}) => {
  await page.goto("/how");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { level: 1, name: "How FOODOO calculates" }),
  ).toBeVisible();

  const soldOut = page.getByRole("slider", { name: /Sold out at/ });
  await soldOut.focus();
  await expect(page.getByText("≈ 81 (estimate)")).toBeVisible();
  await soldOut.press("End");
  await expect(page.getByText("≈ 42 (estimate)")).toBeVisible();
  await soldOut.press("Home");
  await expect(page.getByText("≈ 126 (estimate)")).toBeVisible();

  const cost = page.getByRole("slider", { name: /Cost to cook one portion/ });
  await cost.focus();
  await cost.press("Home");
  await expect(page.getByText(/earns Rp 7.000/)).toBeVisible();

  await page
    .getByRole("navigation", { name: "Steps on this page" })
    .getByRole("link", { name: /Accuracy/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "6. How accurate is this?" }),
  ).toBeInViewport();
  await expect(
    page.getByRole("heading", { name: "6. How accurate is this?" }),
  ).not.toBeHidden();
});

test("the company page shows the ecosystem and trust sections on a phone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/#ecosystem");
  await expect(
    page.getByRole("heading", { name: "One loop, five connected parts" }),
  ).toBeInViewport();
  await page
    .getByRole("heading", { name: /What FOODOO claims/ })
    .scrollIntoViewIfNeeded();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("the suggestion check panel lays its text out in a normal column", async ({
  page,
}) => {
  for (const path of ["/how", "/history"]) {
    await page.goto("/");
    await launchDemoWithRealClock(page);
    await page.getByRole("heading", { level: 1, name: "Today" }).waitFor();
    await page.goto(path);
    const lead = page.locator(".suggestion-check p.muted");
    await expect(lead).toBeVisible();
    const box = await lead.boundingBox();
    const panel = await page.locator(".suggestion-check").boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(200);
    expect(panel?.height ?? 9999).toBeLessThan(600);
  }
});
