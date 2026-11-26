// tests/domain/pattern.test.ts
import { describe, expect, it } from "vitest";
import {
  averageLoads,
  hourLoads,
  rankMenus,
} from "../../src/domain/pattern.ts";
import { dateOf, makeDay, makeMenu, makeMenuDay } from "../helpers.ts";

describe("hourly demand", () => {
  const visits = [
    { minute: 360, menuId: "a", served: true },
    { minute: 419, menuId: "a", served: false },
    { minute: 420, menuId: "a", served: true },
  ];

  it("counts sold and turned away customers per hour", () => {
    expect(hourLoads(visits, [360, 420])).toEqual([
      { start: 360, sold: 1, missed: 1 },
      { start: 420, sold: 1, missed: 0 },
    ]);
  });

  it("averages each hour over the days that reached it", () => {
    const loads = hourLoads(visits, [360, 420]);
    expect(averageLoads(loads, 1, 1)).toEqual([
      { start: 360, sold: 0.5, missed: 0.5 },
      { start: 420, sold: 1, missed: 0 },
    ]);
    expect(averageLoads(loads, 0, 0)).toEqual([
      { start: 360, sold: 0, missed: 0 },
      { start: 420, sold: 0, missed: 0 },
    ]);
  });
});

describe("menu ranking", () => {
  const menu = (id: string) => makeMenu({ id, price: 10, cost: 5, salvage: 0 });
  const days = [0, 1].map((index) => makeDay(dateOf(index), index));
  const rows = (
    menuId: string,
    cooked: number,
    leftover: number,
    out = false,
  ) =>
    days.map((day) =>
      makeMenuDay(day.date, {
        menuId,
        cookedQty: cooked,
        leftover,
        soldOutAt: out ? "09:00" : null,
        estimatedDemand: cooked - leftover,
      }),
    );

  it("orders menus by profit per day and names the pattern", () => {
    const result = rankMenus(
      ["loss", "steady", "out", "left", "none"].map(menu),
      [
        ...rows("loss", 10, 8),
        ...rows("steady", 10, 1),
        ...rows("out", 20, 0, true),
        ...rows("left", 20, 5),
      ],
      days,
    );
    expect(result.map((item) => [item.menuId, item.signal])).toEqual([
      ["out", "sellsOut"],
      ["left", "leftOver"],
      ["steady", "steady"],
      ["loss", "loss"],
    ]);
    expect(result[0]).toMatchObject({ days: 2, profit: 100, demand: 20 });
  });

  it("ignores unusual days, open days, rows without demand and archived menus", () => {
    const result = rankMenus(
      [menu("a"), makeMenu({ id: "b", archived: true })],
      [
        ...rows("a", 10, 1),
        makeMenuDay(dateOf(2), { menuId: "a" }),
        makeMenuDay(dateOf(3), {
          menuId: "a",
          leftover: null,
          estimatedDemand: null,
        }),
        ...rows("b", 10, 1),
      ],
      [
        ...days,
        makeDay(dateOf(2), 2, { unusual: true }),
        makeDay(dateOf(3), 3),
      ],
    );
    expect(result).toHaveLength(1);
    expect(result[0]?.days).toBe(2);
  });

  it("treats a missing leftover as zero", () => {
    const result = rankMenus(
      [menu("a")],
      [makeMenuDay(dateOf(0), { menuId: "a", leftover: null })],
      days,
    );
    expect(result[0]?.leftover).toBe(0);
  });
});
