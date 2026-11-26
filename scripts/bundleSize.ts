// scripts/bundleSize.ts
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const BUDGET_KB = 250;
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIST = join(ROOT, "dist");
const ASSETS = join(DIST, "assets");

interface Entry {
  file: string;
  raw: number;
  gzip: number;
}

function listFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });
}

function measure(path: string): Entry {
  const content = readFileSync(path);
  return {
    file: relative(DIST, path).split("\\").join("/"),
    raw: content.length,
    gzip: gzipSync(content, { level: 9 }).length,
  };
}

function kb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function report(title: string, entries: readonly Entry[]): number {
  const total = entries.reduce((sum, entry) => sum + entry.gzip, 0);
  console.log(title);
  for (const entry of entries) {
    console.log(
      `  ${entry.file}: ${kb(entry.raw)} raw, ${kb(entry.gzip)} gzip`,
    );
  }
  console.log(`  total: ${kb(total)} gzip`);
  return total;
}

const files = listFiles(DIST);
const pageJs = files
  .filter((path) => path.startsWith(ASSETS) && path.endsWith(".js"))
  .map(measure);
const css = files.filter((path) => path.endsWith(".css")).map(measure);
const worker = files
  .filter((path) => !path.startsWith(ASSETS) && path.endsWith(".js"))
  .map(measure);

if (pageJs.length === 0) {
  console.error("No JavaScript found in dist/assets. Run npm run build first.");
  process.exit(1);
}

const jsTotal = report("Page JavaScript (budget applies)", pageJs);
report("CSS", css);
report("Service worker (loaded by the browser, not the page)", worker);

if (jsTotal > BUDGET_KB * 1024) {
  console.error(`Over budget: ${kb(jsTotal)} > ${BUDGET_KB} KB gzip`);
  process.exit(1);
}
console.log(`Within budget: ${kb(jsTotal)} <= ${BUDGET_KB} KB gzip`);
