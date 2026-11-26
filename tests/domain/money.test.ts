// tests/domain/money.test.ts
import { describe, expect, it } from "vitest";
import { planMoney, weeklyMoney } from "../../src/domain/money.ts";
import { makeDay, makeMenu, makeMenuDay } from "../helpers.ts";

const END = "2026-02-10";

describe("planMoney", () => {
  it("MN-1: adds up cooking cost and the sales if every portion sells", () => {
    const rice = makeMenu();
    const egg = makeMenu({ id: "egg", price: 3000, cost: 2000 });
    expect(
      planMoney([
        { menu: rice, qty: 10 },
        { menu: egg, qty: 4 },
      ]),
    ).toEqual({ cost: 53_000, revenue: 92_000 });
    expect(planMoney([])).toEqual({ cost: 0, revenue: 0 });
  });
});

describe("weeklyMoney", () => {
  it("MN-2: prices leftovers at cost minus salvage and missed sales at margin", () => {
    const menus = [makeMenu({ salvage: 500 })];
    const days = [makeDay("2026-02-09", 1), makeDay(END, 2)];
    const menuDays = [
      makeMenuDay("2026-02-09", { leftover: 3, estimatedDemand: 37 }),
      makeMenuDay(END, {
        soldOutAt: "10:00",
        leftover: 0,
        estimatedDemand: 50,
        demandIsEstimate: true,
      }),
    ];
    expect(weeklyMoney(menuDays, days, menus, END)).toEqual({
      leftoverCost: 12_000,
      missedEarnings: 35_000,
    });
  });

  it("MN-2: skips unusual days, unknown menus and missing numbers", () => {
    const menus = [makeMenu({ cost: 100, salvage: 400 })];
    const days = [
      makeDay("2026-02-08", 0, { unusual: true }),
      makeDay("2026-02-09", 1),
      makeDay(END, 2),
    ];
    const menuDays = [
      makeMenuDay("2026-02-08", { leftover: 9 }),
      makeMenuDay("2026-02-09", { leftover: 5 }),
      makeMenuDay("2026-02-09", { menuId: "gone", leftover: 5 }),
      makeMenuDay(END, {
        soldOutAt: "13:00",
        leftover: null,
        estimatedDemand: null,
      }),
    ];
    expect(weeklyMoney(menuDays, days, menus, END)).toEqual({
      leftoverCost: 0,
      missedEarnings: 0,
    });
  });
});
