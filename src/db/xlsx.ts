// src/db/xlsx.ts
import { unzip, zip } from "./zip.ts";

export type Cell = string | number | boolean | null;

export interface Sheet {
  name: string;
  rows: readonly (readonly Cell[])[];
}

const MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const REL_NS =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const PKG_REL_NS =
  "http://schemas.openxmlformats.org/package/2006/relationships";
const XML_HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
const INVALID_XML = /[^\t\n\r\u0020-\uD7FF\uE000-\uFFFD]/g;

function escapeXml(text: string): string {
  return text
    .replace(INVALID_XML, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function columnName(index: number): string {
  let name = "";
  let rest = index + 1;
  while (rest > 0) {
    const digit = (rest - 1) % 26;
    name = String.fromCharCode(65 + digit) + name;
    rest = Math.floor((rest - 1) / 26);
  }
  return name;
}

export function columnIndex(ref: string): number {
  const letters = /^[A-Z]+/.exec(ref)?.[0] ?? "A";
  let index = 0;
  for (const letter of letters) {
    index = index * 26 + (letter.charCodeAt(0) - 64);
  }
  return index - 1;
}

function cellXml(cell: Cell, ref: string): string {
  if (cell === null) {
    return "";
  }
  if (typeof cell === "number") {
    return `<c r="${ref}"><v>${cell}</v></c>`;
  }
  if (typeof cell === "boolean") {
    return `<c r="${ref}" t="b"><v>${cell ? 1 : 0}</v></c>`;
  }
  return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(cell)}</t></is></c>`;
}

function sheetXml(sheet: Sheet): string {
  const rows = sheet.rows
    .map((row, rowIndex) => {
      const r = rowIndex + 1;
      const cells = row
        .map((cell, col) => cellXml(cell, `${columnName(col)}${r}`))
        .join("");
      return `<row r="${r}">${cells}</row>`;
    })
    .join("");
  return `${XML_HEAD}<worksheet xmlns="${MAIN_NS}"><sheetData>${rows}</sheetData></worksheet>`;
}

const STYLES = `${XML_HEAD}<styleSheet xmlns="${MAIN_NS}"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs></styleSheet>`;

export function writeXlsx(sheets: readonly Sheet[]): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const sheetEntries = sheets.map((sheet, index) => ({
    name: `xl/worksheets/sheet${index + 1}.xml`,
    data: encoder.encode(sheetXml(sheet)),
  }));
  const contentTypes = `${XML_HEAD}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets
    .map(
      (_, index) =>
        `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
    )
    .join("")}</Types>`;
  const rootRels = `${XML_HEAD}<Relationships xmlns="${PKG_REL_NS}"><Relationship Id="rId1" Type="${REL_NS}/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
  const workbook = `${XML_HEAD}<workbook xmlns="${MAIN_NS}" xmlns:r="${REL_NS}"><sheets>${sheets
    .map(
      (sheet, index) =>
        `<sheet name="${escapeXml(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`,
    )
    .join("")}</sheets></workbook>`;
  const workbookRels = `${XML_HEAD}<Relationships xmlns="${PKG_REL_NS}">${sheets
    .map(
      (_, index) =>
        `<Relationship Id="rId${index + 1}" Type="${REL_NS}/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`,
    )
    .join(
      "",
    )}<Relationship Id="rIdStyles" Type="${REL_NS}/styles" Target="styles.xml"/></Relationships>`;

  return zip([
    { name: "[Content_Types].xml", data: encoder.encode(contentTypes) },
    { name: "_rels/.rels", data: encoder.encode(rootRels) },
    { name: "xl/workbook.xml", data: encoder.encode(workbook) },
    { name: "xl/_rels/workbook.xml.rels", data: encoder.encode(workbookRels) },
    { name: "xl/styles.xml", data: encoder.encode(STYLES) },
    ...sheetEntries,
  ]);
}

function parseXml(files: Map<string, Uint8Array>, path: string): Document {
  const data = files.get(path);
  if (data === undefined) {
    throw new Error(`Missing ${path}`);
  }
  const doc = new DOMParser().parseFromString(
    new TextDecoder().decode(data),
    "application/xml",
  );
  if (doc.getElementsByTagName("parsererror").length > 0) {
    throw new Error(`Broken ${path}`);
  }
  return doc;
}

function byTag(parent: Document | Element, tag: string): Element[] {
  return Array.from(parent.getElementsByTagNameNS("*", tag));
}

function textOf(element: Element): string {
  return byTag(element, "t")
    .filter((t) => t.parentElement?.localName !== "rPh")
    .map((t) => t.textContent ?? "")
    .join("");
}

function resolveTarget(target: string): string {
  if (target.startsWith("/")) {
    return target.slice(1);
  }
  return `xl/${target}`;
}

function readCell(cell: Element, shared: readonly string[]): Cell {
  const type = cell.getAttribute("t");
  const value = byTag(cell, "v")[0]?.textContent ?? null;
  if (type === "inlineStr") {
    return textOf(cell);
  }
  if (value === null) {
    return null;
  }
  if (type === "s") {
    return shared[Number(value)] ?? "";
  }
  if (type === "b") {
    return value === "1";
  }
  if (type === "str" || type === "e") {
    return value;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : value;
}

export async function readXlsx(
  data: Uint8Array,
): Promise<Map<string, Cell[][]>> {
  const files = await unzip(data);
  const workbook = parseXml(files, "xl/workbook.xml");
  const rels = parseXml(files, "xl/_rels/workbook.xml.rels");
  const targets = new Map(
    byTag(rels, "Relationship").map((rel) => [
      rel.getAttribute("Id") ?? "",
      rel.getAttribute("Target") ?? "",
    ]),
  );
  const shared = files.has("xl/sharedStrings.xml")
    ? byTag(parseXml(files, "xl/sharedStrings.xml"), "si").map(textOf)
    : [];

  const result = new Map<string, Cell[][]>();
  for (const sheet of byTag(workbook, "sheet")) {
    const name = sheet.getAttribute("name") ?? "";
    const id =
      sheet.getAttributeNS(REL_NS, "id") ?? sheet.getAttribute("r:id") ?? "";
    const target = targets.get(id);
    if (target === undefined) {
      continue;
    }
    const doc = parseXml(files, resolveTarget(target));
    const rows: Cell[][] = [];
    for (const row of byTag(doc, "row")) {
      const rowIndex = Number(row.getAttribute("r") ?? rows.length + 1) - 1;
      const cells: Cell[] = [];
      for (const cell of byTag(row, "c")) {
        const ref = cell.getAttribute("r");
        const col = ref === null ? cells.length : columnIndex(ref);
        while (cells.length < col) {
          cells.push(null);
        }
        cells[col] = readCell(cell, shared);
      }
      while (rows.length < rowIndex) {
        rows.push([]);
      }
      rows[rowIndex] = cells;
    }
    result.set(name, rows);
  }
  return result;
}
