// tests/db/exportImport.test.ts
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { parseCsvText, toCsvText } from "../../src/db/csv.ts";
import {
  applyImport,
  backupSheets,
  buildBackup,
  detectFormat,
  encodeBackup,
  exportData,
  MAX_ISSUES,
  parseImport,
  validateBackup,
  type Backup,
  type ImportResult,
} from "../../src/db/exportImport.ts";
import { deleteAll, loadDemo } from "../../src/db/repositories.ts";
import type { FoodooDb } from "../../src/db/schema.ts";
import {
  columnIndex,
  columnName,
  readXlsx,
  writeXlsx,
} from "../../src/db/xlsx.ts";
import { crc32, unzip, zip } from "../../src/db/zip.ts";
import { makeTestDb } from "./testDb.ts";

const TODAY = "2026-03-02";
const STAMP = "2026-03-02T09:15";
let db: FoodooDb;

beforeEach(() => {
  db = makeTestDb();
});

afterEach(async () => {
  await db.delete();
});

async function snapshot() {
  return {
    stall: await db.stall.toArray(),
    menus: await db.menus.orderBy("id").toArray(),
    days: await db.days.orderBy("date").toArray(),
    menuDays: await db.menuDays.orderBy("[date+menuId]").toArray(),
  };
}

function encode(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

async function demoBackup(): Promise<Backup> {
  await loadDemo(db, TODAY);
  return buildBackup(db, STAMP);
}

function issuesOf(result: ImportResult) {
  expect(result.ok).toBe(false);
  return result.ok ? [] : result.issues;
}

async function importBytes(data: Uint8Array) {
  const stall = await db.stall.get("stall");
  return parseImport(data, { stall, menus: await db.menus.toArray() });
}

describe("DM-3/DM-4 round trips", () => {
  it.each(["json", "xlsx"] as const)(
    "%s: export, delete all, import restores identical data",
    async (format) => {
      await loadDemo(db, TODAY);
      const before = await snapshot();
      const file = await exportData(db, format, TODAY, STAMP);
      expect(file.filename).toBe(`foodoo-${TODAY}.${format}`);
      await deleteAll(db);
      expect((await snapshot()).menuDays).toEqual([]);

      const result = await importBytes(file.data);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.plan.kind).toBe("replace");
      await applyImport(db, result.plan);
      expect(await snapshot()).toEqual(before);
    },
  );

  it("csv: merges the history back into the same stall", async () => {
    await loadDemo(db, TODAY);
    const before = await snapshot();
    const file = await exportData(db, "csv", TODAY, STAMP);
    expect(file.mime).toBe("text/csv;charset=utf-8");
    const withHistory = new Set(before.menuDays.map((item) => item.date));
    await db.days.clear();
    await db.menuDays.clear();

    const result = await importBytes(file.data);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.plan.kind).toBe("merge");
    await applyImport(db, result.plan);
    const after = await snapshot();
    expect(after.menuDays).toEqual(before.menuDays);
    expect(after.days).toEqual(
      before.days.filter((day) => withHistory.has(day.date)),
    );
    expect(after.menus).toEqual(before.menus);
  });

  it("csv: merge needs a stall and the menus it names", async () => {
    await loadDemo(db, TODAY);
    const file = await exportData(db, "csv", TODAY, STAMP);
    expect(
      issuesOf(await parseImport(file.data, { stall: undefined, menus: [] })),
    ).toEqual([{ code: "noStall", where: "csv" }]);
    await db.menus.delete("nasi-uduk");
    const issues = issuesOf(await importBytes(file.data));
    expect(issues[0]?.code).toBe("unknownMenu");
    expect(issues.length).toBe(MAX_ISSUES);
    await deleteAll(db);
    await expect(
      applyImport(db, { kind: "merge", days: [], menuDays: [] }),
    ).rejects.toThrow();
  });

  it("refuses to export when there is no stall", async () => {
    await expect(exportData(db, "json", TODAY, STAMP)).rejects.toThrow();
  });
});

describe("DM-4 validation", () => {
  it("rejects unreadable and foreign files", async () => {
    expect(issuesOf(await importBytes(encode("{ broken")))).toEqual([
      { code: "unreadable", where: "json" },
    ]);
    expect(issuesOf(await importBytes(encode('{"hello": 1}')))).toEqual([
      { code: "wrongFormat", where: "format" },
    ]);
    expect(issuesOf(await importBytes(encode("PK not a zip")))).toEqual([
      { code: "unreadable", where: "xlsx" },
    ]);
  });

  it("rejects an unknown format or schema version", async () => {
    const backup = await demoBackup();
    expect(issuesOf(validateBackup({ ...backup, formatVersion: 2 }))).toEqual([
      { code: "unknownVersion", where: "formatVersion" },
    ]);
    expect(
      issuesOf(validateBackup({ ...backup, schemaVersion: 99 }))[0]?.code,
    ).toBe("unknownVersion");
  });

  it("reports each broken field with its place", async () => {
    const backup = await demoBackup();
    const [menu, second] = backup.menus;
    const [day] = backup.days;
    const [item] = backup.menuDays;
    if (!menu || !second || !day || !item) throw new Error("demo data");
    const broken = {
      ...backup,
      stall: {
        ...backup.stall,
        id: "other",
        name: "x".repeat(41),
        setupComplete: "yes",
        settings: {
          ...backup.stall.settings,
          isDemo: 1,
          busyProfile: { "06": 3 },
        },
      },
      menus: [
        { ...menu, cost: menu.price, archived: "no" },
        second,
        { ...second },
        "menu",
        { ...menu, id: "", price: "8000" },
      ],
      days: [
        { ...day, weekday: (day.weekday + 1) % 7 },
        { ...day, date: "2026-02-30", unusual: "x", closed: null },
        day,
        day,
        null,
      ],
      menuDays: [
        {
          ...item,
          leftover: 1000,
          soldOutAt: "25:00",
          suggestedQty: 1000,
          reason: { code: "magic" },
          cookedQty: 1000,
          estimatedDemand: -1,
          demandIsEstimate: "no",
          date: "yesterday",
        },
        { ...item, menuId: "ghost" },
        item,
        item,
        42,
      ],
    };
    const where = issuesOf(validateBackup(broken)).map(
      (issue) => `${issue.code}:${issue.where}`,
    );
    expect(where).toEqual(
      expect.arrayContaining([
        "badValue:stall.id",
        "badValue:stall.name",
        "badValue:stall.setupComplete",
        "badValue:stall.isDemo",
        "badValue:stall.busyProfile",
        "badValue:menus[1].archived",
        "duplicate:menus[3].id",
        "badValue:menus[4]",
        "badValue:menus[5].id",
      ]),
    );
    expect(where.length).toBe(MAX_ISSUES);

    const later = issuesOf(
      validateBackup({
        ...backup,
        days: broken.days,
        menuDays: broken.menuDays,
      }),
    ).map((issue) => `${issue.code}:${issue.where}`);
    expect(later).toEqual([
      "badValue:days[1].weekday",
      "badValue:days[2].date",
      "badValue:days[2].unusual",
      "badValue:days[2].closed",
      "duplicate:days[4].date",
      "badValue:days[5]",
      "badValue:menuDays[1].date",
      "badValue:menuDays[1].suggestedQty",
      "badValue:menuDays[1].reason",
      "badValue:menuDays[1].cookedQty",
      "badValue:menuDays[1].soldOutAt",
      "badValue:menuDays[1].leftover",
      "badValue:menuDays[1].estimatedDemand",
      "badValue:menuDays[1].demandIsEstimate",
      "unknownMenu:menuDays[2].menuId",
      "duplicate:menuDays[4].date",
      "badValue:menuDays[5]",
    ]);
  });

  it("checks the cost rule, the hours and the lists", async () => {
    const backup = await demoBackup();
    const [first] = backup.menuDays;
    if (!first) throw new Error("demo data");
    expect(
      issuesOf(
        validateBackup({
          ...backup,
          menuDays: [{ ...first, leftover: first.cookedQty + 1 }],
        }),
      ),
    ).toEqual([{ code: "badValue", where: "menuDays[1].leftover" }]);
    const [menu] = backup.menus;
    if (!menu) throw new Error("demo data");
    expect(
      issuesOf(
        validateBackup({ ...backup, menus: [{ ...menu, cost: menu.price }] }),
      )[0],
    ).toEqual({ code: "badValue", where: "menus[1].cost" });
    expect(
      issuesOf(
        validateBackup({
          ...backup,
          stall: {
            ...backup.stall,
            settings: {
              ...backup.stall.settings,
              closeAt: backup.stall.settings.openAt,
            },
          },
        }),
      ),
    ).toEqual([{ code: "badValue", where: "stall.openAt" }]);
    expect(
      issuesOf(
        validateBackup({
          ...backup,
          stall: {
            ...backup.stall,
            settings: { ...backup.stall.settings, busyProfile: null },
          },
        }),
      ),
    ).toEqual([{ code: "badValue", where: "stall.busyProfile" }]);
    expect(
      issuesOf(validateBackup({ ...backup, stall: null, days: "x" })),
    ).toEqual([
      { code: "badValue", where: "days" },
      { code: "badValue", where: "stall" },
    ]);
  });

  it("keeps the demo scenario and refuses a broken one", async () => {
    const backup = await demoBackup();
    expect(backup.stall.demo).toEqual({ scenario: 1, generatedFor: TODAY });
    const withDemo = (demo: unknown, isDemo = true) =>
      validateBackup({
        ...backup,
        stall: {
          ...backup.stall,
          demo,
          settings: { ...backup.stall.settings, isDemo },
        },
      });
    const demoOf = (result: ImportResult) =>
      result.ok && result.plan.kind === "replace"
        ? result.plan.backup.stall.demo
        : "invalid";
    expect(
      demoOf(withDemo({ scenario: 3, generatedFor: "2026-03-01" })),
    ).toEqual({
      scenario: 3,
      generatedFor: "2026-03-01",
    });
    expect(demoOf(withDemo(undefined))).toBeUndefined();
    for (const demo of [
      { scenario: 9, generatedFor: TODAY },
      { scenario: 1, generatedFor: "yesterday" },
      "1",
    ]) {
      expect(issuesOf(withDemo(demo))).toEqual([
        { code: "badValue", where: "stall.demo" },
      ]);
    }
    expect(
      issuesOf(withDemo({ scenario: 1, generatedFor: TODAY }, false)),
    ).toEqual([{ code: "badValue", where: "stall.demo" }]);
  });

  it("names a missing sheet or column and an empty file", async () => {
    const backup = await demoBackup();
    const sheets = backupSheets(backup);
    const noDays = await writeXlsx(
      sheets.filter((sheet) => sheet.name !== "Days"),
    );
    expect(issuesOf(await importBytes(noDays))).toEqual([
      { code: "missingSheet", where: "Days" },
    ]);
    const noPrice = await writeXlsx(
      sheets.map((sheet) =>
        sheet.name === "Menus"
          ? {
              ...sheet,
              rows: sheet.rows.map((row) => row.filter((_, i) => i !== 2)),
            }
          : sheet,
      ),
    );
    expect(issuesOf(await importBytes(noPrice))).toEqual([
      { code: "missingColumn", where: "Menus.price" },
    ]);
    const noStallRow = await writeXlsx(
      sheets.map((sheet) =>
        sheet.name === "Stall"
          ? { ...sheet, rows: sheet.rows.slice(0, 1) }
          : sheet,
      ),
    );
    expect(issuesOf(await importBytes(noStallRow))).toEqual([
      { code: "empty", where: "Stall" },
    ]);
    expect(issuesOf(await importBytes(encode("date;menuId\n")))[0]).toEqual({
      code: "missingColumn",
      where: "csv.weekday",
    });
    const header = (await encodeBackup(backup, "csv")).slice(0, 200);
    const headerLine = new TextDecoder().decode(header).split("\r\n")[0] ?? "";
    expect(issuesOf(await importBytes(encode(`${headerLine}\r\n`)))).toEqual([
      { code: "empty", where: "csv" },
    ]);
  });

  it("rejects csv rows that disagree about the same day", async () => {
    const backup = await demoBackup();
    const text = new TextDecoder().decode(await encodeBackup(backup, "csv"));
    const rows = parseCsvText(text);
    const header = rows[0] ?? [];
    const closed = header.indexOf("closed");
    const flipped = rows.map((row, index) =>
      index === 2 ? row.map((cell, i) => (i === closed ? "false" : cell)) : row,
    );
    expect(issuesOf(await importBytes(encode(toCsvText(flipped))))[0]).toEqual({
      code: "badValue",
      where: "csv[2].closed",
    });
  });

  it("accepts values a spreadsheet app rewrites", async () => {
    const backup = await demoBackup();
    const target = backup.menuDays.find((item) => item.soldOutAt === null);
    if (!target) throw new Error("demo data");
    const edited = { ...target, soldOutAt: "10:30" };
    const sheets = backupSheets({
      ...backup,
      menuDays: backup.menuDays.map((item) =>
        item === target ? edited : item,
      ),
    }).map((sheet) => {
      if (sheet.name !== "MenuDays") return sheet;
      const header = sheet.rows[0] ?? [];
      const time = header.indexOf("soldOutAt");
      const flag = header.indexOf("demandIsEstimate");
      return {
        ...sheet,
        rows: sheet.rows.map((row, index) =>
          index === 0
            ? row
            : row.map((cell, i) => {
                if (i === time && cell === "10:30") return 0.4375;
                if (i === flag) return cell === true ? "TRUE" : 0;
                return cell;
              }),
        ),
      };
    });
    const result = await importBytes(await writeXlsx(sheets));
    expect(result.ok).toBe(true);
    if (!result.ok || result.plan.kind !== "replace") return;
    const back = result.plan.backup.menuDays.find(
      (item) => item.date === target.date && item.menuId === target.menuId,
    );
    expect(back?.soldOutAt).toBe("10:30");
  });
});

describe("file codecs", () => {
  it("detects the format from the content", () => {
    expect(detectFormat(encode("PK\u0003\u0004"))).toBe("xlsx");
    expect(detectFormat(encode('\uFEFF  {"a":1}'))).toBe("json");
    expect(detectFormat(encode("date,menuId"))).toBe("csv");
  });

  it("csv: quotes, escapes and reads both delimiters", () => {
    const text = toCsvText([
      ["name", "note", "n", "flag", "empty"],
      ['Nasi "Uduk", spesial', "a;b\nc", 5, true, null],
    ]);
    expect(text.startsWith("\uFEFF")).toBe(true);
    expect(parseCsvText(text)).toEqual([
      ["name", "note", "n", "flag", "empty"],
      ['Nasi "Uduk", spesial', "a;b\nc", "5", "true", ""],
    ]);
    expect(parseCsvText("a;b;c\r\n1;2;3\n\n4;5;6")).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
      ["4", "5", "6"],
    ]);
  });

  it("zip: stores and deflates, and checks its input", async () => {
    const data = encode("hello hello hello hello");
    expect(crc32(encode("123456789"))).toBe(0xcbf43926);
    for (const compress of [true, false]) {
      const files = await unzip(
        await zip([{ name: "a/ü.txt", data }], compress),
      );
      expect(Array.from(files.get("a/ü.txt") ?? [])).toEqual(Array.from(data));
    }
    await expect(unzip(encode("not a zip at all, sorry"))).rejects.toThrow();
    const stored = await zip([{ name: "x", data }], false);
    const view = new DataView(stored.buffer);
    const central = stored.length - 22 - 47;
    view.setUint16(central + 10, 12, true);
    await expect(unzip(stored)).rejects.toThrow("Unsupported");
    view.setUint32(central, 0, true);
    await expect(unzip(stored)).rejects.toThrow("Broken zip directory");
    const local = await zip([{ name: "x", data }], false);
    new DataView(local.buffer).setUint32(0, 0, true);
    await expect(unzip(local)).rejects.toThrow("Broken zip entry");
  });

  it("xlsx: names columns and reads shared strings, gaps and odd cells", async () => {
    expect(columnName(0)).toBe("A");
    expect(columnName(27)).toBe("AB");
    expect(columnIndex("AB12")).toBe(27);
    expect(columnIndex("12")).toBe(0);
    const ns = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
    const rel =
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
    const files = [
      {
        name: "xl/workbook.xml",
        data: encode(
          `<workbook xmlns="${ns}" xmlns:r="${rel}"><sheets><sheet name="S" sheetId="1" r:id="rId1"/><sheet name="Lost" sheetId="2" r:id="rId9"/></sheets></workbook>`,
        ),
      },
      {
        name: "xl/_rels/workbook.xml.rels",
        data: encode(
          `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Target="/xl/worksheets/s.xml"/></Relationships>`,
        ),
      },
      {
        name: "xl/sharedStrings.xml",
        data: encode(
          `<sst xmlns="${ns}"><si><t>plain</t></si><si><r><t>ri</t></r><r><t>ch</t></r><rPh><t>skip</t></rPh></si></sst>`,
        ),
      },
      {
        name: "xl/worksheets/s.xml",
        data: encode(
          `<worksheet xmlns="${ns}"><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="C1" t="s"><v>1</v></c><c t="s"><v>7</v></c></row><row r="3"><c r="A3" t="str"><v>=f</v></c><c r="B3"/><c r="C3"><v>abc</v></c><c r="D3" t="b"><v>0</v></c></row><row><c r="A4" t="e"><v>#N/A</v></c></row></sheetData></worksheet>`,
        ),
      },
    ];
    const sheets = await readXlsx(await zip(files));
    expect([...sheets.keys()]).toEqual(["S"]);
    expect(sheets.get("S")).toEqual([
      ["plain", null, "rich", ""],
      [],
      ["=f", null, "abc", false],
      ["#N/A"],
    ]);
    await expect(readXlsx(await zip(files.slice(1)))).rejects.toThrow(
      "Missing xl/workbook.xml",
    );
    const broken = [
      { name: "xl/workbook.xml", data: encode("<workbook>") },
      ...files.slice(1),
    ];
    await expect(readXlsx(await zip(broken))).rejects.toThrow("Broken");
  });

  it("xlsx: writes escaped text, numbers, booleans and blanks", async () => {
    const data = await writeXlsx([
      { name: "A&B", rows: [['<x> & "y"\u0001', 3, false, null, "z"]] },
    ]);
    const sheets = await readXlsx(data);
    expect(sheets.get("A&B")).toEqual([['<x> & "y"', 3, false, null, "z"]]);
  });
});
