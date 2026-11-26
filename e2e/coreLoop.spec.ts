// e2e/coreLoop.spec.ts
import {
  expect,
  test,
  type BrowserContext,
  type Page,
  type TestInfo,
} from "@playwright/test";

test.use({ timezoneId: "Asia/Jakarta" });

function at(time: string): Date {
  return new Date(`2026-03-02T${time}:00+07:00`);
}

async function snap(page: Page, testInfo: TestInfo, name: string) {
  const path = testInfo.outputPath(`${name}.png`);
  await page.screenshot({ path, fullPage: true });
  await testInfo.attach(name, { path, contentType: "image/png" });
}

async function goOfflineAfterFirstLoad(page: Page, context: BrowserContext) {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { level: 1, name: /Cook the right amount/ }),
  ).toBeVisible();
  await expect(page.getByText("Offline. Saved on this device.")).toBeVisible();
}

async function runCoreLoop(page: Page, testInfo: TestInfo) {
  await page.getByRole("button", { name: "Try demo stall" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Open with the real clock" })
    .click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Today" }),
  ).toBeVisible();
  await expect(page.getByText("Demo data")).toBeVisible();

  await page.getByRole("link", { name: "Plan today's portions" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Plan" }),
  ).toBeVisible();
  await expect(page.getByText("Demo data")).toBeVisible();
  const nasi = page.getByLabel("Portions of Nasi Uduk");
  const suggested = await nasi.inputValue();
  expect(suggested).not.toBe("42");
  await expect(page.getByRole("button", { name: "Accept all" })).toBeVisible();
  await nasi.fill("42");
  await expect(page.getByText("Edited")).toBeVisible();
  await expect(page.getByText(`Suggested ${suggested}`)).toBeVisible();
  const ayamCooked = Number(
    await page.getByLabel("Portions of Ayam Goreng").inputValue(),
  );
  await snap(page, testInfo, "1-plan");
  await page.getByRole("button", { name: "Save plan" }).click();
  await expect(page.getByText("Plan saved")).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 1, name: "Today" }),
  ).toBeVisible();

  await page.clock.setFixedTime(at("10:30"));
  await page.getByRole("link", { name: "Open service" }).click();
  const available = page.getByRole("button", {
    name: "Nasi Uduk Cooked 42 Tap when sold out",
  });
  const soldOut = page.getByRole("button", {
    name: /^Nasi Uduk Sold out 10:30$/i,
  });
  await available.click();
  await expect(soldOut).toBeVisible();
  await expect(page.getByText("Nasi Uduk sold out at 10:30")).toBeVisible();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText("Sell-out undone")).toBeVisible();
  await expect(available).toBeVisible();
  await available.click();
  await expect(soldOut).toBeVisible();
  await snap(page, testInfo, "2-service");

  await page.clock.setFixedTime(at("20:00"));
  await page.getByRole("link", { name: "Today", exact: true }).click();
  await page.getByRole("link", { name: "Close the day" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Close" }),
  ).toBeVisible();
  await expect(page.getByText("Sold out 10:30")).toBeVisible();
  await page.getByLabel("Leftover portions of Ayam Goreng").fill("3");
  await page.getByLabel("Leftover portions of Sayur Lodeh").fill("5");
  await page.getByLabel("Leftover portions of Tempe Orek").fill("0");
  const missed = page.getByLabel("About what time did Tempe Orek run out?");
  await expect(missed).toHaveValue("14:00");
  await missed.fill("12:15");
  await snap(page, testInfo, "3-close");
  await page.getByRole("button", { name: "Close day", exact: true }).click();

  const dialog = page.getByRole("dialog", { name: "Close today?" });
  const wanted = dialog.getByRole("region", {
    name: "How many wanted each menu today",
  });
  const row = (name: string) =>
    wanted.getByRole("listitem").filter({ hasText: name });
  await expect(row("Nasi Uduk")).toContainText("Cooked 42");
  await expect(row("Nasi Uduk")).toContainText("Wanted ≈ 81 (estimate)");
  await expect(row("Ayam Goreng")).toContainText(
    new RegExp(`Wanted ${ayamCooked - 3}$`),
  );
  await expect(row("Ayam Goreng")).not.toContainText("estimate");
  await expect(row("Tempe Orek")).toContainText("(estimate)");
  await expect(row("Sayur Lodeh")).not.toContainText("estimate");
  const tomorrow = dialog.getByRole("region", {
    name: "Tomorrow's suggestions, Tuesday 3 March",
  });
  await expect(tomorrow.getByRole("listitem")).toHaveCount(4);
  const preview = await tomorrow.innerText();
  await snap(page, testInfo, "4-close-sheet");
  await dialog.getByRole("button", { name: "Save all" }).click();

  const closed = page.getByRole("heading", { name: "Today is closed" });
  const stored = page.getByRole("region", {
    name: "Tomorrow's suggestions, Tuesday 3 March",
  });
  await expect(closed).toBeVisible();
  expect(await stored.innerText()).toBe(preview);
  await snap(page, testInfo, "5-closed");

  await page.reload();
  await expect(closed).toBeVisible();
  await expect(page.getByText("Demo data")).toBeVisible();
  expect(await stored.innerText()).toBe(preview);
  await expect(
    page
      .getByRole("region", { name: "How many wanted each menu today" })
      .getByRole("listitem")
      .filter({ hasText: "Nasi Uduk" }),
  ).toContainText("Wanted ≈ 81 (estimate)");

  await page.getByRole("link", { name: "Today", exact: true }).click();
  const counts = page.getByRole("region", { name: "Today so far" });
  await expect(
    counts.getByText("Day closed").locator("xpath=following-sibling::dd[1]"),
  ).toHaveText("Yes");
  await expect(
    counts
      .getByText("Menus sold out")
      .locator("xpath=following-sibling::dd[1]"),
  ).toHaveText("2");
  await page.getByRole("link", { name: "Sales", exact: true }).click();
  await expect(soldOut).toBeVisible();
  await expect(soldOut).toBeDisabled();

  await page.getByRole("link", { name: "History", exact: true }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "History" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Per menu, last 7 days" }),
  ).toContainText("Nasi Uduk");
  await page.getByRole("link", { name: /Monday 2 March/ }).click();
  await expect(
    page.getByRole("heading", { level: 2, name: "Monday 2 March" }),
  ).toBeVisible();
  await expect(page.getByText("≈ 81", { exact: true })).toBeVisible();
  await snap(page, testInfo, "6-history-day");
}

test.describe("core loop", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(at("09:00"));
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: /Cook the right amount/ }),
    ).toBeVisible();
  });

  test("online: demo, plan, sold out, undo, close, tomorrow, reload", async ({
    page,
  }, testInfo) => {
    await runCoreLoop(page, testInfo);
  });

  test("offline after the first load: the same loop with no network", async ({
    page,
    context,
  }, testInfo) => {
    await goOfflineAfterFirstLoad(page, context);
    await runCoreLoop(page, testInfo);
    await expect(
      page.getByText("Offline. Saved on this device."),
    ).toBeVisible();
  });
});
