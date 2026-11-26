// src/db/csv.ts
import type { Cell } from "./xlsx.ts";

const BOM = "\uFEFF";
const NEEDS_QUOTES = /[",;\r\n]/;

function quote(cell: Cell): string {
  if (cell === null) {
    return "";
  }
  const text = String(cell);
  return NEEDS_QUOTES.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsvText(rows: readonly (readonly Cell[])[]): string {
  return (
    BOM + rows.map((row) => row.map(quote).join(",")).join("\r\n") + "\r\n"
  );
}

function detectDelimiter(text: string): string {
  const firstLine = text.slice(0, text.search(/\r?\n|$/));
  const commas = firstLine.split(",").length;
  const semicolons = firstLine.split(";").length;
  return semicolons > commas ? ";" : ",";
}

export function parseCsvText(input: string): string[][] {
  const text = input.startsWith(BOM) ? input.slice(1) : input;
  const delimiter = detectDelimiter(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  let index = 0;

  while (index < text.length) {
    const char = text[index];
    if (quoted) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 2;
          continue;
        }
        quoted = false;
      } else {
        field += char;
      }
      index += 1;
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === delimiter) {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      if (char === "\r" && text[index + 1] === "\n") {
        index += 1;
      }
    } else {
      field += char;
    }
    index += 1;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ""));
}
