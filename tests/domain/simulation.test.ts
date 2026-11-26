// tests/domain/simulation.test.ts
import { describe, expect, it } from "vitest";
import {
  type DemoScenario,
  DEMO_MENUS,
  DEMO_SETTINGS,
  createRng,
  drawDay,
  observeOutcome,
  toMenuDay,
} from "../../src/demo/generator.ts";
import type { DemoScenarioId } from "../../src/demo/catalog.ts";
import { demoScenario } from "../../src/demo/scenarios.ts";
import { arrivalShare, estimateDemand } from "../../src/domain/estimate.ts";
import { suggestQty } from "../../src/domain/suggest.ts";
import { addDays } from "../../src/domain/time.ts";
import type {
  DayRecord,
  HHMM,
  Menu,
  MenuDay,
  StallSettings,
} from "../../src/domain/types.ts";

const SEEDS = 20;
const DAYS = 120;
const START = "2026-01-05";
const SCENARIOS = [1, 2, 3, 4].map((id) => demoScenario(id as DemoScenarioId));

interface Tally {
  trueDemand: number;
  estimated: number;
  naive: number;
  soldOutDays: number;
  days: number;
  profit: number;
}

function simulate(
  seed: string,
  scenario: DemoScenario,
  menu: Menu,
  policy: "usual" | "foodoo",
): Tally {
  const rng = createRng(seed);
  const days: DayRecord[] = [];
  const menuDays: MenuDay[] = [];
  const tally: Tally = {
    trueDemand: 0,
    estimated: 0,
    naive: 0,
    soldOutDays: 0,
    days: 0,
    profit: 0,
  };
  for (let index = 0; index < DAYS; index += 1) {
    const date = addDays(START, index);
    const draw = drawDay(
      rng,
      date,
      scenario.menus,
      scenario.settings,
      scenario.trueMeans,
      scenario.weekdayFactors,
      scenario.unusualChance,
    );
    const demand = draw.demand[menu.id] as number;
    const cooked =
      policy === "usual"
        ? menu.usualQty
        : suggestQty(menu, draw.weekday, menuDays, days).qty;
    const outcome = observeOutcome(
      cooked,
      demand,
      draw.arrivals[menu.id] as number[],
    );
    const menuDay = toMenuDay(date, menu.id, outcome, scenario.settings);
    days.push({
      date,
      weekday: draw.weekday,
      unusual: draw.unusual,
      closed: true,
    });
    menuDays.push(menuDay);
    tally.days += 1;
    tally.profit +=
      outcome.sold * menu.price +
      outcome.leftover * menu.salvage -
      cooked * menu.cost;
    if (outcome.soldOutAt !== null) {
      tally.soldOutDays += 1;
      tally.trueDemand += demand;
      tally.estimated += menuDay.estimatedDemand as number;
      tally.naive += outcome.sold;
    }
  }
  return tally;
}

function total(tallies: Tally[], key: keyof Tally): number {
  return tallies.reduce((sum, tally) => sum + tally[key], 0);
}

describe.each(SCENARIOS)(
  "simulation: scenario $id, 20 seeds x 120 days",
  (scenario) => {
    const seeds = Array.from(
      { length: SEEDS },
      (_, i) => `sim-${scenario.id}-${i}`,
    );
    const run = (menu: Menu, policy: "usual" | "foodoo"): Tally[] =>
      seeds.map((seed) => simulate(seed, scenario, menu, policy));

    const usualRuns = new Map(
      scenario.menus.map((menu) => [menu.id, run(menu, "usual")] as const),
    );
    const censored = scenario.menus.filter((menu) => {
      const usual = usualRuns.get(menu.id) as Tally[];
      return total(usual, "soldOutDays") / total(usual, "days") >= 0.3;
    });

    it("has at least one menu that sells out on 30% of days or more", () => {
      expect(censored.length).toBeGreaterThan(0);
    });

    it.each(censored.map((menu) => [menu.name, menu.id] as const))(
      "%s: corrected estimator is unbiased where the naive one is not",
      (_name, id) => {
        const usual = usualRuns.get(id) as Tally[];
        const truth = total(usual, "trueDemand");
        expect(
          Math.abs((total(usual, "estimated") - truth) / truth),
        ).toBeLessThanOrEqual(0.1);
        expect((total(usual, "naive") - truth) / truth).toBeLessThan(-0.1);
      },
    );

    it("FOODOO earns at least the usual-quantity profit over the whole stall", () => {
      const profit = (policy: "usual" | "foodoo"): number =>
        scenario.menus.reduce(
          (sum, menu) => sum + total(run(menu, policy), "profit"),
          0,
        );
      expect(profit("foodoo")).toBeGreaterThanOrEqual(profit("usual"));
    });
  },
);

describe("fuzz: 1000 random cases", () => {
  const rng = createRng("fuzz");
  const int = (max: number): number => Math.floor(rng() * (max + 1));
  const hhmm = (minutes: number): HHMM =>
    `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

  it("holds the estimator invariants", () => {
    for (let run = 0; run < 1000; run += 1) {
      const open = 5 * 60 + int(6 * 60);
      const close = open + 60 + int(8 * 60);
      const busyProfile: StallSettings["busyProfile"] = {};
      for (let hour = 0; hour < 24; hour += 1) {
        busyProfile[String(hour).padStart(2, "0")] = [1, 2, 4][int(2)] as
          1 | 2 | 4;
      }
      const settings: StallSettings = {
        openAt: hhmm(open),
        closeAt: hhmm(close),
        busyProfile,
        isDemo: false,
      };
      const cooked = int(200);
      const at = hhmm(open + int(close - open - 1));
      const share = arrivalShare(settings, at);
      expect(share).toBeGreaterThanOrEqual(0);
      expect(share).toBeLessThanOrEqual(1);
      const t1 = open + int(close - open);
      const t2 = t1 + int(close - t1);
      expect(arrivalShare(settings, hhmm(t1))).toBeLessThanOrEqual(
        arrivalShare(settings, hhmm(t2)),
      );
      expect(arrivalShare(settings, hhmm(close))).toBe(1);

      const sold = estimateDemand(cooked, null, at, settings);
      expect(sold?.isEstimate).toBe(true);
      expect(sold?.demand).toBeGreaterThanOrEqual(cooked);
      expect(sold?.demand).toBeLessThanOrEqual(3 * cooked);
      expect(Number.isInteger(sold?.demand)).toBe(true);

      const leftover = int(cooked);
      expect(estimateDemand(cooked, leftover, null, settings)).toEqual({
        demand: cooked - leftover,
        isEstimate: false,
      });
    }
  });

  it("never suggests an out-of-range or fractional quantity", () => {
    const menu = DEMO_MENUS[0] as Menu;
    for (let run = 0; run < 1000; run += 1) {
      const count = int(20);
      const days: DayRecord[] = [];
      const menuDays: MenuDay[] = [];
      for (let index = 0; index < count; index += 1) {
        const date = addDays(START, index);
        days.push({
          date,
          weekday: index % 7,
          unusual: rng() < 0.1,
          closed: rng() < 0.9,
        });
        const cooked = int(120);
        const soldOut = rng() < 0.4;
        const outcome = soldOut
          ? { cooked, demand: cooked + 1, sold: cooked, leftover: 0 }
          : {
              cooked,
              demand: int(cooked),
              sold: 0,
              leftover: 0,
            };
        const settled = soldOut
          ? { ...outcome, soldOutAt: hhmm(7 * 60 + int(300)) }
          : {
              ...outcome,
              leftover: cooked - outcome.demand,
              soldOutAt: null,
            };
        menuDays.push(toMenuDay(date, menu.id, settled, DEMO_SETTINGS));
      }
      const { qty } = suggestQty(menu, int(6), menuDays, days);
      expect(Number.isInteger(qty)).toBe(true);
      expect(qty).toBeGreaterThanOrEqual(0);
      expect(qty).toBeLessThanOrEqual(999);
    }
  });
});
