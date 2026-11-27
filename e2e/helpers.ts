// e2e/helpers.ts
import type { Page } from "@playwright/test";

export async function openDemoWithRealClock(page: Page): Promise<void> {
  await page
    .getByRole("button", { name: "Set up my own stall" })
    .first()
    .click();
  await page.getByRole("button", { name: "Try demo stall" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Open with the real clock" })
    .click();
}

export async function launchDemoWithRealClock(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Launch Demo App" }).first().click();
  await page
    .getByRole("dialog", { name: "Choose a demo stall" })
    .getByRole("button", { name: "Open with the real clock" })
    .click();
}
