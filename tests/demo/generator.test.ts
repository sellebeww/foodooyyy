// tests/demo/generator.test.ts
import { describe, expect, it } from "vitest";
import {
  DEMO_MENUS,
  DEMO_SETTINGS,
  DEMO_STALL_NAME,
  createRng,
  drawDay,
  generateDemoHistory,
  observeOutcome,
  sampleArrivalMinutes,
  samplePoisson,
} from "../../src/demo/generator.ts";
import { parseHHMM } from "../../src/domain/time.ts";

describe("demo generator", () => {
  it("is deterministic for a fixed seed and date", () => {
    const first = generateDemoHistory("2026-03-01");
    const second = generateDemoHistory("2026-03-01");
    expect(second).toEqual(first);
  });

  it("changes when the seed changes", () => {
    const first = generateDemoHistory("2026-03-01", "seed-a");
    const second = generateDemoHistory("2026-03-01", "seed-b");
    expect(second.menuDays).not.toEqual(first.menuDays);
  });

  it("builds the Warung Demo stall with four menus and 56 days ending yesterday", () => {
    const history = generateDemoHistory("2026-03-01");
    expect(history.stallName).toBe(DEMO_STALL_NAME);
    expect(history.stallName).toContain("Demo");
    expect(history.settings.isDemo).toBe(true);
    expect(history.menus.map((menu) => menu.name)).toEqual([
      "Nasi Uduk",
      "Ayam Goreng",
      "Sayur Lodeh",
      "Tempe Orek",
    ]);
    expect(history.days).toHaveLength(56);
    expect(history.days[0]?.date).toBe("2026-01-04");
    expect(history.days[55]?.date).toBe("2026-02-28");
    expect(history.menuDays).toHaveLength(56 * 4);
    expect(history.days.every((day) => day.closed)).toBe(true);
  });

  it("marks about one day in ten as unusual", () => {
    const unusual = generateDemoHistory("2026-03-01").days.filter(
      (day) => day.unusual,
    ).length;
    expect(unusual).toBeGreaterThanOrEqual(1);
    expect(unusual).toBeLessThanOrEqual(14);
  });

  it("returns only what an owner could have recorded, never the true demand", () => {
    const history = generateDemoHistory("2026-03-01");
    expect(Object.keys(history).sort()).toEqual(
      ["days", "menuDays", "menus", "settings", "stallName"].sort(),
    );
    const menuDayKeys = [
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
    for (const menuDay of history.menuDays) {
      expect(Object.keys(menuDay).sort()).toEqual(menuDayKeys);
    }
    for (const day of history.days) {
      expect(Object.keys(day).sort()).toEqual([
        "closed",
        "date",
        "unusual",
        "weekday",
      ]);
    }
  });

  it("derives recorded fields consistently from the outcome", () => {
    const history = generateDemoHistory("2026-03-01");
    for (const menuDay of history.menuDays) {
      expect(menuDay.estimatedDemand).not.toBeNull();
      expect(menuDay.leftover).not.toBeNull();
      if (menuDay.soldOutAt === null) {
        expect(menuDay.demandIsEstimate).toBe(false);
        expect(menuDay.estimatedDemand).toBe(
          menuDay.cookedQty - (menuDay.leftover as number),
        );
      } else {
        expect(menuDay.demandIsEstimate).toBe(true);
        expect(menuDay.leftover).toBe(0);
      }
    }
  });

  it("cooks the usual quantity plus or minus at most 3", () => {
    const history = generateDemoHistory("2026-03-01");
    for (const menuDay of history.menuDays) {
      const menu = DEMO_MENUS.find((item) => item.id === menuDay.menuId);
      expect(
        Math.abs(menuDay.cookedQty - (menu?.usualQty as number)),
      ).toBeLessThanOrEqual(3);
    }
  });
});

describe("generator helpers", () => {
  it("samples Poisson counts near their mean", () => {
    const rng = createRng("poisson");
    let total = 0;
    for (let index = 0; index < 2000; index += 1) {
      total += samplePoisson(rng, 20);
    }
    expect(total / 2000).toBeGreaterThan(19);
    expect(total / 2000).toBeLessThan(21);
  });

  it("samples sorted arrival minutes inside opening hours", () => {
    const minutes = sampleArrivalMinutes(
      createRng("arrivals"),
      500,
      DEMO_SETTINGS,
    );
    expect(minutes).toHaveLength(500);
    expect([...minutes].sort((a, b) => a - b)).toEqual(minutes);
    expect(Math.min(...minutes)).toBeGreaterThanOrEqual(parseHHMM("06:00"));
    expect(Math.max(...minutes)).toBeLessThan(parseHHMM("14:00"));
  });

  it("draws demand and arrivals for every menu", () => {
    const draw = drawDay(
      createRng("draw"),
      "2026-03-02",
      DEMO_MENUS,
      DEMO_SETTINGS,
    );
    expect(draw.weekday).toBe(1);
    for (const menu of DEMO_MENUS) {
      expect(draw.arrivals[menu.id]).toHaveLength(
        draw.demand[menu.id] as number,
      );
    }
  });

  it("sells out at the arrival of customer number cooked + 1", () => {
    const outcome = observeOutcome(2, 4, [400, 410, 420, 430]);
    expect(outcome).toEqual({
      cooked: 2,
      demand: 4,
      sold: 2,
      leftover: 0,
      soldOutAt: "07:00",
    });
  });

  it("leaves leftovers when demand is below the cooked quantity", () => {
    expect(observeOutcome(5, 3, [400, 410, 420])).toEqual({
      cooked: 5,
      demand: 3,
      sold: 3,
      leftover: 2,
      soldOutAt: null,
    });
    expect(observeOutcome(3, 3, [400, 410, 420]).soldOutAt).toBeNull();
  });
});
