// tests/db/repositories.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  completeSetup,
  deleteAll,
  getStall,
  getStorageStatus,
  getTodayState,
  listMenus,
  loadDemo,
  refreshDemo,
  removeDemo,
  requestPersistentStorage,
  saveHours,
  saveMenu,
  saveStallName,
  setMenuArchived,
  startSetup,
} from "../../src/db/repositories.ts";
import type { FoodooDb } from "../../src/db/schema.ts";
import { DEMO_HISTORY_DAYS, DEMO_MENUS } from "../../src/demo/generator.ts";
import type { MenuInput } from "../../src/domain/setup.ts";
import { makeDay, makeMenuDay } from "../helpers.ts";
import { makeTestDb } from "./testDb.ts";

const TODAY = "2026-03-02";

const MENU_KEYS = [
  "archived",
  "cost",
  "id",
  "name",
  "price",
  "salvage",
  "usualQty",
];
const DAY_KEYS = ["closed", "date", "unusual", "weekday"];
const MENU_DAY_KEYS = [
  "cookedQty",
  "date",
  "demandIsEstimate",
  "estimatedDemand",
  "leftover",
  "menuId",
  "reason",
  "soldOutAt",
  "suggestedQty",
];

function input(overrides: Partial<MenuInput> = {}): MenuInput {
  return {
    name: "Nasi Uduk",
    price: 8000,
    cost: 4500,
    salvage: 0,
    usualQty: 40,
    ...overrides,
  };
}

let db: FoodooDb;

beforeEach(() => {
  db = makeTestDb();
});

afterEach(async () => {
  await db.delete();
});

async function tableCounts(): Promise<number[]> {
  return Promise.all([
    db.stall.count(),
    db.menus.count(),
    db.days.count(),
    db.menuDays.count(),
  ]);
}

describe("stall setup", () => {
  it("has no stall before setup starts", async () => {
    expect(await getStall(db)).toBeNull();
  });

  it("starts setup once with default hours, all normal, and keeps an existing stall", async () => {
    const stall = await startSetup(db);
    expect(stall.setupComplete).toBe(false);
    expect(stall.settings.isDemo).toBe(false);
    expect(stall.settings.openAt).toBe("06:00");
    expect(Object.values(stall.settings.busyProfile)).toEqual(
      Array.from({ length: 8 }, () => 2),
    );
    await saveStallName(db, "  Warung Bu Sri  ");
    expect((await startSetup(db)).name).toBe("Warung Bu Sri");
  });

  it("rejects a stall name over 40 characters and a missing stall", async () => {
    await expect(saveStallName(db, "x")).rejects.toThrow("No stall");
    await startSetup(db);
    await expect(saveStallName(db, "x".repeat(41))).rejects.toThrow(RangeError);
  });

  it("saves hours and fits the busy profile to them", async () => {
    await startSetup(db);
    await saveHours(db, {
      openAt: "07:00",
      closeAt: "10:00",
      busyProfile: { "07": 4, "13": 1 },
    });
    const stall = await getStall(db);
    expect(stall?.settings).toMatchObject({
      openAt: "07:00",
      closeAt: "10:00",
      busyProfile: { "07": 4, "08": 2, "09": 2 },
    });
  });

  it("refuses closing at the opening time", async () => {
    await startSetup(db);
    await expect(
      saveHours(db, { openAt: "14:00", closeAt: "14:00", busyProfile: {} }),
    ).rejects.toThrow(RangeError);
  });

  it("completes setup only with at least one active menu", async () => {
    await startSetup(db);
    await expect(completeSetup(db)).rejects.toThrow("at least one");
    const menu = await saveMenu(db, input());
    await setMenuArchived(db, menu.id, true);
    await expect(completeSetup(db)).rejects.toThrow("at least one");
    await setMenuArchived(db, menu.id, false);
    await completeSetup(db);
    expect((await getStall(db))?.setupComplete).toBe(true);
  });
});

describe("menus", () => {
  it("creates a menu with a new id, trims the name and lists by name", async () => {
    const tempe = await saveMenu(db, input({ name: " Tempe Orek " }));
    await saveMenu(db, input({ name: "Ayam Goreng" }));
    expect(tempe.name).toBe("Tempe Orek");
    expect(tempe.archived).toBe(false);
    expect(tempe.id.length).toBeGreaterThan(0);
    expect((await listMenus(db)).map((menu) => menu.name)).toEqual([
      "Ayam Goreng",
      "Tempe Orek",
    ]);
  });

  it("updates an existing menu in place and keeps its archive flag", async () => {
    const created = await saveMenu(db, input());
    await setMenuArchived(db, created.id, true);
    const updated = await saveMenu(
      db,
      input({ price: 9000, salvage: 500 }),
      created.id,
    );
    expect(updated).toEqual({
      ...created,
      price: 9000,
      salvage: 500,
      archived: true,
    });
    expect(await db.menus.count()).toBe(1);
  });

  it("blocks a cost that is not lower than the price", async () => {
    await expect(saveMenu(db, input({ cost: 8000 }))).rejects.toThrow(
      RangeError,
    );
    expect(await db.menus.count()).toBe(0);
  });

  it("fails on an unknown menu id", async () => {
    await expect(saveMenu(db, input(), "missing")).rejects.toThrow("not found");
    await expect(setMenuArchived(db, "missing", true)).rejects.toThrow(
      "not found",
    );
  });
});

describe("today state", () => {
  it("returns the day record and only that date's menu-days", async () => {
    await db.days.put(makeDay(TODAY, 1, { closed: false }));
    await db.menuDays.bulkPut([
      makeMenuDay(TODAY),
      makeMenuDay(TODAY, { menuId: "tempe" }),
      makeMenuDay("2026-03-01"),
    ]);
    const state = await getTodayState(db, TODAY);
    expect(state.day?.closed).toBe(false);
    expect(state.menuDays).toHaveLength(2);
    expect((await getTodayState(db, "2026-03-05")).day).toBeUndefined();
  });
});

describe("demo stall", () => {
  it("stores the demo stall with only owner-recordable fields", async () => {
    await loadDemo(db, TODAY);
    const stall = await getStall(db);
    expect(stall?.name).toContain("Demo");
    expect(stall?.setupComplete).toBe(true);
    expect(stall?.settings.isDemo).toBe(true);

    const menus = await db.menus.toArray();
    const days = await db.days.toArray();
    const menuDays = await db.menuDays.toArray();
    expect(menus).toHaveLength(DEMO_MENUS.length);
    expect(days).toHaveLength(DEMO_HISTORY_DAYS);
    expect(menuDays).toHaveLength(DEMO_HISTORY_DAYS * DEMO_MENUS.length);
    expect(Object.keys(stall ?? {}).sort()).toEqual([
      "demo",
      "id",
      "name",
      "settings",
      "setupComplete",
    ]);
    for (const menu of menus) {
      expect(Object.keys(menu).sort()).toEqual(MENU_KEYS);
    }
    for (const day of days) {
      expect(Object.keys(day).sort()).toEqual(DAY_KEYS);
    }
    for (const item of menuDays) {
      expect(Object.keys(item).sort()).toEqual(MENU_DAY_KEYS);
    }
    expect(days.at(-1)?.date).toBe("2026-03-01");
    expect(await db.days.get(TODAY)).toBeUndefined();
  });

  it("loads the selected demo scenario", async () => {
    await loadDemo(db, TODAY, 3);
    const stall = await getStall(db);
    expect(stall?.name).toBe("Demo Angkringan Malam");
    expect(stall?.settings.openAt).toBe("18:00");
    expect(stall?.settings.closeAt).toBe("02:00");
    expect(stall?.settings.isDemo).toBe(true);
    expect(await db.menus.get("nasi-kucing")).toBeDefined();
    await loadDemo(db, TODAY, 4);
    expect((await getStall(db))?.name).toBe("Demo Warung Baru Buka");
    expect(await db.menus.get("nasi-kucing")).toBeUndefined();
    expect(await db.days.count()).toBe(4);
  });

  it("moves the demo history up to a new day with the same scenario", async () => {
    await loadDemo(db, TODAY, 2);
    expect(await refreshDemo(db, TODAY)).toBe(false);
    expect(await refreshDemo(db, "2026-03-05")).toBe(true);
    const stall = await getStall(db);
    expect(stall?.name).toBe("Demo Warung Makan Kantor");
    expect(stall?.demo).toEqual({ scenario: 2, generatedFor: "2026-03-05" });
    const days = await db.days.orderBy("date").toArray();
    expect(days).toHaveLength(56);
    expect(days.at(-1)?.date).toBe("2026-03-04");
  });

  it("never refreshes the owner's own stall or a demo without its scenario", async () => {
    await startSetup(db);
    expect(await refreshDemo(db, "2026-03-05")).toBe(false);
    await deleteAll(db);
    expect(await refreshDemo(db, "2026-03-05")).toBe(false);
    await loadDemo(db, TODAY);
    const stall = await getStall(db);
    if (!stall) {
      throw new Error("demo stall missing");
    }
    const imported = { ...stall };
    delete imported.demo;
    await db.stall.put(imported);
    expect(await refreshDemo(db, "2026-03-05")).toBe(false);
    expect(await db.days.get("2026-03-04")).toBeUndefined();
  });

  it("reloads the demo from scratch when the demo is already stored", async () => {
    await loadDemo(db, TODAY);
    await db.days.put(makeDay(TODAY, 1, { closed: false }));
    await loadDemo(db, TODAY);
    expect(await db.days.get(TODAY)).toBeUndefined();
    expect(await db.days.count()).toBe(DEMO_HISTORY_DAYS);
  });

  it("refuses to overwrite the owner's own stall", async () => {
    await startSetup(db);
    await saveMenu(db, input());
    await expect(loadDemo(db, TODAY)).rejects.toThrow("delete it first");
    await expect(removeDemo(db)).rejects.toThrow("not the demo");
    expect(await db.menus.count()).toBe(1);
  });

  it("removes the demo and leaves every table empty", async () => {
    await loadDemo(db, TODAY);
    await removeDemo(db);
    expect(await tableCounts()).toEqual([0, 0, 0, 0]);
  });
});

describe("deleteAll", () => {
  it("empties every table", async () => {
    await startSetup(db);
    await saveMenu(db, input());
    await db.days.put(makeDay(TODAY, 1));
    await db.menuDays.put(makeMenuDay(TODAY));
    await deleteAll(db);
    expect(await tableCounts()).toEqual([0, 0, 0, 0]);
  });
});

describe("requestPersistentStorage", () => {
  it("returns false without a storage manager", async () => {
    expect(await requestPersistentStorage(undefined)).toBe(false);
  });

  it("does not ask again when storage is already persistent", async () => {
    const persist = vi.fn(() => Promise.resolve(true));
    const result = await requestPersistentStorage({
      persist,
      persisted: () => Promise.resolve(true),
    });
    expect(result).toBe(true);
    expect(persist).not.toHaveBeenCalled();
  });

  it("asks once and reports the browser's answer, or false on error", async () => {
    expect(
      await requestPersistentStorage({
        persist: () => Promise.resolve(false),
        persisted: () => Promise.resolve(false),
      }),
    ).toBe(false);
    expect(
      await requestPersistentStorage({
        persist: () => Promise.reject(new Error("blocked")),
        persisted: () => Promise.resolve(false),
      }),
    ).toBe(false);
  });
});

describe("getStorageStatus", () => {
  it("DM-5: reports kept, at risk or unknown", async () => {
    expect(await getStorageStatus(undefined)).toBe("unknown");
    expect(
      await getStorageStatus({ persisted: () => Promise.resolve(true) }),
    ).toBe("kept");
    expect(
      await getStorageStatus({ persisted: () => Promise.resolve(false) }),
    ).toBe("atRisk");
    expect(
      await getStorageStatus({
        persisted: () => Promise.reject(new Error("blocked")),
      }),
    ).toBe("unknown");
  });
});
