// src/demo/generator.ts
import seedrandom from "seedrandom";
import { estimateDemand, hourWeight } from "../domain/estimate.ts";
import {
  addDays,
  closeMinute,
  formatHHMM,
  openMinute,
  weekdayOf,
} from "../domain/time.ts";
import type {
  DayRecord,
  HHMM,
  ISODate,
  Menu,
  MenuDay,
  StallSettings,
} from "../domain/types.ts";

export type Rng = () => number;

const MINUTES_PER_DAY = 1440;

export const DEMO_SEED = "foodoo-demo";
export const DEMO_STALL_NAME = "Warung Demo";
export const DEMO_HISTORY_DAYS = 56;
export const UNUSUAL_DAY_CHANCE = 0.1;
export const OWNER_JITTER = 3;

export const WEEKDAY_FACTORS: readonly number[] = [
  0.7, 1.15, 0.95, 1.0, 0.95, 1.1, 1.2,
];

export const DEMO_SETTINGS: StallSettings = {
  openAt: "06:00",
  closeAt: "14:00",
  busyProfile: {
    "06": 1,
    "07": 4,
    "08": 4,
    "09": 2,
    "10": 2,
    "11": 4,
    "12": 4,
    "13": 2,
  },
  isDemo: true,
};

export const DEMO_MENUS: readonly Menu[] = [
  {
    id: "nasi-uduk",
    name: "Nasi Uduk",
    price: 8000,
    cost: 4500,
    salvage: 0,
    usualQty: 40,
    archived: false,
  },
  {
    id: "ayam-goreng",
    name: "Ayam Goreng",
    price: 12000,
    cost: 7000,
    salvage: 0,
    usualQty: 30,
    archived: false,
  },
  {
    id: "sayur-lodeh",
    name: "Sayur Lodeh",
    price: 5000,
    cost: 2500,
    salvage: 0,
    usualQty: 25,
    archived: false,
  },
  {
    id: "tempe-orek",
    name: "Tempe Orek",
    price: 4000,
    cost: 1500,
    salvage: 0,
    usualQty: 28,
    archived: false,
  },
];

export const DEMO_TRUE_MEANS: Readonly<Record<string, number>> = {
  "nasi-uduk": 52,
  "ayam-goreng": 27,
  "sayur-lodeh": 20,
  "tempe-orek": 29,
};

export interface DemoScenario {
  id: number;
  seed: string;
  stallName: string;
  settings: StallSettings;
  menus: readonly Menu[];
  trueMeans: Readonly<Record<string, number>>;
  weekdayFactors: readonly number[];
  historyDays: number;
  unusualChance: number;
  ownerJitter: number;
}

export const DEMO_SCENARIO_1: DemoScenario = {
  id: 1,
  seed: DEMO_SEED,
  stallName: DEMO_STALL_NAME,
  settings: DEMO_SETTINGS,
  menus: DEMO_MENUS,
  trueMeans: DEMO_TRUE_MEANS,
  weekdayFactors: WEEKDAY_FACTORS,
  historyDays: DEMO_HISTORY_DAYS,
  unusualChance: UNUSUAL_DAY_CHANCE,
  ownerJitter: OWNER_JITTER,
};

export interface DayDraw {
  date: ISODate;
  weekday: number;
  unusual: boolean;
  demand: Record<string, number>;
  arrivals: Record<string, number[]>;
}

export interface Outcome {
  cooked: number;
  demand: number;
  sold: number;
  leftover: number;
  soldOutAt: HHMM | null;
}

export interface DemoHistory {
  stallName: string;
  settings: StallSettings;
  menus: Menu[];
  days: DayRecord[];
  menuDays: MenuDay[];
}

export function createRng(seed: string): Rng {
  return seedrandom(seed);
}

export function samplePoisson(rng: Rng, mean: number): number {
  const limit = Math.exp(-mean);
  let count = 0;
  let product = rng();
  while (product > limit) {
    count += 1;
    product *= rng();
  }
  return count;
}

export function sampleArrivalMinutes(
  rng: Rng,
  count: number,
  settings: StallSettings,
): number[] {
  const open = openMinute(settings);
  const close = closeMinute(settings);
  const firstHour = Math.floor(open / 60);
  const lastHour = Math.ceil(close / 60) - 1;
  const weights: number[] = [];
  for (let hour = firstHour; hour <= lastHour; hour += 1) {
    weights.push(hourWeight(settings, hour % 24));
  }
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const minutes: number[] = [];
  for (let index = 0; index < count; index += 1) {
    let pick = rng() * totalWeight;
    let slot = 0;
    while (slot < weights.length - 1 && pick >= (weights[slot] as number)) {
      pick -= weights[slot] as number;
      slot += 1;
    }
    const minute = (firstHour + slot) * 60 + Math.floor(rng() * 60);
    minutes.push(Math.min(close - 1, Math.max(open, minute)));
  }
  return minutes.sort((a, b) => a - b);
}

export function drawDay(
  rng: Rng,
  date: ISODate,
  menus: readonly Menu[],
  settings: StallSettings,
  trueMeans: Readonly<Record<string, number>> = DEMO_TRUE_MEANS,
  weekdayFactors: readonly number[] = WEEKDAY_FACTORS,
  unusualChance: number = UNUSUAL_DAY_CHANCE,
): DayDraw {
  const weekday = weekdayOf(date);
  const unusual = rng() < unusualChance;
  const demand: Record<string, number> = {};
  const arrivals: Record<string, number[]> = {};
  for (const menu of menus) {
    const mean =
      (trueMeans[menu.id] ?? menu.usualQty) *
      (weekdayFactors[weekday] as number);
    const count = samplePoisson(rng, mean);
    demand[menu.id] = count;
    arrivals[menu.id] = sampleArrivalMinutes(rng, count, settings);
  }
  return { date, weekday, unusual, demand, arrivals };
}

export function observeOutcome(
  cooked: number,
  demand: number,
  arrivalMinutes: readonly number[],
): Outcome {
  if (demand > cooked) {
    return {
      cooked,
      demand,
      sold: cooked,
      leftover: 0,
      soldOutAt: formatHHMM(
        (arrivalMinutes[cooked] as number) % MINUTES_PER_DAY,
      ),
    };
  }
  return {
    cooked,
    demand,
    sold: demand,
    leftover: cooked - demand,
    soldOutAt: null,
  };
}

export function toMenuDay(
  date: ISODate,
  menuId: string,
  outcome: Outcome,
  settings: StallSettings,
  suggestion: Pick<MenuDay, "suggestedQty" | "reason"> = {
    suggestedQty: null,
    reason: null,
  },
): MenuDay {
  const estimate = estimateDemand(
    outcome.cooked,
    outcome.leftover,
    outcome.soldOutAt,
    settings,
  );
  return {
    date,
    menuId,
    suggestedQty: suggestion.suggestedQty,
    reason: suggestion.reason,
    cookedQty: outcome.cooked,
    soldOutAt: outcome.soldOutAt,
    leftover: outcome.leftover,
    estimatedDemand: estimate === null ? null : estimate.demand,
    demandIsEstimate: estimate === null ? false : estimate.isEstimate,
  };
}

export function generateDemoHistory(
  today: ISODate,
  seed: string = DEMO_SEED,
  scenario: DemoScenario = DEMO_SCENARIO_1,
): DemoHistory {
  const rng = createRng(seed);
  const settings: StallSettings = {
    ...scenario.settings,
    busyProfile: { ...scenario.settings.busyProfile },
  };
  const menus = scenario.menus.map((menu) => ({ ...menu }));
  const days: DayRecord[] = [];
  const menuDays: MenuDay[] = [];
  const jitterSpan = 2 * scenario.ownerJitter + 1;
  for (let back = scenario.historyDays; back >= 1; back -= 1) {
    const date = addDays(today, -back);
    const draw = drawDay(
      rng,
      date,
      menus,
      settings,
      scenario.trueMeans,
      scenario.weekdayFactors,
      scenario.unusualChance,
    );
    days.push({
      date,
      weekday: draw.weekday,
      unusual: draw.unusual,
      closed: true,
    });
    for (const menu of menus) {
      const jitter = Math.floor(rng() * jitterSpan) - scenario.ownerJitter;
      const cooked = Math.max(1, menu.usualQty + jitter);
      const outcome = observeOutcome(
        cooked,
        draw.demand[menu.id] as number,
        draw.arrivals[menu.id] as number[],
      );
      menuDays.push(toMenuDay(date, menu.id, outcome, settings));
    }
  }
  return { stallName: scenario.stallName, settings, menus, days, menuDays };
}

export function generateScenarioHistory(
  today: ISODate,
  scenario: DemoScenario,
): DemoHistory {
  return generateDemoHistory(today, scenario.seed, scenario);
}
