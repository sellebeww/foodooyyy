// scripts/checkContrast.ts
import { readFileSync } from "node:fs";

interface Pair {
  text: string;
  background: string;
  use: string;
  min: number;
}

function pair(text: string, background: string, use: string, min = 4.5): Pair {
  return { text, background, use, min };
}

const PAIRS: Pair[] = [
  pair("ink", "bg", "body text on page"),
  pair("ink", "paper", "body text on cards"),
  pair("ink", "sunken", "text on inset panels"),
  pair("muted", "bg", "secondary text on page"),
  pair("muted", "paper", "secondary text on cards"),
  pair("muted", "sunken", "secondary text on inset panels"),
  pair("ink", "orange", "primary button, sold-out tile"),
  pair("ink", "orange-600", "primary button hover"),
  pair("ink", "orange-100", "selected chip, edited tag"),
  pair("ink", "orange-50", "highlighted panel"),
  pair("orange-800", "bg", "eyebrow label on page"),
  pair("orange-800", "paper", "eyebrow label on cards"),
  pair("on-dark", "navy", "toast, dark cards"),
  pair("on-dark", "navy-900", "hero, sidebar"),
  pair("on-dark", "navy-700", "hover on dark"),
  pair("on-dark-muted", "navy", "secondary text on dark cards"),
  pair("on-dark-muted", "navy-900", "secondary text on hero"),
  pair("orange", "navy-900", "accent text on hero"),
  pair("orange", "navy", "accent text on dark cards"),
  pair("navy", "bg", "links on page"),
  pair("navy", "paper", "links on cards"),
  pair("navy", "navy-100", "menu initials"),
  pair("success", "success-100", "closed badge"),
  pair("info", "info-100", "estimate tag, info note"),
  pair("warn", "warn-100", "open badge, notices"),
  pair("ink", "warn-100", "notice body text"),
  pair("danger", "paper", "error text on cards"),
  pair("danger", "bg", "error text on page"),
  pair("danger", "danger-100", "error panel"),
  pair("on-dark", "danger", "danger button label"),
  pair("line-strong", "paper", "input borders (UI component)", 3),
  pair("line-strong", "bg", "borders on page (UI component)", 3),
  pair("navy", "bg", "focus ring on page", 3),
  pair("orange", "navy-900", "focus ring on dark", 3),
];

function readTokens(path: string): Map<string, string> {
  const css = readFileSync(path, "utf8");
  const tokens = new Map<string, string>();
  for (const match of css.matchAll(
    /--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g,
  )) {
    const name = match[1];
    const value = match[2];
    if (name !== undefined && value !== undefined) {
      tokens.set(name, value);
    }
  }
  return tokens;
}

function channel(value: number): number {
  const s = value / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const tokens = readTokens(process.argv[2] ?? "src/styles/tokens.css");
let failed = 0;
const rows: string[] = [];
for (const pair of PAIRS) {
  const fg = tokens.get(pair.text);
  const bg = tokens.get(pair.background);
  if (fg === undefined || bg === undefined) {
    rows.push(`MISSING  ${pair.text} on ${pair.background}`);
    failed += 1;
    continue;
  }
  const ratio = contrast(fg, bg);
  const ok = ratio >= pair.min;
  if (!ok) {
    failed += 1;
  }
  rows.push(
    `${ok ? "PASS" : "FAIL"}  ${ratio.toFixed(2).padStart(5)}:1  need ${pair.min}  ${pair.text} on ${pair.background}  (${pair.use})`,
  );
}
process.stdout.write(
  `${rows.join("\n")}\n${failed === 0 ? "all pairs pass" : `${failed} pair(s) fail`}\n`,
);
process.exit(failed === 0 ? 0 : 1);
