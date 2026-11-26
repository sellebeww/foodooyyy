// tests/domain/metrics.test.ts
import { describe, expect, it } from "vitest";
import {
  dayRows,
  menuSeries,
  menuTotals,
  pastDays,
  soldPortions,
  weeklyMetrics,
} from "../../src/domain/metrics.ts";
import { makeDay, makeMenuDay } from "../helpers.ts";

describe("weeklyMetrics", () => {
  it("returns zeros and a null acceptance share with no data", () => {
    expect(weeklyMetrics([], [], "2026-02-10")).toEqual({
      menuDayCount: 0,
      leftoverPortions: 0,
      sellOutEvents: 0,
      sellOutFrequency: 0,
      estimatedLostSales: 0,
      suggestedCount: 0,
      acceptedWithoutEdit: 0,
      acceptanceShare: null,
      byMenu: {},
    });
  });

  it("breaks the same totals down per menu", () => {
    const days = [makeDay("2026-02-09", 1), makeDay("2026-02-10", 2)];
    const menuDays = [
      makeMenuDay("2026-02-09", {
        suggestedQty: 40,
        cookedQty: 40,
        leftover: 4,
      }),
      makeMenuDay("2026-02-10", {
        suggestedQty: 42,
        cookedQty: 42,
        soldOutAt: "10:30",
        leftover: 0,
        estimatedDemand: 81,
        demandIsEstimate: true,
      }),
      makeMenuDay("2026-02-09", {
        menuId: "ayam-goreng",
        suggestedQty: 30,
        cookedQty: 31,
        leftover: 3,
        estimatedDemand: 28,
      }),
    ];
    const result = weeklyMetrics(menuDays, days, "2026-02-10");
    expect(Object.keys(result.byMenu)).toEqual(["nasi-uduk", "ayam-goreng"]);
    expect(result.byMenu["nasi-uduk"]).toEqual({
      menuDayCount: 2,
      leftoverPortions: 4,
      sellOutEvents: 1,
      sellOutFrequency: 0.5,
      estimatedLostSales: 39,
      suggestedCount: 2,
      acceptedWithoutEdit: 2,
      acceptanceShare: 1,
    });
    expect(result.byMenu["ayam-goreng"]).toEqual({
      menuDayCount: 1,
      leftoverPortions: 3,
      sellOutEvents: 0,
      sellOutFrequency: 0,
      estimatedLostSales: 0,
      suggestedCount: 1,
      acceptedWithoutEdit: 0,
      acceptanceShare: 0,
    });
    expect(result.leftoverPortions).toBe(7);
    expect(result.estimatedLostSales).toBe(39);
    expect(result.acceptanceShare).toBeCloseTo(2 / 3, 10);
  });

  it("sums leftovers, sell-outs, lost sales and acceptance over closed normal days in the window", () => {
    const days = [
      makeDay("2026-02-04", 3),
      makeDay("2026-02-05", 4),
      makeDay("2026-02-06", 5, { unusual: true }),
      makeDay("2026-02-07", 6, { closed: false }),
      makeDay("2026-02-10", 2),
      makeDay("2026-02-03", 2),
    ];
    const menuDays = [
      makeMenuDay("2026-02-04", {
        suggestedQty: 40,
        cookedQty: 40,
        leftover: 5,
      }),
      makeMenuDay("2026-02-05", {
        suggestedQty: 40,
        cookedQty: 45,
        soldOutAt: "10:30",
        leftover: 0,
        estimatedDemand: 80,
        demandIsEstimate: true,
      }),
      makeMenuDay("2026-02-06", { leftover: 99 }),
      makeMenuDay("2026-02-07", { leftover: 99 }),
      makeMenuDay("2026-02-10", { leftover: null }),
      makeMenuDay("2026-02-03", { leftover: 99 }),
    ];
    const result = weeklyMetrics(menuDays, days, "2026-02-10");
    expect(result.menuDayCount).toBe(3);
    expect(result.leftoverPortions).toBe(5);
    expect(result.sellOutEvents).toBe(1);
    expect(result.sellOutFrequency).toBeCloseTo(1 / 3, 10);
    expect(result.estimatedLostSales).toBe(35);
    expect(result.suggestedCount).toBe(2);
    expect(result.acceptedWithoutEdit).toBe(1);
    expect(result.acceptanceShare).toBe(0.5);
  });

  it("counts a sell-out without an estimate as zero lost sales", () => {
    const days = [makeDay("2026-02-10", 2)];
    const menuDays = [
      makeMenuDay("2026-02-10", {
        soldOutAt: "10:30",
        estimatedDemand: null,
      }),
    ];
    const result = weeklyMetrics(menuDays, days, "2026-02-10");
    expect(result.sellOutEvents).toBe(1);
    expect(result.estimatedLostSales).toBe(0);
  });

  it("never reports negative lost sales", () => {
    const days = [makeDay("2026-02-10", 2)];
    const menuDays = [
      makeMenuDay("2026-02-10", {
        cookedQty: 40,
        soldOutAt: "13:55",
        estimatedDemand: 30,
      }),
    ];
    expect(weeklyMetrics(menuDays, days, "2026-02-10").estimatedLostSales).toBe(
      0,
    );
  });
});

describe("soldPortions", () => {
  it("counts every cooked portion as sold on a sold-out day", () => {
    expect(
      soldPortions(
        makeMenuDay("2026-02-10", { cookedQty: 42, soldOutAt: "10:30" }),
      ),
    ).toBe(42);
  });

  it("subtracts the leftover, and is unknown when the leftover is missing", () => {
    expect(
      soldPortions(makeMenuDay("2026-02-10", { cookedQty: 31, leftover: 3 })),
    ).toBe(28);
    expect(
      soldPortions(makeMenuDay("2026-02-10", { leftover: null })),
    ).toBeNull();
  });
});

describe("WS-2 menuTotals", () => {
  it("sums closed usual days in the window per menu and flags estimates", () => {
    const days = [
      makeDay("2026-02-03", 2),
      makeDay("2026-02-09", 1),
      makeDay("2026-02-10", 2),
      makeDay("2026-02-08", 0, { unusual: true }),
    ];
    const menuDays = [
      makeMenuDay("2026-02-03", { cookedQty: 99, leftover: 9 }),
      makeMenuDay("2026-02-08", { cookedQty: 99, leftover: 9 }),
      makeMenuDay("2026-02-09", {
        cookedQty: 40,
        leftover: 4,
        estimatedDemand: 36,
      }),
      makeMenuDay("2026-02-10", {
        cookedQty: 42,
        soldOutAt: "10:30",
        leftover: 0,
        estimatedDemand: 81,
        demandIsEstimate: true,
      }),
      makeMenuDay("2026-02-10", {
        menuId: "ayam-goreng",
        cookedQty: 30,
        leftover: null,
        estimatedDemand: null,
      }),
    ];
    expect(menuTotals(menuDays, days, "2026-02-10")).toEqual({
      "nasi-uduk": {
        days: 2,
        cooked: 82,
        sold: 78,
        leftover: 4,
        demand: 117,
        demandHasEstimate: true,
      },
      "ayam-goreng": {
        days: 1,
        cooked: 30,
        sold: 0,
        leftover: 0,
        demand: 0,
        demandHasEstimate: false,
      },
    });
  });
});

describe("WS-3 menuSeries", () => {
  it("returns one row per counted day for the menu, oldest first", () => {
    const days = [
      makeDay("2026-02-10", 2),
      makeDay("2026-02-09", 1),
      makeDay("2026-02-08", 0, { closed: false }),
    ];
    const menuDays = [
      makeMenuDay("2026-02-10", {
        cookedQty: 42,
        soldOutAt: "10:30",
        estimatedDemand: 81,
        demandIsEstimate: true,
      }),
      makeMenuDay("2026-02-09", { cookedQty: 40, leftover: 2 }),
      makeMenuDay("2026-02-08", { cookedQty: 40 }),
      makeMenuDay("2026-02-10", { menuId: "ayam-goreng" }),
    ];
    expect(menuSeries(menuDays, days, "nasi-uduk", "2026-02-10")).toEqual([
      {
        date: "2026-02-09",
        cooked: 40,
        sold: 38,
        leftover: 2,
        soldOutAt: null,
        demand: 40,
        isEstimate: false,
      },
      {
        date: "2026-02-10",
        cooked: 42,
        sold: 42,
        leftover: 0,
        soldOutAt: "10:30",
        demand: 81,
        isEstimate: true,
      },
    ]);
  });

  it("does not flag a missing demand as an estimate", () => {
    expect(
      dayRows([
        makeMenuDay("2026-02-10", {
          estimatedDemand: null,
          demandIsEstimate: true,
        }),
      ])[0]?.isEstimate,
    ).toBe(false);
  });
});

describe("pastDays", () => {
  it("lists every recorded day up to the end date, newest first", () => {
    const days = [
      makeDay("2026-02-09", 1),
      makeDay("2026-02-10", 2, { closed: false, unusual: true }),
      makeDay("2026-02-12", 4),
    ];
    const menuDays = [
      makeMenuDay("2026-02-09", { cookedQty: 40, soldOutAt: "10:00" }),
      makeMenuDay("2026-02-09", { menuId: "ayam-goreng", cookedQty: 30 }),
      makeMenuDay("2026-02-11", { cookedQty: 12 }),
      makeMenuDay("2026-02-12", { cookedQty: 50 }),
    ];
    expect(pastDays(days, menuDays, "2026-02-11")).toEqual([
      {
        date: "2026-02-11",
        closed: false,
        unusual: false,
        portions: 12,
        soldOutCount: 0,
      },
      {
        date: "2026-02-10",
        closed: false,
        unusual: true,
        portions: 0,
        soldOutCount: 0,
      },
      {
        date: "2026-02-09",
        closed: true,
        unusual: false,
        portions: 70,
        soldOutCount: 1,
      },
    ]);
  });
});
