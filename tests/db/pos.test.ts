// tests/db/pos.test.ts
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  canCorrect,
  closeDay,
  deleteAll,
  getHistory,
  recordSale,
  savePlan,
  setMode,
  setSoldOut,
  voidLastSale,
} from "../../src/db/repositories.ts";
import type { FoodooDb } from "../../src/db/schema.ts";
import { makeTestDb } from "./testDb.ts";
import { freshStall, planDay } from "./pos.helpers.ts";

const DAY = "2026-03-02";
let db: FoodooDb;
let ids: string[];
let clockMs = 1_000;

beforeEach(async () => {
  db = makeTestDb();
  ids = await freshStall(db, "pos");
  await planDay(db, DAY, ids, 10);
});

afterEach(async () => {
  await db.delete();
});

function sell(time: string, lines: { menuId: string; qty: number }[]) {
  clockMs += 1_000;
  return recordSale(db, DAY, time, clockMs, lines, "cash");
}

async function menuDay(menuId: string) {
  return db.menuDays.get([DAY, menuId]);
}

describe("recordSale", () => {
  it("writes every line of one transaction under a single groupId", async () => {
    const result = await sell("08:00", [
      { menuId: ids[0]!, qty: 2 },
      { menuId: ids[1]!, qty: 3 },
    ]);
    const rows = await db.sales.toArray();
    expect(rows).toHaveLength(2);
    expect(new Set(rows.map((row) => row.groupId))).toEqual(
      new Set([result.groupId]),
    );
    expect(rows.map((row) => row.unitPrice).sort()).toEqual([8000, 9000]);
  });

  it("is atomic: a bad second line leaves no sale and no sold-out mark", async () => {
    await expect(
      sell("08:00", [
        { menuId: ids[0]!, qty: 10 },
        { menuId: "missing", qty: 1 },
      ]),
    ).rejects.toThrow();
    expect(await db.sales.count()).toBe(0);
    expect((await menuDay(ids[0]!))?.soldOutAt).toBeNull();
  });

  it("rejects empty carts, duplicate lines and bad quantities", async () => {
    await expect(sell("08:00", [])).rejects.toThrow();
    await expect(
      sell("08:00", [
        { menuId: ids[0]!, qty: 1 },
        { menuId: ids[0]!, qty: 1 },
      ]),
    ).rejects.toThrow();
    await expect(
      sell("08:00", [{ menuId: ids[0]!, qty: 0 }]),
    ).rejects.toThrow();
    expect(await db.sales.count()).toBe(0);
  });

  it("sets soldOutAt with source auto_pos when stock reaches 0", async () => {
    const first = await sell("09:00", [{ menuId: ids[0]!, qty: 6 }]);
    expect(first.soldOutMenuIds).toEqual([]);
    const second = await sell("10:30", [{ menuId: ids[0]!, qty: 4 }]);
    expect(second.soldOutMenuIds).toEqual([ids[0]]);
    expect(await menuDay(ids[0]!)).toMatchObject({
      soldOutAt: "10:30",
      soldOutSource: "auto_pos",
    });
  });

  it("keeps a manual sell-out time when stock later reaches 0", async () => {
    await setSoldOut(db, DAY, ids[0]!, "09:15");
    await sell("10:30", [{ menuId: ids[0]!, qty: 10 }]);
    expect(await menuDay(ids[0]!)).toMatchObject({
      soldOutAt: "09:15",
      soldOutSource: "manual",
    });
  });

  it("allows selling over the plan and keeps the first sell-out time", async () => {
    await sell("10:30", [{ menuId: ids[0]!, qty: 10 }]);
    const over = await sell("11:00", [{ menuId: ids[0]!, qty: 2 }]);
    expect(over.soldOutMenuIds).toEqual([]);
    expect((await menuDay(ids[0]!))?.soldOutAt).toBe("10:30");
    expect(await db.sales.count()).toBe(2);
  });

  it("refuses a date without a plan, so a day change mid-session records nothing", async () => {
    await expect(
      recordSale(
        db,
        "2026-03-03",
        "00:05",
        5,
        [{ menuId: ids[0]!, qty: 1 }],
        "qris",
      ),
    ).rejects.toThrow();
    expect(await db.sales.count()).toBe(0);
  });

  it("stores the sale under the date it was given", async () => {
    await planDay(db, "2026-03-03", ids, 10);
    await recordSale(
      db,
      "2026-03-03",
      "07:00",
      9,
      [{ menuId: ids[1]!, qty: 1 }],
      "qris",
    );
    expect((await db.sales.toArray())[0]).toMatchObject({
      date: "2026-03-03",
      method: "qris",
    });
  });
});

describe("voidLastSale", () => {
  it("removes the last transaction and cancels an auto sell-out", async () => {
    await sell("09:00", [{ menuId: ids[0]!, qty: 3 }]);
    await sell("10:30", [{ menuId: ids[0]!, qty: 7 }]);
    expect(await voidLastSale(db, DAY)).toEqual([ids[0]]);
    expect(await db.sales.count()).toBe(1);
    const row = await menuDay(ids[0]!);
    expect(row?.soldOutAt).toBeNull();
    expect(row?.soldOutSource).toBeUndefined();
  });

  it("keeps a manual sell-out and an auto one that is still covered by oversell", async () => {
    await setSoldOut(db, DAY, ids[1]!, "09:00");
    await sell("09:30", [{ menuId: ids[1]!, qty: 1 }]);
    await voidLastSale(db, DAY);
    expect((await menuDay(ids[1]!))?.soldOutAt).toBe("09:00");

    await sell("10:00", [{ menuId: ids[0]!, qty: 10 }]);
    await sell("10:05", [{ menuId: ids[0]!, qty: 1 }]);
    await voidLastSale(db, DAY);
    expect((await menuDay(ids[0]!))?.soldOutAt).toBe("10:00");
  });

  it("throws when there is nothing to void", async () => {
    await expect(voidLastSale(db, DAY)).rejects.toThrow();
  });
});

describe("closing with the register", () => {
  it("passes sold = cooked - leftover to the engine and keeps unknown_time", async () => {
    await sell("09:00", [{ menuId: ids[0]!, qty: 6 }]);
    await closeDay(db, DAY, {
      unusual: false,
      entries: [
        { menuId: ids[0]!, leftover: 4, soldOutAt: null },
        {
          menuId: ids[1]!,
          leftover: 0,
          soldOutAt: "14:00",
          soldOutSource: "unknown_time",
        },
      ],
    });
    const history = await getHistory(db);
    const first = history.menuDays.find((row) => row.menuId === ids[0]);
    const second = history.menuDays.find((row) => row.menuId === ids[1]);
    expect(first).toMatchObject({
      leftover: 4,
      estimatedDemand: 6,
      demandIsEstimate: false,
    });
    expect(second).toMatchObject({
      soldOutAt: "14:00",
      soldOutSource: "unknown_time",
      demandIsEstimate: true,
    });
  });

  it("cancels a sell-out mark when leftover is above 0", async () => {
    await setSoldOut(db, DAY, ids[0]!, "10:00");
    await closeDay(db, DAY, {
      unusual: false,
      entries: [
        { menuId: ids[0]!, leftover: 2, soldOutAt: null },
        { menuId: ids[1]!, leftover: 1, soldOutAt: null },
      ],
    });
    const row = await menuDay(ids[0]!);
    expect(row).toMatchObject({
      soldOutAt: null,
      leftover: 2,
      estimatedDemand: 8,
    });
    expect(row?.soldOutSource).toBeUndefined();
  });

  it("blocks plan edits once sales exist", async () => {
    await sell("08:00", [{ menuId: ids[0]!, qty: 1 }]);
    await expect(
      savePlan(db, DAY, [
        { menuId: ids[0]!, suggestedQty: 10, reason: null, cookedQty: 12 },
      ]),
    ).rejects.toThrow(/locked/);
  });
});

describe("correcting a closed day", () => {
  const entries = (leftover: number) => [
    { menuId: ids[0]!, leftover, soldOutAt: null },
    { menuId: ids[1]!, leftover: 1, soldOutAt: null },
  ];

  it("allows a correction for 7 days and re-estimates demand", async () => {
    await closeDay(db, DAY, { unusual: false, entries: entries(4) });
    await closeDay(
      db,
      DAY,
      { unusual: false, entries: entries(1) },
      "2026-03-09",
    );
    expect((await menuDay(ids[0]!))?.estimatedDemand).toBe(9);
  });

  it("refuses a correction on day 8 and refuses a plain second close", async () => {
    await closeDay(db, DAY, { unusual: false, entries: entries(4) });
    await expect(
      closeDay(db, DAY, { unusual: false, entries: entries(1) }, "2026-03-10"),
    ).rejects.toThrow(/closed/);
    await expect(
      closeDay(db, DAY, { unusual: false, entries: entries(1) }),
    ).rejects.toThrow(/closed/);
    expect(canCorrect(DAY, "2026-03-09")).toBe(true);
    expect(canCorrect(DAY, "2026-03-10")).toBe(false);
    expect(canCorrect(DAY, "2026-03-01")).toBe(false);
  });
});

describe("modes and privacy", () => {
  it("keeps Sale rows when switching to simple mode and back", async () => {
    await sell("08:00", [{ menuId: ids[0]!, qty: 2 }]);
    await setMode(db, "simple");
    expect(await db.sales.count()).toBe(1);
    expect((await db.stall.get("stall"))?.settings.mode).toBe("simple");
    await setMode(db, "pos");
    expect(await db.sales.count()).toBe(1);
  });

  it("delete-all removes sales too", async () => {
    await sell("08:00", [{ menuId: ids[0]!, qty: 2 }]);
    await deleteAll(db);
    expect(await db.sales.count()).toBe(0);
  });
});
