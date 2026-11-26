// scripts/uiShots.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium, type BrowserContext, type Page } from "@playwright/test";

interface Viewport {
  label: string;
  width: number;
  height: number;
}

interface Finding {
  viewport: string;
  shot: string;
  horizontalScroll: boolean;
  scrollWidth: number;
  smallTargets: string[];
  fontSizes: number[];
  clipped: string[];
  lowContrast: string[];
}

const VIEWPORTS: Viewport[] = [
  { label: "360x640", width: 360, height: 640 },
  { label: "390x844", width: 390, height: 844 },
  { label: "768x1024", width: 768, height: 1024 },
  { label: "1280x800", width: 1280, height: 800 },
  { label: "1440x900", width: 1440, height: 900 },
];

const EXTRA: Viewport[] = [{ label: "320x640", width: 320, height: 640 }];

const outDir = process.argv[2] ?? "docs/ui/before";
const baseUrl = process.argv[3] ?? "http://localhost:4173";
const withExtra = process.argv.includes("--with-320");

function at(time: string): Date {
  return new Date(`2026-03-02T${time}:00+07:00`);
}

async function measure(
  page: Page,
): Promise<Omit<Finding, "viewport" | "shot">> {
  return page.evaluate((viewportWidth) => {
    const doc = document.documentElement;
    const small: string[] = [];
    const clipped: string[] = [];
    const sizes = new Set<number>();
    const nodes = document.querySelectorAll<HTMLElement>(
      "a[href], button, input, select, textarea, [role='button'], summary",
    );
    nodes.forEach((el) => {
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      if (
        r.width === 0 ||
        r.height === 0 ||
        style.visibility === "hidden" ||
        style.display === "none" ||
        el.classList.contains("skip-link")
      ) {
        return;
      }
      if (
        el instanceof HTMLInputElement &&
        (el.type === "checkbox" || el.type === "radio")
      ) {
        const label = el.closest("label");
        const lr = (label ?? el).getBoundingClientRect();
        if (lr.height >= 48 && lr.width >= 48) return;
      }
      if (r.width < 48 || r.height < 48) {
        const label =
          el.getAttribute("aria-label") ??
          el.textContent?.trim().slice(0, 28) ??
          el.tagName;
        small.push(
          `${el.tagName.toLowerCase()} "${label}" ${Math.round(r.width)}x${Math.round(r.height)}`,
        );
      }
    });
    document.querySelectorAll<HTMLElement>("body *").forEach((el) => {
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") return;
      if (el.childNodes.length > 0) {
        for (const n of Array.from(el.childNodes)) {
          if (n.nodeType === Node.TEXT_NODE && n.textContent?.trim()) {
            sizes.add(Math.round(parseFloat(style.fontSize) * 10) / 10);
          }
        }
      }
      const r = el.getBoundingClientRect();
      if (
        r.width > 0 &&
        r.right > viewportWidth + 1 &&
        el.closest(".visually-hidden") === null
      ) {
        clipped.push(
          `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 30)} right=${Math.round(r.right)}`,
        );
      }
    });
    const low: string[] = [];
    const parse = (value: string): [number, number, number, number] | null => {
      const m = value.match(/rgba?\(([^)]+)\)/);
      if (m === null || m[1] === undefined) return null;
      const parts = m[1]
        .split(/[ ,/]+/)
        .filter(Boolean)
        .map(Number);
      const [r, g, b, a] = parts;
      if (r === undefined || g === undefined || b === undefined) return null;
      return [r, g, b, a ?? 1];
    };
    const lum = (rgb: [number, number, number, number]) => {
      const f = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
    };
    document.querySelectorAll<HTMLElement>("body *").forEach((el) => {
      const own = Array.from(el.childNodes).some(
        (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim(),
      );
      if (!own) return;
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (
        style.visibility === "hidden" ||
        style.display === "none" ||
        rect.width === 0 ||
        rect.height === 0 ||
        el.closest(".visually-hidden") !== null
      ) {
        return;
      }
      const fg = parse(style.color);
      let bg: [number, number, number, number] | null = null;
      for (let n: HTMLElement | null = el; n !== null; n = n.parentElement) {
        const c = parse(getComputedStyle(n).backgroundColor);
        const nr = n.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const under =
          cx >= nr.left && cx <= nr.right && cy >= nr.top && cy <= nr.bottom;
        if (c !== null && c[3] > 0.99 && under) {
          bg = c;
          break;
        }
      }
      if (fg === null || bg === null) return;
      const a = lum(fg);
      const b = lum(bg);
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      const size = parseFloat(style.fontSize);
      const bold = parseInt(style.fontWeight, 10) >= 700;
      const need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;
      if (ratio < need) {
        low.push(
          `${ratio.toFixed(2)}:1 need ${need} "${(el.textContent ?? "").trim().slice(0, 24)}"`,
        );
      }
    });
    return {
      lowContrast: low.slice(0, 10),
      horizontalScroll: doc.scrollWidth > viewportWidth + 1,
      scrollWidth: doc.scrollWidth,
      smallTargets: small,
      fontSizes: Array.from(sizes).sort((a, b) => a - b),
      clipped: clipped.slice(0, 8),
    };
  }, page.viewportSize()?.width ?? 0);
}

async function newContext(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  vp: Viewport,
): Promise<BrowserContext> {
  return browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    timezoneId: "Asia/Jakarta",
    hasTouch: vp.width < 768,
    isMobile: vp.width < 768,
    deviceScaleFactor: 1,
    reducedMotion: "no-preference",
  });
}

async function run(): Promise<void> {
  mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const findings: Finding[] = [];
  const failures: string[] = [];
  const list = withExtra ? [...VIEWPORTS, ...EXTRA] : VIEWPORTS;

  for (const vp of list) {
    const dir = join(outDir, vp.label);
    mkdirSync(dir, { recursive: true });
    let index = 0;

    const shot = async (page: Page, name: string) => {
      index += 1;
      const file = `${String(index).padStart(2, "0")}-${name}`;
      await page.waitForTimeout(250);
      await page.screenshot({
        path: join(dir, `${file}.png`),
        fullPage: true,
        animations: "disabled",
      });
      findings.push({
        viewport: vp.label,
        shot: file,
        ...(await measure(page)),
      });
    };

    const step = async (name: string, fn: () => Promise<void>) => {
      try {
        await fn();
      } catch (error) {
        failures.push(
          `${vp.label} ${name}: ${String(error).split("\n")[0] ?? ""}`,
        );
      }
    };

    const startup = await newContext(browser, vp);
    const first = await startup.newPage();
    await first.clock.setFixedTime(at("09:00"));
    await step("welcome", async () => {
      await first.goto(`${baseUrl}/`);
      await first.getByRole("heading", { level: 1 }).waitFor();
      await shot(first, "welcome");
    });
    await step("about", async () => {
      await first.goto(`${baseUrl}/about`);
      await first.getByRole("heading", { level: 1 }).waitFor();
      await shot(first, "about");
    });
    await step("how", async () => {
      await first.goto(`${baseUrl}/how`);
      await first.getByRole("heading", { level: 1 }).waitFor();
      await shot(first, "how");
    });
    await step("setup-menus-empty", async () => {
      await first.goto(`${baseUrl}/welcome`);
      await first.getByRole("button", { name: "Start setup" }).click();
      await first.getByRole("heading", { level: 1 }).waitFor();
      await shot(first, "setup-menus-empty");
    });
    await step("menu-sheet", async () => {
      await first
        .getByRole("button", { name: /Add menu/ })
        .first()
        .click();
      await first.getByRole("dialog").waitFor();
      await shot(first, "menu-sheet-empty");
      await first
        .getByRole("dialog")
        .getByRole("button", { name: /Save|Add/ })
        .last()
        .click();
      await shot(first, "menu-sheet-error");
    });
    await startup.close();

    const demo = await newContext(browser, vp);
    const page = await demo.newPage();
    await page.clock.setFixedTime(at("09:00"));
    await step("demo-picker", async () => {
      await page.goto(`${baseUrl}/`);
      await page.getByRole("button", { name: "Try demo stall" }).click();
      await page.getByRole("button", { name: /^Warung Demo/ }).waitFor();
      await shot(page, "demo-picker");
      await page.getByRole("button", { name: /^Warung Demo/ }).click();
      await page.getByRole("heading", { level: 1, name: "Today" }).waitFor();
    });
    await step("today-plan-phase", async () => {
      await shot(page, "today-plan-phase");
    });
    await step("plan", async () => {
      await page.goto(`${baseUrl}/plan`);
      await page.getByRole("heading", { level: 1, name: "Plan" }).waitFor();
      await shot(page, "plan-suggested");
      await page.getByLabel("Portions of Nasi Uduk").fill("42");
      await shot(page, "plan-edited");
      await page.getByRole("button", { name: "Save plan" }).click();
      await page.getByRole("heading", { level: 1, name: "Today" }).waitFor();
      await shot(page, "today-planned");
    });
    await step("service", async () => {
      await page.clock.setFixedTime(at("10:30"));
      await page.goto(`${baseUrl}/service`);
      await page.getByRole("button", { name: /^Nasi Uduk Cooked/ }).waitFor();
      await shot(page, "service-available");
      await page.getByRole("button", { name: /^Nasi Uduk Cooked/ }).click();
      await shot(page, "service-sold-out-toast");
    });
    await step("close", async () => {
      await page.clock.setFixedTime(at("20:00"));
      await page.goto(`${baseUrl}/close`);
      await page.getByRole("heading", { level: 1, name: "Close" }).waitFor();
      await page.getByLabel("Leftover portions of Ayam Goreng").fill("3");
      await page.getByLabel("Leftover portions of Sayur Lodeh").fill("5");
      await page.getByLabel("Leftover portions of Tempe Orek").fill("0");
      await shot(page, "close-missed-prompt");
      await page
        .getByRole("button", { name: "Close day", exact: true })
        .click();
      await page.getByRole("dialog", { name: "Close today?" }).waitFor();
      await shot(page, "close-sheet");
      await page.getByRole("button", { name: "Save all" }).click();
      await page.getByRole("heading", { name: "Today is closed" }).waitFor();
      await shot(page, "close-closed");
    });
    await step("today-closed", async () => {
      await page.goto(`${baseUrl}/today`);
      await page.getByRole("heading", { level: 1, name: "Today" }).waitFor();
      await shot(page, "today-closed");
    });
    await step("history", async () => {
      await page.goto(`${baseUrl}/history`);
      await page.getByRole("heading", { level: 1, name: "History" }).waitFor();
      await shot(page, "history");
      await page.getByRole("link", { name: /Monday 2 March/ }).click();
      await page
        .getByRole("heading", { level: 2, name: "Monday 2 March" })
        .waitFor();
      await shot(page, "day-detail");
    });
    await step("settings", async () => {
      await page.goto(`${baseUrl}/settings`);
      await page.getByRole("heading", { level: 1, name: "Settings" }).waitFor();
      await shot(page, "settings");
    });
    await step("setup-edit", async () => {
      await page.goto(`${baseUrl}/setup/menus`);
      await page.getByRole("heading", { level: 1 }).waitFor();
      await shot(page, "setup-menus-filled");
      await page.goto(`${baseUrl}/setup/hours`);
      await page.getByRole("heading", { level: 1 }).waitFor();
      await shot(page, "setup-hours");
    });
    await step("not-found", async () => {
      await page.goto(`${baseUrl}/no-such-page`);
      await page.getByRole("heading", { level: 1 }).waitFor();
      await shot(page, "not-found-redirect");
    });
    await demo.close();

    const reg = await newContext(browser, vp);
    const rp = await reg.newPage();
    await rp.clock.setFixedTime(at("09:00"));
    await step("register", async () => {
      await rp.goto(`${baseUrl}/`);
      await rp.getByRole("button", { name: "Try demo stall" }).click();
      await rp.getByRole("button", { name: /^Warung Demo/ }).click();
      await rp.getByRole("heading", { level: 1, name: "Today" }).waitFor();
      await rp.goto(`${baseUrl}/settings`);
      await rp
        .locator("label.segmented__option", { hasText: "Register" })
        .click();
      await rp.getByText("Mode saved").waitFor();
      await rp.goto(`${baseUrl}/plan`);
      await rp.getByRole("button", { name: "Accept all" }).click();
      await rp.getByRole("heading", { level: 1, name: "Today" }).waitFor();
      await rp.clock.setFixedTime(at("10:00"));
      await rp.goto(`${baseUrl}/service`);
      await rp.getByRole("heading", { level: 1 }).waitFor();
      await shot(rp, "register-empty-cart");
      const tiles = rp.locator("li.service-tile-wrap > button.service-tile");
      await tiles.first().click();
      await tiles.first().click();
      await tiles.nth(1).click();
      await shot(rp, "register-cart");
    });
    await reg.close();
  }

  await browser.close();
  writeFileSync(
    join(outDir, "findings.json"),
    `${JSON.stringify({ findings, failures }, null, 2)}\n`,
    "utf8",
  );
  process.stdout.write(
    `shots: ${findings.length}, failures: ${failures.length}\n${failures.join("\n")}\n`,
  );
}

await run();
