// src/db/repositories.ts
import { closeDayRecords, type CloseEntry } from "../domain/close.ts";
import { isPlanLocked, isPlanQty } from "../domain/plan.ts";
import {
  CORRECTION_DAYS,
  isValidLine,
  markSoldOut,
  soldQty,
  type CartLine,
} from "../domain/pos.ts";
import { addDays, parseHHMM, weekdayOf } from "../domain/time.ts";
import {
  resizeProfile,
  validateHours,
  validateMenu,
  type MenuInput,
} from "../domain/setup.ts";
import type {
  BusyLevel,
  DayRecord,
  HHMM,
  ISODate,
  Menu,
  MenuDay,
  PayMethod,
  Reason,
  Sale,
  SalesMode,
  SoldOutSource,
  StallSettings,
} from "../domain/types.ts";
import {
  DEFAULT_DEMO_SCENARIO,
  type DemoMoment,
  type DemoScenarioId,
} from "../demo/catalog.ts";
import { STALL_ID, type FoodooDb, type StallRow } from "./schema.ts";

export const DEFAULT_OPEN_AT: HHMM = "06:00";
export const DEFAULT_CLOSE_AT: HHMM = "14:00";
export const STALL_NAME_MAX_LENGTH = 40;

export interface Hours {
  openAt: HHMM;
  closeAt: HHMM;
  busyProfile: Record<string, BusyLevel>;
}

export interface TodayState {
  day: DayRecord | undefined;
  menuDays: MenuDay[];
}

export interface History {
  days: DayRecord[];
  menuDays: MenuDay[];
}

export interface PlanEntry {
  menuId: string;
  suggestedQty: number | null;
  reason: Reason | null;
  cookedQty: number;
}

export interface CloseInput {
  unusual: boolean;
  entries: CloseEntry[];
}

export function defaultSettings(): StallSettings {
  return {
    openAt: DEFAULT_OPEN_AT,
    closeAt: DEFAULT_CLOSE_AT,
    busyProfile: resizeProfile({}, DEFAULT_OPEN_AT, DEFAULT_CLOSE_AT),
    isDemo: false,
  };
}

export function hoursOf(settings: StallSettings): Hours {
  return {
    openAt: settings.openAt,
    closeAt: settings.closeAt,
    busyProfile: { ...settings.busyProfile },
  };
}

function allTables(db: FoodooDb) {
  return [db.stall, db.menus, db.days, db.menuDays, db.sales];
}

async function requireStall(db: FoodooDb): Promise<StallRow> {
  const stall = await db.stall.get(STALL_ID);
  if (stall === undefined) {
    throw new Error("No stall has been set up");
  }
  return stall;
}

export async function getStall(db: FoodooDb): Promise<StallRow | null> {
  return (await db.stall.get(STALL_ID)) ?? null;
}

export async function startSetup(db: FoodooDb): Promise<StallRow> {
  return db.transaction("rw", db.stall, async () => {
    const existing = await db.stall.get(STALL_ID);
    if (existing !== undefined) {
      return existing;
    }
    const stall: StallRow = {
      id: STALL_ID,
      name: "",
      settings: defaultSettings(),
      setupComplete: false,
    };
    await db.stall.put(stall);
    return stall;
  });
}

export async function saveStallName(db: FoodooDb, name: string): Promise<void> {
  const trimmed = name.trim();
  if (trimmed.length > STALL_NAME_MAX_LENGTH) {
    throw new RangeError("Stall name is too long");
  }
  await db.transaction("rw", db.stall, async () => {
    const stall = await requireStall(db);
    await db.stall.put({ ...stall, name: trimmed });
  });
}

export async function saveHours(db: FoodooDb, hours: Hours): Promise<void> {
  const errors = validateHours(hours.openAt, hours.closeAt);
  if (Object.keys(errors).length > 0) {
    throw new RangeError("Invalid opening hours");
  }
  await db.transaction("rw", db.stall, async () => {
    const stall = await requireStall(db);
    await db.stall.put({
      ...stall,
      settings: {
        ...stall.settings,
        openAt: hours.openAt,
        closeAt: hours.closeAt,
        busyProfile: resizeProfile(
          hours.busyProfile,
          hours.openAt,
          hours.closeAt,
        ),
      },
    });
  });
}

export async function completeSetup(db: FoodooDb): Promise<void> {
  await db.transaction("rw", db.stall, db.menus, async () => {
    const stall = await requireStall(db);
    const active = await db.menus.filter((menu) => !menu.archived).count();
    if (active === 0) {
      throw new Error("Setup needs at least one active menu");
    }
    await db.stall.put({ ...stall, setupComplete: true });
  });
}

export async function listMenus(db: FoodooDb): Promise<Menu[]> {
  const menus = await db.menus.toArray();
  return menus.sort((a, b) => a.name.localeCompare(b.name));
}

export async function saveMenu(
  db: FoodooDb,
  input: MenuInput,
  id?: string,
): Promise<Menu> {
  const errors = validateMenu(input);
  if (Object.keys(errors).length > 0) {
    throw new RangeError("Invalid menu");
  }
  return db.transaction("rw", db.menus, async () => {
    const existing = id === undefined ? undefined : await db.menus.get(id);
    if (id !== undefined && existing === undefined) {
      throw new Error(`Menu not found: ${id}`);
    }
    const menu: Menu = {
      id: existing?.id ?? crypto.randomUUID(),
      name: input.name.trim(),
      price: input.price,
      cost: input.cost,
      salvage: input.salvage,
      usualQty: input.usualQty,
      archived: existing?.archived ?? false,
    };
    await db.menus.put(menu);
    return menu;
  });
}

export async function setMenuArchived(
  db: FoodooDb,
  id: string,
  archived: boolean,
): Promise<void> {
  const updated = await db.menus.update(id, { archived });
  if (updated === 0) {
    throw new Error(`Menu not found: ${id}`);
  }
}

export async function getTodayState(
  db: FoodooDb,
  date: ISODate,
): Promise<TodayState> {
  const [day, menuDays] = await Promise.all([
    db.days.get(date),
    db.menuDays.where("date").equals(date).toArray(),
  ]);
  return { day, menuDays };
}

export async function getHistory(db: FoodooDb): Promise<History> {
  const [days, menuDays] = await Promise.all([
    db.days.toArray(),
    db.menuDays.toArray(),
  ]);
  return { days, menuDays };
}

function assertOpenDay(day: DayRecord | undefined): void {
  if (day?.closed === true) {
    throw new Error("This day is already closed");
  }
}

export async function savePlan(
  db: FoodooDb,
  date: ISODate,
  entries: readonly PlanEntry[],
): Promise<void> {
  const weekday = weekdayOf(date);
  const ids = new Set(entries.map((entry) => entry.menuId));
  if (entries.length === 0 || ids.size !== entries.length) {
    throw new RangeError("A plan needs one entry per menu");
  }
  for (const entry of entries) {
    if (
      !isPlanQty(entry.cookedQty) ||
      (entry.suggestedQty !== null && !isPlanQty(entry.suggestedQty))
    ) {
      throw new RangeError(`Invalid quantity for ${entry.menuId}`);
    }
  }
  await db.transaction(
    "rw",
    db.days,
    db.menuDays,
    db.menus,
    db.sales,
    async () => {
      const day = await db.days.get(date);
      assertOpenDay(day);
      const existing = await db.menuDays.where("date").equals(date).toArray();
      if (
        isPlanLocked(existing) ||
        (await db.sales.where("date").equals(date).count()) > 0
      ) {
        throw new Error("The plan is locked after the first sell-out");
      }
      const known = await db.menus.bulkGet([...ids]);
      if (known.some((menu) => menu === undefined)) {
        throw new Error("The plan names an unknown menu");
      }
      const removed = existing
        .filter((row) => !ids.has(row.menuId))
        .map((row): [string, string] => [row.date, row.menuId]);
      await db.menuDays.bulkDelete(removed);
      await db.menuDays.bulkPut(
        entries.map((entry) => ({
          date,
          menuId: entry.menuId,
          suggestedQty: entry.suggestedQty,
          reason: entry.reason,
          cookedQty: entry.cookedQty,
          soldOutAt: null,
          leftover: null,
          estimatedDemand: null,
          demandIsEstimate: false,
        })),
      );
      if (day === undefined) {
        await db.days.put({ date, weekday, unusual: false, closed: false });
      }
    },
  );
}

export async function setSoldOut(
  db: FoodooDb,
  date: ISODate,
  menuId: string,
  time: HHMM | null,
  source: SoldOutSource = "manual",
): Promise<void> {
  if (time !== null) {
    parseHHMM(time);
  }
  await db.transaction("rw", db.days, db.menuDays, async () => {
    assertOpenDay(await db.days.get(date));
    const row = await db.menuDays.get([date, menuId]);
    if (row === undefined || row.cookedQty === 0) {
      throw new Error(`Nothing was cooked for ${menuId} on ${date}`);
    }
    await db.menuDays.put(markSoldOut(row, time, source));
  });
}

export function canCorrect(date: ISODate, today: ISODate): boolean {
  return date <= today && addDays(date, CORRECTION_DAYS) >= today;
}

export async function closeDay(
  db: FoodooDb,
  date: ISODate,
  input: CloseInput,
  correctionToday?: ISODate,
): Promise<void> {
  await db.transaction("rw", db.stall, db.days, db.menuDays, async () => {
    const stall = await requireStall(db);
    const existing = await db.days.get(date);
    if (existing?.closed === true) {
      if (correctionToday === undefined || !canCorrect(date, correctionToday)) {
        throw new Error("This day is already closed and cannot be corrected");
      }
    }
    const rows = await db.menuDays.where("date").equals(date).toArray();
    if (rows.length === 0) {
      throw new Error("Nothing was planned for this day");
    }
    const closed = closeDayRecords(
      date,
      input.unusual,
      rows,
      input.entries,
      stall.settings,
    );
    await db.menuDays.bulkPut(closed.menuDays);
    await db.days.put(closed.day);
  });
}

export async function loadDemo(
  db: FoodooDb,
  today: ISODate,
  scenario: DemoScenarioId = DEFAULT_DEMO_SCENARIO,
  moment?: DemoMoment,
): Promise<void> {
  const { buildDemoRecords } = await import("../demo/seed.ts");
  const records = buildDemoRecords(today, scenario, moment);
  await db.transaction("rw", allTables(db), async () => {
    const existing = await db.stall.get(STALL_ID);
    if (existing !== undefined && !existing.settings.isDemo) {
      throw new Error("Your own stall data exists; delete it first");
    }
    await Promise.all(allTables(db).map((table) => table.clear()));
    await db.stall.put(records.stall);
    await db.menus.bulkPut(records.menus);
    await db.days.bulkPut(records.days);
    await db.menuDays.bulkPut(records.menuDays);
  });
}

export async function refreshDemo(
  db: FoodooDb,
  today: ISODate,
): Promise<boolean> {
  const stall = await db.stall.get(STALL_ID);
  const demo = stall?.demo;
  if (
    stall === undefined ||
    !stall.settings.isDemo ||
    demo === undefined ||
    demo.generatedFor === today
  ) {
    return false;
  }
  await loadDemo(db, today, demo.scenario, demo.moment);
  return true;
}

export async function removeDemo(db: FoodooDb): Promise<void> {
  await db.transaction("rw", allTables(db), async () => {
    const stall = await db.stall.get(STALL_ID);
    if (stall !== undefined && !stall.settings.isDemo) {
      throw new Error("The stored stall is not the demo stall");
    }
    await Promise.all(allTables(db).map((table) => table.clear()));
  });
}

export async function deleteAll(db: FoodooDb): Promise<void> {
  await db.transaction("rw", allTables(db), async () => {
    await Promise.all(allTables(db).map((table) => table.clear()));
  });
}

export async function requestPersistentStorage(
  storage: Pick<StorageManager, "persist" | "persisted"> | undefined,
): Promise<boolean> {
  if (storage === undefined || typeof storage.persist !== "function") {
    return false;
  }
  try {
    if (await storage.persisted()) {
      return true;
    }
    return await storage.persist();
  } catch {
    return false;
  }
}

export type StorageStatus = "kept" | "atRisk" | "unknown";

export async function getStorageStatus(
  storage: Pick<StorageManager, "persisted"> | undefined,
): Promise<StorageStatus> {
  if (storage === undefined || typeof storage.persisted !== "function") {
    return "unknown";
  }
  try {
    return (await storage.persisted()) ? "kept" : "atRisk";
  } catch {
    return "unknown";
  }
}

export async function setMode(db: FoodooDb, mode: SalesMode): Promise<void> {
  await db.transaction("rw", db.stall, async () => {
    const stall = await requireStall(db);
    await db.stall.put({ ...stall, settings: { ...stall.settings, mode } });
  });
}

export async function listSales(db: FoodooDb, date: ISODate): Promise<Sale[]> {
  return db.sales.where("date").equals(date).toArray();
}

export interface RecordedSale {
  groupId: string;
  soldOutMenuIds: string[];
}

export async function recordSale(
  db: FoodooDb,
  date: ISODate,
  time: HHMM,
  createdAt: number,
  lines: readonly CartLine[],
  method: PayMethod,
): Promise<RecordedSale> {
  parseHHMM(time);
  const ids = new Set(lines.map((line) => line.menuId));
  if (lines.length === 0 || ids.size !== lines.length) {
    throw new RangeError("A sale needs one line per menu");
  }
  if (!lines.every(isValidLine)) {
    throw new RangeError("Invalid sale quantity");
  }
  return db.transaction(
    "rw",
    db.days,
    db.menuDays,
    db.menus,
    db.sales,
    async () => {
      assertOpenDay(await db.days.get(date));
      const before = await db.sales.where("date").equals(date).toArray();
      const groupId = crypto.randomUUID();
      const soldOutMenuIds: string[] = [];
      for (const line of lines) {
        const row = await db.menuDays.get([date, line.menuId]);
        const menu = await db.menus.get(line.menuId);
        if (row === undefined || row.cookedQty === 0 || menu === undefined) {
          throw new Error(`Nothing was cooked for ${line.menuId} on ${date}`);
        }
        await db.sales.add({
          id: crypto.randomUUID(),
          date,
          time,
          createdAt,
          groupId,
          menuId: line.menuId,
          qty: line.qty,
          unitPrice: menu.price,
          method,
        });
        const sold = soldQty(before, line.menuId) + line.qty;
        if (sold >= row.cookedQty && row.soldOutAt === null) {
          await db.menuDays.put(markSoldOut(row, time, "auto_pos"));
          soldOutMenuIds.push(line.menuId);
        }
      }
      return { groupId, soldOutMenuIds };
    },
  );
}

export async function voidLastSale(
  db: FoodooDb,
  date: ISODate,
): Promise<string[]> {
  return db.transaction("rw", db.days, db.menuDays, db.sales, async () => {
    assertOpenDay(await db.days.get(date));
    const all = await db.sales.where("date").equals(date).toArray();
    const last = all.reduce<Sale | undefined>(
      (best, sale) =>
        best === undefined || sale.createdAt > best.createdAt ? sale : best,
      undefined,
    );
    if (last === undefined) {
      throw new Error("There is no sale to void");
    }
    const removed = all.filter((sale) => sale.groupId === last.groupId);
    const kept = all.filter((sale) => sale.groupId !== last.groupId);
    await db.sales.bulkDelete(removed.map((sale) => sale.id));
    const reopened: string[] = [];
    for (const sale of removed) {
      const row = await db.menuDays.get([date, sale.menuId]);
      if (
        row?.soldOutSource === "auto_pos" &&
        soldQty(kept, sale.menuId) < row.cookedQty
      ) {
        await db.menuDays.put(markSoldOut(row, null, "auto_pos"));
        reopened.push(sale.menuId);
      }
    }
    return reopened;
  });
}
