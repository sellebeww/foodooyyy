// tests/db/migration.test.ts
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  closeDay,
  getHistory,
  loadDemo,
  savePlan,
  setSoldOut,
} from "../../src/db/repositories.ts";
import {
  createDb,
  SCHEMA_VERSIONS,
  type FoodooDb,
  type SchemaVersion,
} from "../../src/db/schema.ts";
import { DEMO_MENUS } from "../../src/demo/generator.ts";

const TODAY = "2026-03-02";

const LATEST = SCHEMA_VERSIONS[SCHEMA_VERSIONS.length - 1]!;

const NEXT_VERSION: SchemaVersion = {
  version: LATEST.version + 1,
  stores: { ...LATEST.stores, menus: "id, name" },
};

let name: string;
let db: FoodooDb | undefined;

async function snapshot(target: FoodooDb) {
  return {
    stall: await target.stall.toArray(),
    menus: await target.menus.toArray(),
    days: await target.days.toArray(),
    menuDays: await target.menuDays.toArray(),
    sales: await target.sales.toArray(),
  };
}

async function fillLikeAnOwner(target: FoodooDb) {
  await loadDemo(target, TODAY);
  await savePlan(
    target,
    TODAY,
    DEMO_MENUS.map((menu) => ({
      menuId: menu.id,
      suggestedQty: 40,
      reason: null,
      cookedQty: menu.id === "nasi-uduk" ? 42 : 31,
    })),
  );
  await setSoldOut(target, TODAY, "nasi-uduk", "10:30");
  await closeDay(target, TODAY, {
    unusual: false,
    entries: DEMO_MENUS.map((menu) =>
      menu.id === "nasi-uduk"
        ? { menuId: menu.id, leftover: 0, soldOutAt: "10:30" }
        : { menuId: menu.id, leftover: 3, soldOutAt: null },
    ),
  });
}

beforeEach(() => {
  name = `foodoo-upgrade-${crypto.randomUUID()}`;
  db = undefined;
});

afterEach(async () => {
  if (db !== undefined) {
    await db.delete();
  }
});

describe("data survives an app update", () => {
  it("keeps every row identical when a later schema version is added", async () => {
    const v1 = createDb(name);
    await fillLikeAnOwner(v1);
    const before = await snapshot(v1);
    expect(before.menuDays.length).toBeGreaterThan(200);
    expect(
      before.menuDays.find(
        (row) => row.date === TODAY && row.menuId === "nasi-uduk",
      ),
    ).toMatchObject({ estimatedDemand: 81, demandIsEstimate: true });
    v1.close();

    db = createDb(name, [...SCHEMA_VERSIONS, NEXT_VERSION]);
    await db.open();
    expect(db.verno).toBe(NEXT_VERSION.version);
    expect(await snapshot(db)).toEqual(before);
    expect(await db.menus.where("name").equals("Nasi Uduk").count()).toBe(1);
  });

  it("keeps the data when the same version is opened again after a reload", async () => {
    const first = createDb(name);
    await fillLikeAnOwner(first);
    const before = await snapshot(first);
    first.close();

    db = createDb(name);
    await db.open();
    expect(db.verno).toBe(LATEST.version);
    expect(await snapshot(db)).toEqual(before);
    const history = await getHistory(db);
    expect(history.days.find((day) => day.date === TODAY)?.closed).toBe(true);
  });
});
