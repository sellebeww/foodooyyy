// scripts/lighthouse.ts
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const LIGHTHOUSE = "lighthouse@12.8.2";
const BASE = process.env["LH_BASE_URL"] ?? "http://localhost:4173";
const CATEGORIES = ["accessibility", "best-practices", "performance"];
const PAGES = ["/today", "/plan", "/service", "/how"];
const PRESETS = ["mobile", "desktop"] as const;
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = join(tmpdir(), "foodoo-lighthouse");
const PROFILE = join(OUT, "profile");
const PORT = 9339;
const DOC = join(ROOT, "docs", "LIGHTHOUSE.md");
const README = join(ROOT, "README.md");
const MARKER_START = "<!-- lighthouse:start -->";
const MARKER_END = "<!-- lighthouse:end -->";

type Preset = (typeof PRESETS)[number];

interface Result {
  page: string;
  preset: Preset;
  state: string;
  accessibility: number;
  bestPractices: number;
  performance: number;
  fcpMs: number;
  lcpMs: number;
  cls: number;
  failed: string[];
}

interface LhAudit {
  score: number | null;
  numericValue?: number;
  scoreDisplayMode: string;
}

interface LhReport {
  lighthouseVersion: string;
  finalDisplayedUrl: string;
  categories: Record<
    string,
    { score: number | null; auditRefs: { id: string; weight: number }[] }
  >;
  audits: Record<string, LhAudit>;
}

function runLighthouse(
  url: string,
  preset: Preset,
  name: string,
  warm: boolean,
): LhReport {
  const output = join(OUT, `${name}.json`);
  const args = [
    "--yes",
    LIGHTHOUSE,
    url,
    `--only-categories=${CATEGORIES.join(",")}`,
    "--output=json",
    `--output-path=${output}`,
    "--quiet",
  ];
  if (preset === "desktop") {
    args.push("--preset=desktop");
  }
  if (warm) {
    args.push(`--port=${PORT}`, "--disable-storage-reset");
  } else {
    args.push(`--chrome-path=${chromium.executablePath()}`);
    args.push("--chrome-flags=--headless=new");
  }
  const run = spawnSync("npx", args, { shell: true, stdio: "inherit" });
  if (run.status !== 0) {
    throw new Error(`Lighthouse failed for ${url} (${preset})`);
  }
  const report = JSON.parse(readFileSync(output, "utf8")) as LhReport;
  if (
    warm &&
    new URL(report.finalDisplayedUrl).pathname !== new URL(url).pathname
  ) {
    throw new Error(`${url} ended on ${report.finalDisplayedUrl}`);
  }
  return report;
}

function score(report: LhReport, category: string): number {
  return Math.round(100 * (report.categories[category]?.score ?? 0));
}

function failedAudits(report: LhReport): string[] {
  const ids = ["accessibility", "best-practices"].flatMap(
    (category) =>
      report.categories[category]?.auditRefs
        .filter((ref) => ref.weight > 0)
        .map((ref) => ref.id) ?? [],
  );
  return ids.filter((id) => {
    const audit = report.audits[id];
    return (
      audit !== undefined &&
      audit.scoreDisplayMode === "binary" &&
      audit.score === 0
    );
  });
}

function toResult(
  report: LhReport,
  page: string,
  preset: Preset,
  state: string,
): Result {
  return {
    page,
    preset,
    state,
    accessibility: score(report, "accessibility"),
    bestPractices: score(report, "best-practices"),
    performance: score(report, "performance"),
    fcpMs: Math.round(
      report.audits["first-contentful-paint"]?.numericValue ?? 0,
    ),
    lcpMs: Math.round(
      report.audits["largest-contentful-paint"]?.numericValue ?? 0,
    ),
    cls: report.audits["cumulative-layout-shift"]?.numericValue ?? 0,
    failed: failedAudits(report),
  };
}

async function waitForPort(): Promise<void> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (response.ok) {
        return;
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
  throw new Error("Chromium did not open its debugging port");
}

async function startDemoBrowser(): Promise<ChildProcess> {
  rmSync(PROFILE, { recursive: true, force: true });
  const chrome = spawn(
    chromium.executablePath(),
    [
      "--headless=new",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${PROFILE}`,
      "--no-first-run",
      "--no-default-browser-check",
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  await waitForPort();
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${PORT}`);
  const context = browser.contexts()[0];
  if (context === undefined) {
    throw new Error("No default browser context");
  }
  const page = await context.newPage();
  await page.goto(`${BASE}/`);
  await page
    .getByRole("button", { name: "Set up my own stall" })
    .first()
    .click();
  await page.getByRole("button", { name: "Try demo stall" }).click();
  await page.getByRole("button", { name: "Open with the real clock" }).click();
  await page.getByRole("heading", { level: 1, name: "Today" }).waitFor();
  await page.goto(`${BASE}/plan`);
  await page.getByRole("button", { name: "Accept all" }).click();
  await page.getByText("Plan saved").waitFor();
  await page.close();
  await browser.close();
  return chrome;
}

function seconds(ms: number): string {
  return `${(ms / 1000).toFixed(2)} s`;
}

function table(results: readonly Result[]): string {
  const rows = results.map(
    (item) =>
      `| ${item.page} | ${item.preset} | ${item.state} | ${item.accessibility} | ${item.bestPractices} | ${item.performance} | ${seconds(item.fcpMs)} | ${seconds(item.lcpMs)} | ${item.cls.toFixed(3)} |`,
  );
  return [
    "| Page | Preset | State | Accessibility | Best practices | Performance | First contentful paint | Largest contentful paint | Layout shift |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...rows,
  ].join("\n");
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const results: Result[] = [];
  let version = "";

  for (const preset of PRESETS) {
    const report = runLighthouse(`${BASE}/`, preset, `cold-${preset}`, false);
    version = report.lighthouseVersion;
    results.push(toResult(report, "/ (first visit)", preset, "cold, empty"));
  }

  const chrome = await startDemoBrowser();
  try {
    for (const path of PAGES) {
      for (const preset of PRESETS) {
        const name = `${path.slice(1)}-${preset}`;
        const report = runLighthouse(`${BASE}${path}`, preset, name, true);
        results.push(toResult(report, path, preset, "demo, plan saved"));
      }
    }
  } finally {
    chrome.kill();
  }

  const failed = [...new Set(results.flatMap((item) => item.failed))].sort();
  const body = [
    `Measured with Lighthouse ${version} (\`npx ${LIGHTHOUSE}\`) by \`npm run lighthouse\` against \`npm run preview\` on the machine that ran it. Mobile uses Lighthouse's default simulated Slow 4G network and 4x CPU slowdown; desktop uses \`--preset=desktop\`. "Cold" is a first visit with empty storage and no cache. The other rows load the demo and save a plan first, so the screens show real content; they are repeat visits served by the service worker, which is why they are faster. Performance scores vary between runs and machines.`,
    "",
    table(results),
    "",
    failed.length === 0
      ? "Failed accessibility or best-practices audits: none."
      : `Failed accessibility or best-practices audits: ${failed.join(", ")}.`,
  ].join("\n");

  writeFileSync(
    DOC,
    `# Lighthouse results\n\nGenerated by \`npm run lighthouse\`. Do not edit by hand.\n\n${body}\n`,
  );
  const readme = readFileSync(README, "utf8");
  const start = readme.indexOf(MARKER_START);
  const end = readme.indexOf(MARKER_END);
  if (start === -1 || end === -1) {
    throw new Error("README.md is missing the lighthouse markers");
  }
  writeFileSync(
    README,
    `${readme.slice(0, start + MARKER_START.length)}\n\n${body}\n\n${readme.slice(end)}`,
  );
  spawnSync("npx", ["prettier", "--write", DOC, README], {
    shell: true,
    stdio: "inherit",
  });
  console.log(body);
}

await main();
