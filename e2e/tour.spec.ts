// e2e/tour.spec.ts
import { expect, test, type Page } from "@playwright/test";

async function launchTutorial(page: Page) {
  await page.getByRole("button", { name: "Launch Demo App" }).first().click();
  await page
    .getByRole("dialog", { name: "Choose a demo stall" })
    .getByRole("button", { name: /^Warung Demo/ })
    .click();
}

test.use({
  storageState: { cookies: [], origins: [] },
  timezoneId: "Asia/Jakarta",
});

test("the company page comes first, and the tutorial only starts after the demo is launched", async ({
  page,
}, testInfo) => {
  await page.clock.setFixedTime(new Date("2026-03-02T09:00:00+07:00"));
  const tour = page.getByRole("region", { name: "Tutorial", exact: true });
  const step = async (title: string) => {
    await expect(tour.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.locator(".tour__ring")).toBeVisible();
    await page.waitForTimeout(500);
    await testInfo.attach(title, {
      body: await page.screenshot(),
      contentType: "image/png",
    });
  };
  const next = () => tour.getByRole("button", { name: "Next" }).click();
  const nav = (name: string) =>
    page.getByRole("link", { name, exact: true }).click();

  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: /Cook the right amount/ }),
  ).toBeVisible();
  await expect(tour).toHaveCount(0);

  await page.getByRole("button", { name: "Launch Demo App" }).first().click();
  const chooser = page.getByRole("dialog", { name: "Choose a demo stall" });
  await expect(
    chooser.getByRole("button", { name: /^(Warung Demo|Demo )/ }),
  ).toHaveCount(4);
  await chooser.getByRole("button", { name: /^Warung Demo/ }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Today" }),
  ).toBeVisible();
  await expect(
    tour.getByRole("heading", { name: "One day in 7 steps" }),
  ).toBeVisible();
  await tour.getByRole("button", { name: "Start tutorial" }).click();

  await step("A suggestion with a reason");
  await next();
  await step("Save the plan");
  await tour.getByRole("button", { name: "Back" }).click();
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
  await expect(
    tour.getByRole("heading", { name: "Count what is left" }),
  ).toBeVisible();
  await expect(
    page.getByText("Count what is left of each menu."),
  ).toBeVisible();
  for (const field of await page.locator(".stepper__input").all()) {
    await field.fill("1");
  }
  await page.getByRole("button", { name: "Close day" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save all" })
    .click();
  await step("See the result");
  await nav("History");
  await expect(
    tour.getByRole("heading", { name: "That is the daily loop" }),
  ).toBeVisible();
  await tour.getByRole("button", { name: "Finish" }).click();
  await expect(tour).toBeHidden();
  await expect(
    page.getByRole("heading", { level: 1, name: "History" }),
  ).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(tour).toBeHidden();
});

test("the tutorial can be closed with Escape, restarted from Today, and keeps the demo usable", async ({
  page,
}) => {
  await page.goto("/");
  await launchTutorial(page);
  const tour = page.getByRole("region", { name: "Tutorial", exact: true });
  await expect(
    tour.getByRole("heading", { name: "One day in 7 steps" }),
  ).toBeVisible();
  await tour.getByRole("button", { name: "Not now" }).click();
  await expect(tour).toBeHidden();

  await page.getByRole("button", { name: "Start tutorial" }).click();
  await expect(
    tour.getByRole("heading", { name: "A suggestion with a reason" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(tour).toBeHidden();
  await expect(page.getByRole("button", { name: "Accept all" })).toBeEnabled();
});

for (const size of [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 820, height: 1180 },
  { width: 1440, height: 900 },
]) {
  test(`every tutorial step keeps its card on screen at ${size.width}x${size.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(size);
    await page.goto("/");
    await launchTutorial(page);
    const tour = page.getByRole("region", { name: "Tutorial", exact: true });
    await tour.getByRole("button", { name: "Start tutorial" }).click();
    for (let index = 0; index < 8; index += 1) {
      await expect(tour).toBeVisible();
      await page.waitForTimeout(500);
      const fits = await page.evaluate(() => {
        const card = document.querySelector(".tour__card");
        if (card === null) {
          return false;
        }
        const box = card.getBoundingClientRect();
        return (
          box.left >= 0 &&
          box.top >= 0 &&
          box.right <= window.innerWidth &&
          box.bottom <= window.innerHeight
        );
      });
      expect(fits, `step ${index + 1}`).toBe(true);
      const finish = tour.getByRole("button", { name: "Finish" });
      if ((await finish.count()) > 0) {
        break;
      }
      await tour
        .getByRole("button", { name: /^(Next|Take me there)$/ })
        .click();
    }
  });
}

test("the tutorial points at the menu its case talks about and explains the stall", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-03-02T09:00:00+07:00"));
  await page.goto("/");
  await page.getByRole("button", { name: "Launch Demo App" }).first().click();
  const chooser = page.getByRole("dialog", { name: "Choose a demo stall" });
  await chooser.getByRole("button", { name: /^Demo Warung Baru Buka/ }).click();
  const tour = page.getByRole("region", { name: "Tutorial", exact: true });
  await expect(tour).toContainText("This stall opened only 4 days ago");
  await tour.getByRole("button", { name: "Start tutorial" }).click();
  await expect(
    tour.getByRole("heading", { name: "A suggestion with a reason" }),
  ).toBeVisible();
  await page.waitForTimeout(800);
  const ring = await page.locator(".tour__ring").boundingBox();
  const card = await page
    .locator('.card-grid > li[data-menu-id="lontong-sayur"]')
    .boundingBox();
  expect(ring).not.toBeNull();
  expect(card).not.toBeNull();
  expect(Math.abs((ring?.y ?? 0) - ((card?.y ?? 0) - 6))).toBeLessThan(4);
  expect(Math.abs((ring?.x ?? 0) - ((card?.x ?? 0) - 6))).toBeLessThan(4);
  const summary = tour.locator("summary");
  await expect(summary).toContainText("What happens in this stall");
  await summary.click();
  await expect(tour).toContainText("Lontong Sayur");
  const fits = await page.evaluate(() => {
    const box = document.querySelector(".tour__card")?.getBoundingClientRect();
    return (
      box !== undefined &&
      box.top >= 0 &&
      box.bottom <= window.innerHeight &&
      box.right <= window.innerWidth
    );
  });
  expect(fits).toBe(true);
});
