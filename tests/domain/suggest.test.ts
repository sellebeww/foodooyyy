// tests/domain/suggest.test.ts
import { describe, expect, it } from "vitest";
import {
  criticalRatio,
  quantile,
  suggestQty,
} from "../../src/domain/suggest.ts";
import type { DayRecord, MenuDay } from "../../src/domain/types.ts";
import { dateOf, makeDay, makeMenu, makeMenuDay } from "../helpers.ts";

describe("criticalRatio", () => {
  it("T9: price 8000, cost 4500, salvage 0 is 0.4375", () => {
    expect(criticalRatio({ price: 8000, cost: 4500, salvage: 0 })).toBe(0.4375);
  });

  it("T10: is clamped up to 0.05", () => {
    expect(criticalRatio({ price: 5000, cost: 4900, salvage: 0 })).toBe(0.05);
  });

  it("is clamped down to 0.95", () => {
    expect(criticalRatio({ price: 5000, cost: 0, salvage: 4900 })).toBe(0.95);
  });

  it("returns the upper bound when salvage is not below the price", () => {
    expect(criticalRatio({ price: 5000, cost: 1000, salvage: 5000 })).toBe(
      0.95,
    );
  });
});

describe("quantile", () => {
  it("T11: interpolates 34.25 at p 0.4375", () => {
    expect(quantile([30, 32, 35, 40, 41], 0.4375)).toBe(34.25);
  });

  it("T12: returns 40 at p 0.75", () => {
    expect(quantile([30, 32, 35, 40, 41], 0.75)).toBe(40);
  });

  it("sorts its input and does not modify it", () => {
    const input = [41, 30, 35];
    expect(quantile(input, 0.5)).toBe(35);
    expect(input).toEqual([41, 30, 35]);
  });

  it("handles the end points and a single value", () => {
    expect(quantile([3, 9], 0)).toBe(3);
    expect(quantile([3, 9], 1)).toBe(9);
    expect(quantile([7], 0.5)).toBe(7);
  });

  it("rejects an empty list", () => {
    expect(() => quantile([], 0.5)).toThrow(RangeError);
  });
});

function buildHistory(
  count: number,
  build: (index: number) => Partial<MenuDay>,
  weekdayOf: (index: number) => number = (index) => index % 7,
): { days: DayRecord[]; menuDays: MenuDay[] } {
  const days: DayRecord[] = [];
  const menuDays: MenuDay[] = [];
  for (let index = 0; index < count; index += 1) {
    const date = dateOf(index);
    days.push(makeDay(date, weekdayOf(index)));
    menuDays.push(makeMenuDay(date, build(index)));
  }
  return { days, menuDays };
}

describe("suggestQty cold start", () => {
  it("T13: a sell-out last time raises the usual quantity by 10 percent", () => {
    const { days, menuDays } = buildHistory(3, (index) =>
      index === 2
        ? {
            soldOutAt: "10:30",
            leftover: 0,
            cookedQty: 40,
            estimatedDemand: 81,
          }
        : {},
    );
    const result = suggestQty(makeMenu({ usualQty: 40 }), 3, menuDays, days);
    expect(result.qty).toBe(44);
    expect(result.reason).toEqual({
      code: "cold-start-up",
      scope: "recent",
      observations: 3,
      soldOutDays: 1,
      leftoverDays: 0,
      delta: 4,
    });
  });

  it("T14: leftovers above 20 percent lower the usual quantity by 10 percent", () => {
    const { days, menuDays } = buildHistory(3, (index) =>
      index === 2
        ? { leftover: 10, cookedQty: 40, estimatedDemand: 30 }
        : { leftover: 0 },
    );
    const result = suggestQty(makeMenu({ usualQty: 40 }), 3, menuDays, days);
    expect(result.qty).toBe(36);
    expect(result.reason.code).toBe("cold-start-down");
    expect(result.reason.leftoverDays).toBe(1);
    expect(result.reason.delta).toBe(-4);
  });

  it("keeps the usual quantity when leftovers are exactly 20 percent", () => {
    const { days, menuDays } = buildHistory(1, () => ({
      leftover: 8,
      cookedQty: 40,
      estimatedDemand: 32,
    }));
    const result = suggestQty(makeMenu({ usualQty: 40 }), 3, menuDays, days);
    expect(result.qty).toBe(40);
    expect(result.reason.code).toBe("cold-start");
  });

  it("keeps the usual quantity when the last leftover is unknown", () => {
    const { days, menuDays } = buildHistory(1, () => ({
      leftover: null,
      estimatedDemand: 40,
    }));
    const result = suggestQty(makeMenu({ usualQty: 40 }), 3, menuDays, days);
    expect(result.qty).toBe(40);
    expect(result.reason.code).toBe("cold-start");
  });

  it("starts from the usual quantity with no history", () => {
    const result = suggestQty(makeMenu({ usualQty: 25 }), 3, [], []);
    expect(result.qty).toBe(25);
    expect(result.reason).toEqual({
      code: "cold-start",
      scope: "recent",
      observations: 0,
      soldOutDays: 0,
      leftoverDays: 0,
      delta: 0,
    });
  });

  it("rounds the 10 percent increase up using integer arithmetic", () => {
    const { days, menuDays } = buildHistory(1, () => ({
      soldOutAt: "10:00",
      leftover: 0,
    }));
    expect(suggestQty(makeMenu({ usualQty: 25 }), 3, menuDays, days).qty).toBe(
      28,
    );
    expect(suggestQty(makeMenu({ usualQty: 40 }), 3, menuDays, days).qty).toBe(
      44,
    );
  });

  it("clamps the result to the allowed range", () => {
    const { days, menuDays } = buildHistory(1, () => ({
      soldOutAt: "10:00",
      leftover: 0,
    }));
    expect(suggestQty(makeMenu({ usualQty: 999 }), 3, menuDays, days).qty).toBe(
      999,
    );
    expect(suggestQty(makeMenu({ usualQty: -5 }), 3, [], []).qty).toBe(0);
  });
});

describe("suggestQty with history", () => {
  const demands = [30, 32, 35, 40, 41];

  it("uses the critical-ratio quantile of recent same-weekday demand", () => {
    const { days, menuDays } = buildHistory(
      5,
      (index) => ({
        estimatedDemand: demands[index] as number,
        cookedQty: 38,
        leftover: 0,
        soldOutAt: index === 3 ? "11:00" : null,
      }),
      () => 1,
    );
    const result = suggestQty(makeMenu(), 1, menuDays, days);
    expect(result.qty).toBe(34);
    expect(result.reason).toEqual({
      code: "history",
      scope: "weekday",
      observations: 5,
      soldOutDays: 1,
      leftoverDays: 0,
      delta: -4,
    });
  });

  it("counts leftover days in the reason", () => {
    const { days, menuDays } = buildHistory(
      5,
      (index) => ({
        estimatedDemand: 30,
        cookedQty: 30,
        leftover: index < 2 ? 3 : null,
      }),
      () => 1,
    );
    const result = suggestQty(makeMenu(), 1, menuDays, days);
    expect(result.reason.leftoverDays).toBe(2);
  });

  it("T15: ignores unusual and unclosed days", () => {
    const { days, menuDays } = buildHistory(
      7,
      (index) => ({ estimatedDemand: index < 5 ? 30 : 500 }),
      () => 1,
    );
    days[5] = makeDay(dateOf(5), 1, { unusual: true });
    days[6] = makeDay(dateOf(6), 1, { closed: false });
    const result = suggestQty(makeMenu(), 1, menuDays, days);
    expect(result.reason.observations).toBe(5);
    expect(result.qty).toBe(30);
  });

  it("ignores days without an estimate, other menus and days without a record", () => {
    const { days, menuDays } = buildHistory(
      5,
      () => ({ estimatedDemand: 30 }),
      () => 1,
    );
    menuDays.push(makeMenuDay(dateOf(10), { estimatedDemand: null }));
    menuDays.push(
      makeMenuDay(dateOf(11), { menuId: "other", estimatedDemand: 900 }),
    );
    menuDays.push(makeMenuDay("2026-03-01", { estimatedDemand: 900 }));
    days.push(makeDay(dateOf(10), 1));
    days.push(makeDay(dateOf(11), 1));
    const result = suggestQty(makeMenu(), 1, menuDays, days);
    expect(result.reason.observations).toBe(5);
    expect(result.qty).toBe(30);
  });

  it("T16: uses only the 6 same-weekday days when there are 20 other days", () => {
    const days: DayRecord[] = [];
    const menuDays: MenuDay[] = [];
    for (let index = 0; index < 26; index += 1) {
      const sameWeekday = index < 6;
      const date = dateOf(index);
      days.push(makeDay(date, sameWeekday ? 1 : 2));
      menuDays.push(
        makeMenuDay(date, { estimatedDemand: sameWeekday ? 50 : 10 }),
      );
    }
    const result = suggestQty(makeMenu(), 1, menuDays, days);
    expect(result.reason.observations).toBe(6);
    expect(result.reason.scope).toBe("weekday");
    expect(result.qty).toBe(50);
  });

  it("limits same-weekday history to the latest 8 days", () => {
    const { days, menuDays } = buildHistory(
      10,
      (index) => ({ estimatedDemand: index < 2 ? 900 : 20 }),
      () => 1,
    );
    const result = suggestQty(makeMenu(), 1, menuDays, days);
    expect(result.reason.observations).toBe(8);
    expect(result.qty).toBe(20);
  });

  it("falls back to the latest 14 days of any weekday when same-weekday history is short", () => {
    const { days, menuDays } = buildHistory(20, () => ({
      estimatedDemand: 30,
    }));
    const result = suggestQty(makeMenu(), 0, menuDays, days);
    expect(result.reason.observations).toBe(14);
    expect(result.reason.code).toBe("history");
    expect(result.reason.scope).toBe("recent");
  });

  it("clamps a large suggestion to 999", () => {
    const { days, menuDays } = buildHistory(
      5,
      () => ({ estimatedDemand: 2500 }),
      () => 1,
    );
    expect(suggestQty(makeMenu(), 1, menuDays, days).qty).toBe(999);
  });
});
