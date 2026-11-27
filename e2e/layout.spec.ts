// e2e/layout.spec.ts
import { expect, test } from "@playwright/test";
import { openDemoWithRealClock } from "./helpers.ts";

const ROUTES = [
  "/about",
  "/how",
  "/today",
  "/plan",
  "/service",
  "/close",
  "/history",
  "/settings",
  "/simulate",
];

const CASES = ["en", "id"].flatMap((language) =>
  ["100%", "200%"].map((textSize) => ({ language, textSize })),
);

for (const { language, textSize } of CASES) {
  test(`no screen scrolls sideways at 320 px, ${language}, ${textSize} text`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto("/");
    await openDemoWithRealClock(page);
    await page.getByRole("heading", { level: 1, name: "Today" }).waitFor();
    await page.evaluate((value) => {
      localStorage.setItem("foodoo.language", value);
    }, language);
    for (const route of ROUTES) {
      await page.goto(route);
      await page.getByRole("heading", { level: 1 }).waitFor();
      await expect(page.locator("html")).toHaveAttribute("lang", language);
      await expect(page.getByText(/^(Loading|Memuat)/)).toHaveCount(0);
      await page.addStyleTag({ content: `html { font-size: ${textSize}; }` });
      if (route === "/simulate") {
        await page
          .getByRole("button", { name: /^(Finish day|Selesaikan hari)$/ })
          .click();
      }
      const width = await page.evaluate(
        () => document.documentElement.scrollWidth,
      );
      expect.soft(width, route).toBeLessThanOrEqual(320);
    }
  });
}
