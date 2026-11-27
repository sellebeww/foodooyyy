// e2e/case.spec.ts
import { expect, test, type Page } from "@playwright/test";

test.use({ timezoneId: "Asia/Jakarta" });

const CASES = [
  { stall: /^Warung Demo/, title: "A sold-out menu hides demand" },
  { stall: /^Demo Warung Makan Kantor/, title: "One weekday is not another" },
  {
    stall: /^Demo Angkringan Malam/,
    title: "A stall that closes after midnight",
  },
  { stall: /^Demo Warung Baru Buka/, title: "A new stall with little history" },
] as const;

async function startCase(page: Page, stall: RegExp) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Set up my own stall" })
    .first()
    .click();
  await page.getByRole("button", { name: "Try demo stall" }).click();
  const dialog = page.getByRole("dialog", { name: "Choose a demo stall" });
  await dialog.getByRole("button", { name: stall }).click();
  await page
    .getByRole("button", {
      name: /^(Track a sold-out dish|Compare weekday demand|Follow the overnight shift|Plan the first week)$/,
    })
    .click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Case guide" }),
  ).toBeVisible();
}

async function noSidewaysScroll(page: Page) {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

for (const { stall, title } of CASES) {
  test(`case guide: ${title}`, async ({ page }, testInfo) => {
    await page.clock.setFixedTime(new Date("2026-03-02T09:00:00+07:00"));
    await startCase(page, stall);
    await expect(
      page.getByRole("heading", { level: 2, name: title }),
    ).toBeVisible();
    await expect(page.locator(".case__steps > li")).toHaveCount(4);
    await expect(page.locator("main")).not.toContainText(/\{\w+\}/);
    await noSidewaysScroll(page);
    await testInfo.attach("case guide", {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });

    const moments = [
      { open: "Open the morning plan", screen: "Plan" },
      { open: "Open sales", screen: "Service" },
      { open: "Open closing time", screen: "Close" },
      { open: "Open the weekly summary", screen: "History" },
    ] as const;
    for (const moment of moments) {
      await page.getByRole("button", { name: moment.open }).click();
      await expect(
        page.getByRole("heading", { level: 1, name: moment.screen }),
      ).toBeVisible();
      const note = page.getByRole("note");
      await expect(note).toBeVisible();
      await expect(note).toContainText("Try this");
      await expect(note).toContainText("What happens");
      await noSidewaysScroll(page);
      await page.getByRole("link", { name: "Back to the case guide" }).click();
      await expect(
        page.getByRole("heading", { level: 2, name: title }),
      ).toBeVisible();
    }
  });
}

test("the guide can be stopped, and the loop screens are plain again", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-03-02T09:00:00+07:00"));
  await startCase(page, CASES[0].stall);
  await page.getByRole("button", { name: "Open the morning plan" }).click();
  await expect(page.getByRole("note")).toBeVisible();
  await page.getByRole("button", { name: "Stop the guide" }).click();
  await expect(page.getByRole("note")).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("heading", { level: 1, name: "Plan" }),
  ).toBeVisible();
  await expect(page.getByRole("note")).toHaveCount(0);
});

test("fits a 320 px wide phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.clock.setFixedTime(new Date("2026-03-02T09:00:00+07:00"));
  await startCase(page, CASES[3].stall);
  await noSidewaysScroll(page);
  await page.getByRole("button", { name: "Open sales" }).click();
  await expect(page.getByRole("note")).toBeVisible();
  await noSidewaysScroll(page);
});
