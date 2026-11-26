// tests/integration/twoDays.test.tsx
import { cleanup, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  closeDay,
  getHistory,
  recordSale,
  setSoldOut,
} from "../../src/db/repositories.ts";
import { buildBackup, validateBackup } from "../../src/db/exportImport.ts";
import type { FoodooDb } from "../../src/db/schema.ts";
import { tomorrowPlan } from "../../src/domain/close.ts";
import { dayRevenue, remainingQty } from "../../src/domain/pos.ts";
import { renderApp } from "../app/renderApp.tsx";
import { freshStall, planDay } from "../db/pos.helpers.ts";
import { makeTestDb } from "../db/testDb.ts";

vi.mock("../../src/app/registerPwa.ts", () => ({
  registerPwa: () => undefined,
}));

const DAY_1 = "2026-03-02";
const DAY_2 = "2026-03-03";
let db: FoodooDb;

beforeEach(() => {
  db = makeTestDb();
});

afterEach(async () => {
  cleanup();
  await db.delete();
});

async function assertValidBackup() {
  const backup = await buildBackup(db, "2026-03-04T00:00:00.000Z");
  const result = validateBackup(JSON.parse(JSON.stringify(backup)));
  expect(result.ok).toBe(true);
}

describe("two days in a row (register mode)", () => {
  it("day 1 sells out at 10:30, day 2 suggests more and explains it with numbers", async () => {
    const ids = await freshStall(db, "pos");
    const [soldOut, slow] = ids as [string, string];
    await planDay(db, DAY_1, ids, 40);
    await recordSale(
      db,
      DAY_1,
      "09:00",
      1,
      [{ menuId: soldOut, qty: 25 }],
      "cash",
    );
    const auto = await recordSale(
      db,
      DAY_1,
      "10:30",
      2,
      [{ menuId: soldOut, qty: 15 }],
      "qris",
    );
    await recordSale(
      db,
      DAY_1,
      "11:00",
      3,
      [{ menuId: slow, qty: 10 }],
      "cash",
    );
    expect(auto.soldOutMenuIds).toEqual([soldOut]);

    const rows = (await getHistory(db)).menuDays.filter(
      (row) => row.date === DAY_1,
    );
    const sales = await db.sales.toArray();
    await closeDay(db, DAY_1, {
      unusual: false,
      entries: rows.map((row) => ({
        menuId: row.menuId,
        leftover: row.soldOutAt === null ? remainingQty(row, sales) : 0,
        soldOutAt: row.soldOutAt,
      })),
    });

    const history = await getHistory(db);
    const day1 = history.menuDays.find(
      (row) => row.date === DAY_1 && row.menuId === soldOut,
    );
    expect(day1).toMatchObject({
      soldOutAt: "10:30",
      soldOutSource: "auto_pos",
      leftover: 0,
      estimatedDemand: 71,
      demandIsEstimate: true,
    });
    expect(history.days.find((day) => day.date === DAY_1)).toMatchObject({
      closed: true,
    });
    expect(
      dayRevenue(
        "pos",
        history.menuDays.filter((row) => row.date === DAY_1),
        [],
        sales,
      ),
    ).toBe(25 * 8000 + 15 * 8000 + 10 * 9000);

    const next = tomorrowPlan(
      DAY_1,
      await db.menus.toArray(),
      history.menuDays,
      history.days,
    );
    const up = next.suggestions.find((item) => item.menuId === soldOut);
    const down = next.suggestions.find((item) => item.menuId === slow);
    expect(up).toMatchObject({ qty: 44 });
    expect(up?.reason).toMatchObject({ code: "cold-start-up", delta: 4 });
    expect(down).toMatchObject({ qty: 36 });
    await assertValidBackup();

    renderApp({ db, path: "/plan", at: new Date(2026, 2, 3, 7) });
    expect(
      (
        await screen.findAllByText(
          "Not enough history yet. Starting from your usual 40, sold out last time → +4",
        )
      ).length,
    ).toBe(1);
    expect(
      screen.getByText(
        "Not enough history yet. Starting from your usual 40, leftovers last time → −4",
      ),
    ).toBeTruthy();
    expect(
      screen.getByLabelText<HTMLInputElement>("Portions of Menu 1").value,
    ).toBe("44");
    expect(
      screen.getByLabelText<HTMLInputElement>("Portions of Menu 2").value,
    ).toBe("36");
    expect(DAY_2 > DAY_1).toBe(true);
  });
});

describe("scripted full days produce valid records", () => {
  it("pos mode: plan, sell, void, close, correct", async () => {
    const ids = await freshStall(db, "pos", 3);
    await planDay(db, DAY_1, ids, 20);
    await recordSale(
      db,
      DAY_1,
      "08:00",
      1,
      [
        { menuId: ids[0]!, qty: 5 },
        { menuId: ids[1]!, qty: 20 },
      ],
      "cash",
    );
    await recordSale(
      db,
      DAY_1,
      "08:30",
      2,
      [{ menuId: ids[2]!, qty: 3 }],
      "qris",
    );
    const { voidLastSale } = await import("../../src/db/repositories.ts");
    await voidLastSale(db, DAY_1);
    const sales = await db.sales.toArray();
    const rows = (await getHistory(db)).menuDays;
    const entries = rows.map((row) => ({
      menuId: row.menuId,
      leftover: row.soldOutAt === null ? remainingQty(row, sales) : 0,
      soldOutAt: row.soldOutAt,
    }));
    await closeDay(db, DAY_1, { unusual: false, entries });
    await closeDay(db, DAY_1, { unusual: false, entries }, DAY_2);
    const history = await getHistory(db);
    expect(history.days).toEqual([
      { date: DAY_1, weekday: 1, unusual: false, closed: true },
    ]);
    for (const row of history.menuDays) {
      expect(row.estimatedDemand).not.toBeNull();
      expect(row.leftover).not.toBeNull();
      expect(row.cookedQty - (row.leftover ?? 0)).toBeLessThanOrEqual(
        row.cookedQty,
      );
    }
    expect(dayRevenue("pos", history.menuDays, [], sales)).toBe(
      5 * 8000 + 20 * 9000,
    );
    await assertValidBackup();
  });

  it("simple mode: no Sale rows at all, revenue is sold x price", async () => {
    const ids = await freshStall(db, "simple", 2);
    await planDay(db, DAY_1, ids, 20);
    await setSoldOut(db, DAY_1, ids[0]!, "10:30");
    await closeDay(db, DAY_1, {
      unusual: false,
      entries: [
        { menuId: ids[0]!, leftover: 0, soldOutAt: "10:30" },
        { menuId: ids[1]!, leftover: 5, soldOutAt: null },
      ],
    });
    expect(await db.sales.count()).toBe(0);
    const history = await getHistory(db);
    const menus = await db.menus.toArray();
    expect(history.days[0]).toMatchObject({ closed: true });
    expect(dayRevenue("simple", history.menuDays, menus, [])).toBe(
      20 * 8000 + 15 * 9000,
    );
    expect(
      history.menuDays.find((row) => row.menuId === ids[0])?.soldOutSource,
    ).toBe("manual");
    await assertValidBackup();
  });
});
