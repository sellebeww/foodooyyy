// src/domain/explain.ts
import {
  arrivalWeights,
  DEMAND_CAP_FACTOR,
  estimateDemand,
  hourWeight,
} from "./estimate.ts";
import { profileHours } from "./setup.ts";
import { criticalRatio, suggestQty } from "./suggest.ts";
import { addDays } from "./time.ts";
import type {
  DayRecord,
  DemandEstimate,
  HHMM,
  ISODate,
  Menu,
  MenuDay,
  StallSettings,
  Suggestion,
} from "./types.ts";

export const EXAMPLE_SETTINGS: StallSettings = {
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
  isDemo: false,
};

export const EXAMPLE_MENU: Menu = {
  id: "example",
  name: "Nasi Uduk",
  price: 8000,
  cost: 4500,
  salvage: 0,
  usualQty: 40,
  archived: false,
};

export const EXAMPLE_COOKED = 42;
export const EXAMPLE_SOLD_OUT_AT: HHMM = "10:30";
export const EXAMPLE_HISTORY_COOKED = 45;
export const EXAMPLE_HISTORY_DEMAND: readonly number[] = [35, 30, 41, 32, 40];

const EXAMPLE_FIRST_MONDAY: ISODate = "2026-02-02";
const EXAMPLE_WEEKDAY = 1;
const DAYS_PER_WEEK = 7;

export interface ExampleHour {
  hour: string;
  weight: number;
  beforeSellOut: boolean;
}

export interface WorkedExample {
  hours: ExampleHour[];
  cooked: number;
  soldOutAt: HHMM;
  arrivedPercent: number;
  demand: number;
  cap: number;
  gainPerPortion: number;
  lossPerLeftover: number;
  coverPercent: number;
  historyCooked: number;
  history: number[];
  weekday: number;
  suggestion: Suggestion;
}

function exampleHistory(): { days: DayRecord[]; menuDays: MenuDay[] } {
  const dates = EXAMPLE_HISTORY_DEMAND.map((_, index) =>
    addDays(EXAMPLE_FIRST_MONDAY, index * DAYS_PER_WEEK),
  );
  return {
    days: dates.map((date) => ({
      date,
      weekday: EXAMPLE_WEEKDAY,
      unusual: false,
      closed: true,
    })),
    menuDays: EXAMPLE_HISTORY_DEMAND.map((demand, index) => ({
      date: dates[index] as ISODate,
      menuId: EXAMPLE_MENU.id,
      suggestedQty: null,
      reason: null,
      cookedQty: EXAMPLE_HISTORY_COOKED,
      soldOutAt: null,
      leftover: EXAMPLE_HISTORY_COOKED - demand,
      estimatedDemand: demand,
      demandIsEstimate: false,
    })),
  };
}

export function workedExample(): WorkedExample {
  const settings = EXAMPLE_SETTINGS;
  const { arrived, total } = arrivalWeights(settings, EXAMPLE_SOLD_OUT_AT);
  const estimate = estimateDemand(
    EXAMPLE_COOKED,
    0,
    EXAMPLE_SOLD_OUT_AT,
    settings,
  ) as DemandEstimate;
  const soldOutHour = EXAMPLE_SOLD_OUT_AT.slice(0, 2);
  const history = exampleHistory();
  return {
    hours: profileHours(settings.openAt, settings.closeAt).map((hour) => ({
      hour,
      weight: hourWeight(settings, Number(hour)),
      beforeSellOut: hour <= soldOutHour,
    })),
    cooked: EXAMPLE_COOKED,
    soldOutAt: EXAMPLE_SOLD_OUT_AT,
    arrivedPercent: Math.round((100 * arrived) / total),
    demand: estimate.demand,
    cap: EXAMPLE_COOKED * DEMAND_CAP_FACTOR,
    gainPerPortion: EXAMPLE_MENU.price - EXAMPLE_MENU.cost,
    lossPerLeftover: EXAMPLE_MENU.cost - EXAMPLE_MENU.salvage,
    coverPercent: Math.round(100 * criticalRatio(EXAMPLE_MENU)),
    historyCooked: EXAMPLE_HISTORY_COOKED,
    history: [...EXAMPLE_HISTORY_DEMAND].sort((a, b) => a - b),
    weekday: EXAMPLE_WEEKDAY,
    suggestion: suggestQty(
      EXAMPLE_MENU,
      EXAMPLE_WEEKDAY,
      history.menuDays,
      history.days,
    ),
  };
}
