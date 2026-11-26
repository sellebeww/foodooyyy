// src/db/exportImport.ts
import { isDemoMoment, isDemoScenarioId } from "../demo/catalog.ts";
import { profileHours, validateHours, validateMenu } from "../domain/setup.ts";
import { formatHHMM, parseHHMM, weekdayOf } from "../domain/time.ts";
import type {
  BusyLevel,
  DayRecord,
  HHMM,
  ISODate,
  Menu,
  MenuDay,
  Reason,
  PayMethod,
  Sale,
  SoldOutSource,
  StallSettings,
} from "../domain/types.ts";
import { parseCsvText, toCsvText } from "./csv.ts";
import {
  SCHEMA_VERSIONS,
  STALL_ID,
  type FoodooDb,
  type StallRow,
} from "./schema.ts";
import { readXlsx, writeXlsx, type Cell } from "./xlsx.ts";

export const BACKUP_FORMAT = "foodoo-backup";
export const BACKUP_VERSION = 1;
export const SCHEMA_VERSION = Math.max(
  ...SCHEMA_VERSIONS.map((entry) => entry.version),
);
export const MAX_ISSUES = 20;

const QTY_MAX = 999;
const DEMAND_MAX = QTY_MAX * 3;
const MENU_ID_MAX = 64;
const RECORD_ID_MAX = 64;
const STALL_NAME_MAX = 40;
const MINUTES_PER_DAY = 1440;
const BUSY_LEVELS: readonly number[] = [1, 2, 4];
const REASON_CODES: readonly string[] = [
  "cold-start",
  "cold-start-up",
  "cold-start-down",
  "history",
];
const REASON_SCOPES: readonly string[] = ["weekday", "recent"];
const SALES_MODES: readonly string[] = ["simple", "pos"];
const SOLD_OUT_SOURCES: readonly string[] = [
  "manual",
  "auto_pos",
  "unknown_time",
];
const PAY_METHODS: readonly string[] = ["cash", "qris"];

export type ExportFormat = "json" | "csv" | "xlsx";

export interface Backup {
  format: typeof BACKUP_FORMAT;
  formatVersion: number;
  schemaVersion: number;
  exportedAt: string;
  stall: StallRow;
  menus: Menu[];
  days: DayRecord[];
  menuDays: MenuDay[];
  sales: Sale[];
}

export type ImportIssueCode =
  | "unreadable"
  | "wrongFormat"
  | "unknownVersion"
  | "missingSheet"
  | "missingColumn"
  | "badValue"
  | "unknownMenu"
  | "duplicate"
  | "noStall"
  | "empty";

export interface ImportIssue {
  code: ImportIssueCode;
  where: string;
}

export type ImportPlan =
  | { kind: "replace"; backup: Backup }
  | { kind: "merge"; days: DayRecord[]; menuDays: MenuDay[] };

export type ImportResult =
  { ok: true; plan: ImportPlan } | { ok: false; issues: ImportIssue[] };

export interface ExportFile {
  filename: string;
  mime: string;
  data: Uint8Array;
}

export interface ImportContext {
  stall: StallRow | undefined;
  menus: Menu[];
}

type Kind = "text" | "int" | "intOrNull" | "bool" | "timeOrNull" | "json";

interface Column {
  key: string;
  kind: Kind;
  optional?: boolean;
}

const STALL_COLUMNS: readonly Column[] = [
  { key: "format", kind: "text" },
  { key: "formatVersion", kind: "int" },
  { key: "schemaVersion", kind: "int" },
  { key: "exportedAt", kind: "text" },
  { key: "name", kind: "text" },
  { key: "openAt", kind: "timeOrNull" },
  { key: "closeAt", kind: "timeOrNull" },
  { key: "busyProfile", kind: "json" },
  { key: "isDemo", kind: "bool" },
  { key: "setupComplete", kind: "bool" },
  { key: "demo", kind: "json", optional: true },
  { key: "mode", kind: "text", optional: true },
];

const MENU_COLUMNS: readonly Column[] = [
  { key: "id", kind: "text" },
  { key: "name", kind: "text" },
  { key: "price", kind: "int" },
  { key: "cost", kind: "int" },
  { key: "salvage", kind: "int" },
  { key: "usualQty", kind: "int" },
  { key: "archived", kind: "bool" },
];

const DAY_COLUMNS: readonly Column[] = [
  { key: "date", kind: "text" },
  { key: "weekday", kind: "int" },
  { key: "unusual", kind: "bool" },
  { key: "closed", kind: "bool" },
];

const MENU_DAY_FIELDS: readonly Column[] = [
  { key: "menuId", kind: "text" },
  { key: "menuName", kind: "text", optional: true },
  { key: "suggestedQty", kind: "intOrNull" },
  { key: "cookedQty", kind: "int" },
  { key: "soldOutAt", kind: "timeOrNull" },
  { key: "leftover", kind: "intOrNull" },
  { key: "estimatedDemand", kind: "intOrNull" },
  { key: "demandIsEstimate", kind: "bool" },
  { key: "reason", kind: "json" },
  { key: "soldOutSource", kind: "text", optional: true },
];

const SALE_COLUMNS: readonly Column[] = [
  { key: "id", kind: "text" },
  { key: "date", kind: "text" },
  { key: "time", kind: "timeOrNull" },
  { key: "createdAt", kind: "int" },
  { key: "groupId", kind: "text" },
  { key: "menuId", kind: "text" },
  { key: "qty", kind: "int" },
  { key: "unitPrice", kind: "int" },
  { key: "method", kind: "text" },
];

const MENU_DAY_COLUMNS: readonly Column[] = [
  { key: "date", kind: "text" },
  ...MENU_DAY_FIELDS,
];

const CSV_COLUMNS: readonly Column[] = [...DAY_COLUMNS, ...MENU_DAY_FIELDS];

const SHEETS = {
  stall: "Stall",
  menus: "Menus",
  days: "Days",
  menuDays: "MenuDays",
  sales: "Sales",
} as const;

const REQUIRED_SHEETS: readonly string[] = [
  SHEETS.stall,
  SHEETS.menus,
  SHEETS.days,
  SHEETS.menuDays,
];

const MIME: Record<ExportFormat, string> = {
  json: "application/json",
  csv: "text/csv;charset=utf-8",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

class Issues {
  readonly list: ImportIssue[] = [];

  add(code: ImportIssueCode, where: string): void {
    if (this.list.length < MAX_ISSUES) {
      this.list.push({ code, where });
    }
  }

  get empty(): boolean {
    return this.list.length === 0;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isInt(value: unknown, min: number, max: number): value is number {
  return (
    Number.isSafeInteger(value) && Number(value) >= min && Number(value) <= max
  );
}

function isIsoDate(value: unknown): value is ISODate {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1));
  return date.toISOString().slice(0, 10) === value;
}

function isTime(value: unknown): value is HHMM {
  if (typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) {
    return false;
  }
  try {
    parseHHMM(value);
    return true;
  } catch {
    return false;
  }
}

function isAbsent(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

function isOneOf(value: unknown, options: readonly string[]): boolean {
  return typeof value === "string" && options.includes(value);
}

function checkReason(value: unknown): value is Reason {
  return (
    isRecord(value) &&
    typeof value.code === "string" &&
    REASON_CODES.includes(value.code) &&
    typeof value.scope === "string" &&
    REASON_SCOPES.includes(value.scope) &&
    isInt(value.observations, 0, Number.MAX_SAFE_INTEGER) &&
    isInt(value.soldOutDays, 0, Number.MAX_SAFE_INTEGER) &&
    isInt(value.leftoverDays, 0, Number.MAX_SAFE_INTEGER) &&
    isInt(value.delta, -QTY_MAX, QTY_MAX)
  );
}

function checkStall(raw: unknown, issues: Issues): StallRow | null {
  if (!isRecord(raw) || !isRecord(raw.settings)) {
    issues.add("badValue", "stall");
    return null;
  }
  const settings = raw.settings;
  let ok = true;
  const bad = (field: string) => {
    issues.add("badValue", `stall.${field}`);
    ok = false;
  };
  if (raw.id !== STALL_ID) bad("id");
  if (typeof raw.name !== "string" || raw.name.trim().length > STALL_NAME_MAX) {
    bad("name");
  }
  if (typeof raw.setupComplete !== "boolean") bad("setupComplete");
  if (typeof settings.isDemo !== "boolean") bad("isDemo");
  const mode = settings.mode;
  if (!isAbsent(mode) && !isOneOf(mode, SALES_MODES)) bad("mode");
  const demo = raw.demo ?? null;
  const demoValid =
    demo === null ||
    (isRecord(demo) &&
      settings.isDemo === true &&
      isDemoScenarioId(demo.scenario) &&
      isIsoDate(demo.generatedFor) &&
      (isAbsent(demo.moment) || isDemoMoment(demo.moment)));
  if (!demoValid) bad("demo");
  const openAt = settings.openAt;
  const closeAt = settings.closeAt;
  const hoursValid =
    isTime(openAt) &&
    isTime(closeAt) &&
    Object.keys(validateHours(openAt, closeAt)).length === 0;
  if (!hoursValid) bad("openAt");
  const profile = settings.busyProfile;
  if (hoursValid && isRecord(profile)) {
    const expected = profileHours(openAt, closeAt);
    const keys = Object.keys(profile);
    const matches =
      keys.length === expected.length &&
      expected.every((hour) => {
        const level = profile[hour];
        return typeof level === "number" && BUSY_LEVELS.includes(level);
      });
    if (!matches) bad("busyProfile");
  } else if (hoursValid) {
    bad("busyProfile");
  }
  if (!ok || !isTime(openAt) || !isTime(closeAt) || !isRecord(profile)) {
    return null;
  }
  const busyProfile: Record<string, BusyLevel> = {};
  for (const hour of profileHours(openAt, closeAt)) {
    busyProfile[hour] = profile[hour] as BusyLevel;
  }
  const clean: StallSettings = {
    openAt,
    closeAt,
    busyProfile,
    isDemo: settings.isDemo === true,
  };
  if (mode === "simple" || mode === "pos") {
    clean.mode = mode;
  }
  const row: StallRow = {
    id: STALL_ID,
    name: String(raw.name),
    settings: clean,
    setupComplete: raw.setupComplete === true,
  };
  if (
    isRecord(demo) &&
    isDemoScenarioId(demo.scenario) &&
    isIsoDate(demo.generatedFor)
  ) {
    row.demo = { scenario: demo.scenario, generatedFor: demo.generatedFor };
    if (isDemoMoment(demo.moment)) {
      row.demo.moment = demo.moment;
    }
  }
  return row;
}

function checkMenu(raw: unknown, where: string, issues: Issues): Menu | null {
  if (!isRecord(raw)) {
    issues.add("badValue", where);
    return null;
  }
  let ok = true;
  const bad = (field: string) => {
    issues.add("badValue", `${where}.${field}`);
    ok = false;
  };
  const { id, name, price, cost, salvage, usualQty, archived } = raw;
  if (typeof id !== "string" || id.length < 1 || id.length > MENU_ID_MAX) {
    bad("id");
  }
  if (typeof name !== "string") bad("name");
  if (typeof archived !== "boolean") bad("archived");
  const numbers = { price, cost, salvage, usualQty };
  for (const [field, value] of Object.entries(numbers)) {
    if (typeof value !== "number") bad(field);
  }
  if (!ok) {
    return null;
  }
  const menu: Menu = {
    id: String(id),
    name: String(name).trim(),
    price: Number(price),
    cost: Number(cost),
    salvage: Number(salvage),
    usualQty: Number(usualQty),
    archived: archived === true,
  };
  for (const field of Object.keys(validateMenu(menu))) {
    bad(field);
  }
  return ok ? menu : null;
}

function checkDay(
  raw: unknown,
  where: string,
  issues: Issues,
): DayRecord | null {
  if (!isRecord(raw)) {
    issues.add("badValue", where);
    return null;
  }
  let ok = true;
  const bad = (field: string) => {
    issues.add("badValue", `${where}.${field}`);
    ok = false;
  };
  const { date, weekday, unusual, closed } = raw;
  if (!isIsoDate(date)) {
    bad("date");
  } else if (weekday !== weekdayOf(date)) {
    bad("weekday");
  }
  if (typeof unusual !== "boolean") bad("unusual");
  if (typeof closed !== "boolean") bad("closed");
  if (!ok || !isIsoDate(date)) {
    return null;
  }
  return {
    date,
    weekday: weekdayOf(date),
    unusual: unusual === true,
    closed: closed === true,
  };
}

function checkMenuDay(
  raw: unknown,
  where: string,
  menuIds: ReadonlySet<string>,
  issues: Issues,
): MenuDay | null {
  if (!isRecord(raw)) {
    issues.add("badValue", where);
    return null;
  }
  let ok = true;
  const bad = (field: string) => {
    issues.add("badValue", `${where}.${field}`);
    ok = false;
  };
  const {
    date,
    menuId,
    suggestedQty,
    reason,
    cookedQty,
    soldOutAt,
    leftover,
    estimatedDemand,
    demandIsEstimate,
    soldOutSource,
  } = raw;
  if (!isIsoDate(date)) bad("date");
  if (typeof menuId !== "string" || !menuIds.has(menuId)) {
    issues.add("unknownMenu", `${where}.menuId`);
    ok = false;
  }
  if (suggestedQty !== null && !isInt(suggestedQty, 0, QTY_MAX)) {
    bad("suggestedQty");
  }
  if (reason !== null && !checkReason(reason)) bad("reason");
  if (!isInt(cookedQty, 0, QTY_MAX)) bad("cookedQty");
  if (soldOutAt !== null && !isTime(soldOutAt)) bad("soldOutAt");
  if (
    leftover !== null &&
    !isInt(leftover, 0, isInt(cookedQty, 0, QTY_MAX) ? cookedQty : QTY_MAX)
  ) {
    bad("leftover");
  }
  if (estimatedDemand !== null && !isInt(estimatedDemand, 0, DEMAND_MAX)) {
    bad("estimatedDemand");
  }
  if (typeof demandIsEstimate !== "boolean") bad("demandIsEstimate");
  if (!isAbsent(soldOutSource) && !isOneOf(soldOutSource, SOLD_OUT_SOURCES)) {
    bad("soldOutSource");
  }
  if (!ok) {
    return null;
  }
  const source = isAbsent(soldOutSource)
    ? {}
    : { soldOutSource: soldOutSource as SoldOutSource };
  return {
    ...source,
    date: date as ISODate,
    menuId: menuId as string,
    suggestedQty: suggestedQty as number | null,
    reason: reason === null ? null : (reason as Reason),
    cookedQty: cookedQty as number,
    soldOutAt: soldOutAt as HHMM | null,
    leftover: leftover as number | null,
    estimatedDemand: estimatedDemand as number | null,
    demandIsEstimate: demandIsEstimate === true,
  };
}

function checkSale(
  raw: unknown,
  where: string,
  menuIds: ReadonlySet<string>,
  issues: Issues,
): Sale | null {
  if (!isRecord(raw)) {
    issues.add("badValue", where);
    return null;
  }
  let ok = true;
  const bad = (field: string) => {
    issues.add("badValue", `${where}.${field}`);
    ok = false;
  };
  const { id, date, time, createdAt, groupId, menuId, qty, unitPrice, method } =
    raw;
  const isId = (value: unknown) =>
    typeof value === "string" &&
    value.length >= 1 &&
    value.length <= RECORD_ID_MAX;
  if (!isId(id)) bad("id");
  if (!isIsoDate(date)) bad("date");
  if (!isTime(time)) bad("time");
  if (!isInt(createdAt, 0, Number.MAX_SAFE_INTEGER)) bad("createdAt");
  if (!isId(groupId)) bad("groupId");
  if (typeof menuId !== "string" || !menuIds.has(menuId)) {
    issues.add("unknownMenu", `${where}.menuId`);
    ok = false;
  }
  if (!isInt(qty, 1, QTY_MAX)) bad("qty");
  if (!isInt(unitPrice, 0, Number.MAX_SAFE_INTEGER)) bad("unitPrice");
  if (!isOneOf(method, PAY_METHODS)) bad("method");
  if (!ok) {
    return null;
  }
  return {
    id: id as string,
    date: date as ISODate,
    time: time as HHMM,
    createdAt: createdAt as number,
    groupId: groupId as string,
    menuId: menuId as string,
    qty: qty as number,
    unitPrice: unitPrice as number,
    method: method as PayMethod,
  };
}

export function validateBackup(raw: unknown): ImportResult {
  const issues = new Issues();
  if (!isRecord(raw) || raw.format !== BACKUP_FORMAT) {
    return { ok: false, issues: [{ code: "wrongFormat", where: "format" }] };
  }
  if (
    raw.formatVersion !== BACKUP_VERSION ||
    !isInt(raw.schemaVersion, 1, SCHEMA_VERSION)
  ) {
    return {
      ok: false,
      issues: [{ code: "unknownVersion", where: "formatVersion" }],
    };
  }
  const lists = {
    menus: raw.menus,
    days: raw.days,
    menuDays: raw.menuDays,
    sales: raw.sales ?? [],
  };
  for (const [name, value] of Object.entries(lists)) {
    if (!Array.isArray(value)) {
      issues.add("badValue", name);
    }
  }
  const stall = checkStall(raw.stall, issues);
  if (
    !Array.isArray(lists.menus) ||
    !Array.isArray(lists.days) ||
    !Array.isArray(lists.menuDays) ||
    !Array.isArray(lists.sales)
  ) {
    return { ok: false, issues: issues.list };
  }

  const menus: Menu[] = [];
  const menuIds = new Set<string>();
  lists.menus.forEach((item: unknown, index) => {
    const menu = checkMenu(item, `menus[${index + 1}]`, issues);
    if (menu === null) return;
    if (menuIds.has(menu.id)) {
      issues.add("duplicate", `menus[${index + 1}].id`);
      return;
    }
    menuIds.add(menu.id);
    menus.push(menu);
  });

  const days: DayRecord[] = [];
  const dates = new Set<string>();
  lists.days.forEach((item: unknown, index) => {
    const day = checkDay(item, `days[${index + 1}]`, issues);
    if (day === null) return;
    if (dates.has(day.date)) {
      issues.add("duplicate", `days[${index + 1}].date`);
      return;
    }
    dates.add(day.date);
    days.push(day);
  });

  const menuDays: MenuDay[] = [];
  const pairs = new Set<string>();
  lists.menuDays.forEach((item: unknown, index) => {
    const where = `menuDays[${index + 1}]`;
    const menuDay = checkMenuDay(item, where, menuIds, issues);
    if (menuDay === null) return;
    const key = `${menuDay.date}|${menuDay.menuId}`;
    if (pairs.has(key)) {
      issues.add("duplicate", `${where}.date`);
      return;
    }
    pairs.add(key);
    menuDays.push(menuDay);
  });

  const sales: Sale[] = [];
  const saleIds = new Set<string>();
  lists.sales.forEach((item: unknown, index) => {
    const where = `sales[${index + 1}]`;
    const sale = checkSale(item, where, menuIds, issues);
    if (sale === null) return;
    if (saleIds.has(sale.id)) {
      issues.add("duplicate", `${where}.id`);
      return;
    }
    saleIds.add(sale.id);
    sales.push(sale);
  });

  if (stall === null || !issues.empty) {
    return { ok: false, issues: issues.list };
  }
  return {
    ok: true,
    plan: {
      kind: "replace",
      backup: {
        format: BACKUP_FORMAT,
        formatVersion: BACKUP_VERSION,
        schemaVersion: Number(raw.schemaVersion),
        exportedAt: typeof raw.exportedAt === "string" ? raw.exportedAt : "",
        stall,
        menus,
        days,
        menuDays,
        sales,
      },
    },
  };
}

function coerce(cell: Cell | undefined, kind: Kind): unknown {
  const value = cell ?? null;
  const text = typeof value === "string" ? value.trim() : null;
  switch (kind) {
    case "text":
      return value === null ? "" : String(value);
    case "int":
    case "intOrNull":
      if (value === null || text === "") {
        return kind === "intOrNull" ? null : value;
      }
      if (text !== null && /^-?\d+$/.test(text)) {
        return Number(text);
      }
      return value;
    case "bool":
      if (typeof value === "boolean") return value;
      if (value === 1 || text === "1" || text?.toLowerCase() === "true") {
        return true;
      }
      if (value === 0 || text === "0" || text?.toLowerCase() === "false") {
        return false;
      }
      return value;
    case "timeOrNull":
      if (value === null || text === "") return null;
      if (typeof value === "number" && value >= 0 && value < 1) {
        return formatHHMM(Math.round(value * MINUTES_PER_DAY));
      }
      return text ?? value;
    case "json":
      if (value === null || text === "") return null;
      if (text === null) return value;
      try {
        return JSON.parse(text) as unknown;
      } catch {
        return text;
      }
  }
}

function readTable(
  rows: readonly (readonly Cell[])[],
  columns: readonly Column[],
  table: string,
  issues: Issues,
): Record<string, unknown>[] {
  const header = (rows[0] ?? []).map((cell) =>
    cell === null ? "" : String(cell).trim(),
  );
  const indexes = new Map<string, number>();
  for (const column of columns) {
    const index = header.indexOf(column.key);
    if (index >= 0) {
      indexes.set(column.key, index);
    } else if (column.optional !== true) {
      issues.add("missingColumn", `${table}.${column.key}`);
    }
  }
  if (!issues.empty) {
    return [];
  }
  return rows.slice(1).map((row) => {
    const record: Record<string, unknown> = {};
    for (const column of columns) {
      const index = indexes.get(column.key);
      if (index !== undefined) {
        record[column.key] = coerce(row[index], column.kind);
      }
    }
    return record;
  });
}

function toCell(value: unknown, kind: Kind): Cell {
  if (value === null || value === undefined) {
    return null;
  }
  if (kind === "json") {
    return JSON.stringify(value);
  }
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  return JSON.stringify(value);
}

function writeTable(
  records: readonly Record<string, unknown>[],
  columns: readonly Column[],
): Cell[][] {
  return [
    columns.map((column) => column.key),
    ...records.map((record) =>
      columns.map((column) => toCell(record[column.key], column.kind)),
    ),
  ];
}

export async function buildBackup(
  db: FoodooDb,
  exportedAt: string,
): Promise<Backup> {
  const [stall, menus, days, menuDays, sales] = await Promise.all([
    db.stall.get(STALL_ID),
    db.menus.toArray(),
    db.days.orderBy("date").toArray(),
    db.menuDays.orderBy("[date+menuId]").toArray(),
    db.sales.orderBy("date").toArray(),
  ]);
  if (stall === undefined) {
    throw new Error("Nothing to export");
  }
  return {
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_VERSION,
    schemaVersion: SCHEMA_VERSION,
    exportedAt,
    stall,
    menus,
    days,
    menuDays,
    sales,
  };
}

function menuDayRecords(backup: Backup): Record<string, unknown>[] {
  const names = new Map(backup.menus.map((menu) => [menu.id, menu.name]));
  const dayByDate = new Map(backup.days.map((day) => [day.date, day]));
  return backup.menuDays.map((item) => {
    const day = dayByDate.get(item.date);
    return {
      ...item,
      menuName: names.get(item.menuId) ?? "",
      weekday: weekdayOf(item.date),
      unusual: day?.unusual ?? false,
      closed: day?.closed ?? false,
    };
  });
}

export function backupSheets(backup: Backup) {
  const stallRecord = {
    format: backup.format,
    formatVersion: backup.formatVersion,
    schemaVersion: backup.schemaVersion,
    exportedAt: backup.exportedAt,
    name: backup.stall.name,
    openAt: backup.stall.settings.openAt,
    closeAt: backup.stall.settings.closeAt,
    busyProfile: backup.stall.settings.busyProfile,
    isDemo: backup.stall.settings.isDemo,
    setupComplete: backup.stall.setupComplete,
    demo: backup.stall.demo ?? null,
    mode: backup.stall.settings.mode ?? null,
  };
  const records = menuDayRecords(backup);
  return [
    { name: SHEETS.stall, rows: writeTable([stallRecord], STALL_COLUMNS) },
    {
      name: SHEETS.menus,
      rows: writeTable(
        backup.menus as unknown as Record<string, unknown>[],
        MENU_COLUMNS,
      ),
    },
    {
      name: SHEETS.days,
      rows: writeTable(
        backup.days as unknown as Record<string, unknown>[],
        DAY_COLUMNS,
      ),
    },
    { name: SHEETS.menuDays, rows: writeTable(records, MENU_DAY_COLUMNS) },
    {
      name: SHEETS.sales,
      rows: writeTable(
        backup.sales as unknown as Record<string, unknown>[],
        SALE_COLUMNS,
      ),
    },
  ];
}

export async function encodeBackup(
  backup: Backup,
  format: ExportFormat,
): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  switch (format) {
    case "json":
      return encoder.encode(`${JSON.stringify(backup, null, 2)}\n`);
    case "csv":
      return encoder.encode(
        toCsvText(writeTable(menuDayRecords(backup), CSV_COLUMNS)),
      );
    case "xlsx":
      return writeXlsx(backupSheets(backup));
  }
}

export async function exportData(
  db: FoodooDb,
  format: ExportFormat,
  date: ISODate,
  exportedAt: string,
): Promise<ExportFile> {
  const backup = await buildBackup(db, exportedAt);
  return {
    filename: `foodoo-${date}.${format}`,
    mime: MIME[format],
    data: await encodeBackup(backup, format),
  };
}

function parseJson(text: string): ImportResult {
  try {
    return validateBackup(JSON.parse(text) as unknown);
  } catch {
    return { ok: false, issues: [{ code: "unreadable", where: "json" }] };
  }
}

async function parseXlsx(data: Uint8Array): Promise<ImportResult> {
  let sheets: Map<string, Cell[][]>;
  try {
    sheets = await readXlsx(data);
  } catch {
    return { ok: false, issues: [{ code: "unreadable", where: "xlsx" }] };
  }
  const issues = new Issues();
  for (const name of REQUIRED_SHEETS) {
    if (!sheets.has(name)) {
      issues.add("missingSheet", name);
    }
  }
  if (!issues.empty) {
    return { ok: false, issues: issues.list };
  }
  const read = (name: string, columns: readonly Column[]) =>
    readTable(sheets.get(name) ?? [], columns, name, issues);
  const [stallRecord] = read(SHEETS.stall, STALL_COLUMNS);
  const menus = read(SHEETS.menus, MENU_COLUMNS);
  const days = read(SHEETS.days, DAY_COLUMNS);
  const menuDays = read(SHEETS.menuDays, MENU_DAY_COLUMNS);
  const sales = sheets.has(SHEETS.sales)
    ? read(SHEETS.sales, SALE_COLUMNS)
    : [];
  if (!issues.empty) {
    return { ok: false, issues: issues.list };
  }
  if (stallRecord === undefined) {
    return { ok: false, issues: [{ code: "empty", where: SHEETS.stall }] };
  }
  return validateBackup({
    format: stallRecord.format,
    formatVersion: stallRecord.formatVersion,
    schemaVersion: stallRecord.schemaVersion,
    exportedAt: stallRecord.exportedAt,
    stall: {
      id: STALL_ID,
      name: stallRecord.name,
      setupComplete: stallRecord.setupComplete,
      demo: stallRecord.demo,
      settings: {
        openAt: stallRecord.openAt,
        closeAt: stallRecord.closeAt,
        busyProfile: stallRecord.busyProfile,
        isDemo: stallRecord.isDemo,
        mode: stallRecord.mode,
      },
    },
    menus,
    days,
    menuDays: menuDays.map(withoutName),
    sales,
  });
}

function withoutName(record: Record<string, unknown>): Record<string, unknown> {
  const copy = { ...record };
  delete copy.menuName;
  return copy;
}

function parseCsv(text: string, context: ImportContext): ImportResult {
  if (context.stall === undefined) {
    return { ok: false, issues: [{ code: "noStall", where: "csv" }] };
  }
  const issues = new Issues();
  const records = readTable(parseCsvText(text), CSV_COLUMNS, "csv", issues);
  if (!issues.empty) {
    return { ok: false, issues: issues.list };
  }
  if (records.length === 0) {
    return { ok: false, issues: [{ code: "empty", where: "csv" }] };
  }
  const days = new Map<string, Record<string, unknown>>();
  records.forEach((record, index) => {
    const day = {
      date: record.date,
      weekday: record.weekday,
      unusual: record.unusual,
      closed: record.closed,
    };
    const key = String(record.date);
    const seen = days.get(key);
    if (seen === undefined) {
      days.set(key, day);
    } else if (
      seen.unusual !== day.unusual ||
      seen.closed !== day.closed ||
      seen.weekday !== day.weekday
    ) {
      issues.add("badValue", `csv[${index + 1}].closed`);
    }
  });
  if (!issues.empty) {
    return { ok: false, issues: issues.list };
  }
  const result = validateBackup({
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_VERSION,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: "",
    stall: context.stall,
    menus: context.menus,
    days: [...days.values()],
    menuDays: records.map((record) => {
      const copy = withoutName(record);
      delete copy.weekday;
      delete copy.unusual;
      delete copy.closed;
      return copy;
    }),
  });
  if (!result.ok || result.plan.kind !== "replace") {
    return result;
  }
  return {
    ok: true,
    plan: {
      kind: "merge",
      days: result.plan.backup.days,
      menuDays: result.plan.backup.menuDays,
    },
  };
}

export function detectFormat(data: Uint8Array): ExportFormat {
  if (data[0] === 0x50 && data[1] === 0x4b) {
    return "xlsx";
  }
  const head = new TextDecoder()
    .decode(data.subarray(0, 64))
    .replace(/^\uFEFF/, "");
  return head.trimStart().startsWith("{") ? "json" : "csv";
}

export async function parseImport(
  data: Uint8Array,
  context: ImportContext,
): Promise<ImportResult> {
  const format = detectFormat(data);
  if (format === "xlsx") {
    return parseXlsx(data);
  }
  const text = new TextDecoder().decode(data);
  return format === "json" ? parseJson(text) : parseCsv(text, context);
}

export async function applyImport(
  db: FoodooDb,
  plan: ImportPlan,
): Promise<void> {
  const tables = [db.stall, db.menus, db.days, db.menuDays, db.sales];
  await db.transaction("rw", tables, async () => {
    if (plan.kind === "replace") {
      await Promise.all(tables.map((table) => table.clear()));
      await db.stall.put(plan.backup.stall);
      await db.menus.bulkPut(plan.backup.menus);
      await db.days.bulkPut(plan.backup.days);
      await db.menuDays.bulkPut(plan.backup.menuDays);
      await db.sales.bulkPut(plan.backup.sales);
      return;
    }
    if ((await db.stall.get(STALL_ID)) === undefined) {
      throw new Error("No stall to merge into");
    }
    await db.days.bulkPut(plan.days);
    await db.menuDays.bulkPut(plan.menuDays);
  });
}
