// tests/db/schema.test.ts
import { afterEach, describe, expect, it } from "vitest";
import {
  createDb,
  DB_NAME,
  SCHEMA_VERSIONS,
  type FoodooDb,
} from "../../src/db/schema.ts";
import { makeMenuDay } from "../helpers.ts";
import { makeTestDb } from "./testDb.ts";

let db: FoodooDb;

afterEach(async () => {
  await db.delete();
});

describe("schema v1", () => {
  it("uses the production name by default", () => {
    db = createDb();
    expect(db.name).toBe(DB_NAME);
  });

  it("declares exactly the v2 tables, keys and indexes", async () => {
    db = makeTestDb();
    await db.open();
    expect(db.verno).toBe(2);
    const shape = Object.fromEntries(
      db.tables.map((table) => [
        table.name,
        {
          primaryKey: table.schema.primKey.src,
          indexes: table.schema.indexes.map((index) => index.src).sort(),
        },
      ]),
    );
    expect(shape).toEqual({
      stall: { primaryKey: "id", indexes: [] },
      menus: { primaryKey: "id", indexes: [] },
      days: { primaryKey: "date", indexes: [] },
      menuDays: { primaryKey: "[date+menuId]", indexes: ["date", "menuId"] },
      sales: { primaryKey: "id", indexes: ["date", "groupId"] },
    });
  });

  it("keys menu-days by date and menu, so a second put replaces the first", async () => {
    db = makeTestDb();
    await db.menuDays.put(makeMenuDay("2026-03-02", { cookedQty: 40 }));
    await db.menuDays.put(makeMenuDay("2026-03-02", { cookedQty: 45 }));
    await db.menuDays.put(makeMenuDay("2026-03-03", { cookedQty: 30 }));
    expect(await db.menuDays.count()).toBe(2);
    const stored = await db.menuDays.get(["2026-03-02", "nasi-uduk"]);
    expect(stored?.cookedQty).toBe(45);
  });

  it("runs an upgrade step when a later version is added", async () => {
    const name = `foodoo-migration-${crypto.randomUUID()}`;
    const v1 = createDb(name, SCHEMA_VERSIONS.slice(0, 1));
    await v1.menuDays.put(makeMenuDay("2026-03-02"));
    v1.close();

    db = createDb(name, [
      ...SCHEMA_VERSIONS,
      {
        version: 3,
        stores: {},
        upgrade: async (transaction) => {
          await transaction
            .table("menuDays")
            .toCollection()
            .modify({ cookedQty: 99 });
        },
      },
    ]);
    await db.open();
    expect(db.verno).toBe(3);
    const stored = await db.menuDays.get(["2026-03-02", "nasi-uduk"]);
    expect(stored?.cookedQty).toBe(99);
  });
});
