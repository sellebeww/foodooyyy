// e2e/tour.spec.ts
import { expect, test } from "@playwright/test";

test.use({
  storageState: { cookies: [], origins: [] },
  timezoneId: "Asia/Jakarta",
});

test("a first visitor can follow the tutorial to the end by clicking the highlighted elements", async ({
  page,
}, testInfo) => {
  await page.clock.setFixedTime(new Date("2026-03-02T09:00:00+07:00"));
  await page.goto("/");
  const tour = page.getByRole("region", { name: "Tutorial" });
  const step = async (title: string) => {
    await expect(tour.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.locator(".tour__ring")).toBeVisible();
    await page.waitForTimeout(700);
    await testInfo.attach(title, {
      body: await page.screenshot(),
      contentType: "image/png",
    });
  };
  const next = () => tour.getByRole("button", { name: "Next" }).click();
  const nav = (name: string) =>
    page.getByRole("link", { name, exact: true }).click();

  await step("Start with the demo");
  await page.getByRole("button", { name: "Try demo stall" }).click();
  await step("Pick the morning");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /^Morning plan/ })
    .click();
  await step("A suggestion with a reason");
  await next();
  await step("Save the plan");
  await page.getByRole("button", { name: "Accept all" }).click();
  await step("Open selling");
  await nav("Sales");
  await step("A menu runs out");
  await page.locator(".service-grid .service-tile").first().click();
  await step("Close the day");
  await nav("Close");
  await step("Count what is left");
  for (const field of await page.locator(".stepper__input").all()) {
    await field.fill("1");
  }
  await page.getByRole("button", { name: "Close day" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save all" })
    .click();
  await step("See the results");
  await nav("History");
  await step("The last 7 days");
  await next();
  await step("Open Settings");
  await page.locator('a[href="/settings"]:visible').first().click();
  await step("Cashier mode");
  await next();
  await step("Back to Today");
  await nav("Today");
  await step("Simulate whole days");
  await page.getByRole("link", { name: "Open simulation" }).click();
  await step("Run the stall");
  await page.getByRole("button", { name: "Play" }).click();
  await step("Live analysis");
  await expect(page.getByRole("heading", { name: /^Activity/ })).toBeVisible();
  await tour.getByRole("button", { name: "Finish" }).click();
  await expect(tour).toBeHidden();
  await page.getByRole("button", { name: "Pause" }).click();
  await page.getByRole("button", { name: "Finish day" }).click();
  await expect(page.getByText(/Day closed/)).toBeVisible();
  await expect(page.getByText(/^Busiest hour starts at/)).toBeVisible();
  await testInfo.attach("simulation", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(tour).toBeHidden();
});
