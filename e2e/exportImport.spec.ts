// e2e/exportImport.spec.ts
import { readFile, writeFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

test.use({ timezoneId: "Asia/Jakarta" });

async function exportAs(page: Page, label: string): Promise<Buffer> {
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await page.getByLabel(label, { exact: true }).check();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Export file" }).click(),
  ]);
  const path = await download.path();
  return readFile(path);
}

for (const [label, extension] of [
  ["JSON", "json"],
  ["XLSX", "xlsx"],
] as const) {
  test(`${extension}: export, delete all, import restores identical data`, async ({
    page,
  }, testInfo) => {
    await page.clock.setFixedTime(new Date("2026-03-02T09:00:00+07:00"));
    await page.goto("/");
    await page.getByRole("button", { name: "Try demo stall" }).click();
    await page.getByRole("button", { name: /^Warung Demo/ }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Today" }),
    ).toBeVisible();

    const before = await exportAs(page, label);
    const file = testInfo.outputPath(`backup.${extension}`);
    await writeFile(file, before);

    await page.getByRole("button", { name: "Delete all data" }).click();
    await page.getByRole("button", { name: "Delete everything" }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: /Cook the right amount/ }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Import a file" }).click();
    await page.getByLabel("File to import").setInputFiles(file);
    const dialog = page.getByRole("dialog", { name: "Import this file?" });
    await expect(dialog).toContainText("replaces all data");
    await dialog.getByRole("button", { name: "Import" }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Today" }),
    ).toBeVisible();
    await expect(page.getByText("Demo data")).toBeVisible();

    const after = await exportAs(page, label);
    expect(after.equals(before)).toBe(true);
  });
}
