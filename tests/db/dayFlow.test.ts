// tests/db/dayFlow.test.ts
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  closeDay,
  getHistory,
  loadDemo,
  savePlan,
  setSoldOut,
  type PlanEntry,
} from "../../src/db/repositories.ts";
import type { FoodooDb } from "../../src/db/schema.ts";
import { DEMO_HISTORY_DAYS, DEMO_MENUS } from "../../src/demo/generator.ts";
import { makeTestDb } from "./testDb.ts";

const TODAY = "2026-03-02";
const IDS = DEMO_MENUS.map((menu) => menu.id);

let db: FoodooDb;

beforeEach(async () => {
  db = makeTestDb();
  await loadDemo(db, TODAY);
});

afterEach(async () => {
  await db.delete();
});

function entries(cooked: Record<string, number> = {}): PlanEntry[] {
  return IDS.map((menuId) => ({
    menuId,
    suggestedQty: 40,
    reason: null,
    cookedQty: cooked[menuId] ?? 40,
  }));
}

async function row(menuId: string) {
  return db.menuDays.get([TODAY, menuId]);
}

describe("getHistory", () => {
  it("returns every stored day and menu-day", async () => {
    const history = await getHistory(db);
    expect(history.days).toHaveLength(DEMO_HISTORY_DAYS);
    expect(history.menuDays).toHaveLength(DEMO_HISTORY_DAYS * IDS.length);
  });
});

describe("savePlan", () => {
  it("PL-4: stores the suggested and the cooked quantity and opens the day", async () => {
    await savePlan(db, TODAY, entries({ "nasi-uduk": 45 }));
    expect(await row("nasi-uduk")).toMatchObject({
      suggestedQty: 40,
      cookedQty: 45,
      soldOutAt: null,
      leftover: null,
      estimatedDemand: null,
    });
    expect(await db.days.get(TODAY)).toEqual({
      date: TODAY,
      weekday: 1,
      unusual: false,
      closed: false,
    });
  });

  it("PL-5: saving again replaces the plan and drops menus no longer in it", async () => {
    await savePlan(db, TODAY, entries());
    await savePlan(db, TODAY, entries({ "nasi-uduk": 50 }).slice(0, 2));
    const today = await db.menuDays.where("date").equals(TODAY).toArray();
    expect(today).toHaveLength(2);
    expect((await row("nasi-uduk"))?.cookedQty).toBe(50);
  });

  it("PL-5: refuses to change the plan after a sell-out, and allows it again after undo", async () => {
    await savePlan(db, TODAY, entries());
    await setSoldOut(db, TODAY, "nasi-uduk", "10:30");
    await expect(savePlan(db, TODAY, entries())).rejects.toThrow(/locked/);
    await setSoldOut(db, TODAY, "nasi-uduk", null);
    await expect(savePlan(db, TODAY, entries())).resolves.toBeUndefined();
  });

  it("rejects invalid quantities, duplicate or unknown menus and an empty plan", async () => {
    await expect(
      savePlan(db, TODAY, entries({ "nasi-uduk": 1000 })),
    ).rejects.toThrow(RangeError);
    await expect(
      savePlan(db, TODAY, [{ ...entries()[0]!, suggestedQty: -1 }]),
    ).rejects.toThrow(RangeError);
    await expect(
      savePlan(db, TODAY, [entries()[0]!, entries()[0]!]),
    ).rejects.toThrow(RangeError);
    await expect(savePlan(db, TODAY, [])).rejects.toThrow(RangeError);
    await expect(
      savePlan(db, TODAY, [{ ...entries()[0]!, menuId: "nope" }]),
    ).rejects.toThrow(/unknown/);
  });
});

describe("setSoldOut", () => {
  it("SV-2, SV-3: stores the time and clears it on undo", async () => {
    await savePlan(db, TODAY, entries());
    await setSoldOut(db, TODAY, "nasi-uduk", "10:32");
    expect((await row("nasi-uduk"))?.soldOutAt).toBe("10:32");
    await setSoldOut(db, TODAY, "nasi-uduk", null);
    expect((await row("nasi-uduk"))?.soldOutAt).toBeNull();
  });

  it("refuses a bad time, an unplanned or uncooked menu and a closed day", async () => {
    await savePlan(db, TODAY, entries({ "tempe-orek": 0 }));
    await expect(setSoldOut(db, TODAY, "nasi-uduk", "10:61")).rejects.toThrow(
      RangeError,
    );
    await expect(setSoldOut(db, TODAY, "tempe-orek", "10:30")).rejects.toThrow(
      /Nothing was cooked/,
    );
    await expect(
      setSoldOut(db, "2026-03-03", "nasi-uduk", "10:30"),
    ).rejects.toThrow(/Nothing was cooked/);
    await db.days.update(TODAY, { closed: true });
    await expect(setSoldOut(db, TODAY, "nasi-uduk", "10:30")).rejects.toThrow(
      /closed/,
    );
  });
});

describe("closeDay", () => {
  it("CL-5: computes demand for every menu and closes the day", async () => {
    await savePlan(
      db,
      TODAY,
      entries({ "nasi-uduk": 42, "ayam-goreng": 31, "sayur-lodeh": 0 }),
    );
    await setSoldOut(db, TODAY, "nasi-uduk", "10:30");
    await closeDay(db, TODAY, {
      unusual: false,
      entries: [
        { menuId: "nasi-uduk", leftover: 0, soldOutAt: "10:30" },
        { menuId: "ayam-goreng", leftover: 3, soldOutAt: null },
        { menuId: "tempe-orek", leftover: 0, soldOutAt: "12:15" },
      ],
    });
    expect(await row("nasi-uduk")).toMatchObject({
      estimatedDemand: 81,
      demandIsEstimate: true,
    });
    expect(await row("ayam-goreng")).toMatchObject({
      estimatedDemand: 28,
      demandIsEstimate: false,
    });
    expect(await row("tempe-orek")).toMatchObject({
      soldOutAt: "12:15",
      estimatedDemand: 51,
      demandIsEstimate: true,
    });
    expect((await row("sayur-lodeh"))?.estimatedDemand).toBeNull();
    expect((await db.days.get(TODAY))?.closed).toBe(true);
    await expect(
      closeDay(db, TODAY, { unusual: false, entries: [] }),
    ).rejects.toThrow(/closed/);
  });

  it("CL-4: keeps an unusual day and its flag", async () => {
    await savePlan(db, TODAY, entries());
    await closeDay(db, TODAY, {
      unusual: true,
      entries: IDS.map((menuId) => ({
        menuId,
        leftover: 2,
        soldOutAt: null,
      })),
    });
    expect(await db.days.get(TODAY)).toMatchObject({
      unusual: true,
      closed: true,
    });
  });

  it("refuses to close a day with no plan", async () => {
    await expect(
      closeDay(db, TODAY, { unusual: false, entries: [] }),
    ).rejects.toThrow(/Nothing was planned/);
  });
});
