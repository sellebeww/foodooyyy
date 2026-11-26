// scripts/makeIcons.ts
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const iconDir = fileURLToPath(new URL("../public/icons/", import.meta.url));
const svg = readFileSync(`${iconDir}icon.svg`, "utf8");

interface Target {
  file: string;
  size: number;
  inset: number;
}

const targets: Target[] = [
  { file: "icon-192.png", size: 192, inset: 0 },
  { file: "icon-512.png", size: 512, inset: 0 },
  { file: "icon-maskable-512.png", size: 512, inset: 0.18 },
];

const browser = await chromium.launch();
try {
  for (const target of targets) {
    const page = await browser.newPage({
      viewport: { width: target.size, height: target.size },
    });
    const pad = Math.round(target.size * target.inset);
    const inner = target.size - pad * 2;
    const background = target.inset > 0 ? "#003049" : "transparent";
    const markup = `<body style="margin:0;background:${background};display:grid;place-items:center;width:${target.size}px;height:${target.size}px">${svg.replace("<svg ", `<svg width="${inner}" height="${inner}" `)}</body>`;
    await page.setContent(markup);
    const png = await page.screenshot({ omitBackground: target.inset === 0 });
    writeFileSync(`${iconDir}${target.file}`, png);
    await page.close();
  }
} finally {
  await browser.close();
}
