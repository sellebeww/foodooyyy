// src/demo/seed.ts
import { STALL_ID, type StallRow } from "../db/schema.ts";
import type {
  DayRecord,
  ISODate,
  Menu,
  MenuDay,
  Reason,
  StallSettings,
} from "../domain/types.ts";
import { suggestAll } from "../domain/plan.ts";
import { formatHHMM, weekdayOf } from "../domain/time.ts";
import { generateScenarioHistory, type DemoHistory } from "./generator.ts";
import {
  DEFAULT_DEMO_SCENARIO,
  demoMinute,
  type DemoMoment,
  type DemoScenarioId,
} from "./catalog.ts";
import { demoScenario } from "./scenarios.ts";

export interface DemoRecords {
  stall: StallRow;
  menus: Menu[];
  days: DayRecord[];
  menuDays: MenuDay[];
}

function pickSettings(settings: StallSettings): StallSettings {
  return {
    openAt: settings.openAt,
    closeAt: settings.closeAt,
    busyProfile: { ...settings.busyProfile },
    isDemo: true,
  };
}

function pickMenu(menu: Menu): Menu {
  return {
    id: menu.id,
    name: menu.name,
    price: menu.price,
    cost: menu.cost,
    salvage: menu.salvage,
    usualQty: menu.usualQty,
    archived: menu.archived,
  };
}

function pickDay(day: DayRecord): DayRecord {
  return {
    date: day.date,
    weekday: day.weekday,
    unusual: day.unusual,
    closed: day.closed,
  };
}

function pickReason(reason: Reason | null): Reason | null {
  return reason === null
    ? null
    : {
        code: reason.code,
        scope: reason.scope,
        observations: reason.observations,
        soldOutDays: reason.soldOutDays,
        leftoverDays: reason.leftoverDays,
        delta: reason.delta,
      };
}

export function pickMenuDay(item: MenuDay): MenuDay {
  return {
    date: item.date,
    menuId: item.menuId,
    suggestedQty: item.suggestedQty,
    reason: pickReason(item.reason),
    cookedQty: item.cookedQty,
    soldOutAt: item.soldOutAt,
    leftover: item.leftover,
    estimatedDemand: item.estimatedDemand,
    demandIsEstimate: item.demandIsEstimate,
  };
}

const SOLD_OUT_SHARES: Partial<Record<DemoMoment, readonly number[]>> = {
  service: [0.5],
  close: [0.5, 0.85],
};

function demoToday(
  history: DemoHistory,
  date: ISODate,
  moment: DemoMoment,
): { days: DayRecord[]; menuDays: MenuDay[] } {
  const shares = SOLD_OUT_SHARES[moment];
  if (shares === undefined) {
    return { days: [], menuDays: [] };
  }
  const weekday = weekdayOf(date);
  const soldOutDays = (menuId: string) =>
    history.menuDays.filter(
      (item) => item.menuId === menuId && item.soldOutAt !== null,
    ).length;
  const menuDays = suggestAll(
    history.menus,
    weekday,
    history.menuDays,
    history.days,
  )
    .sort((a, b) => soldOutDays(b.menuId) - soldOutDays(a.menuId))
    .map((suggestion, index): MenuDay => {
      const share = shares[index];
      return {
        date,
        menuId: suggestion.menuId,
        suggestedQty: suggestion.qty,
        reason: suggestion.reason,
        cookedQty: Math.max(1, suggestion.qty),
        soldOutAt:
          share === undefined
            ? null
            : formatHHMM(demoMinute(history.settings, share) % 1440),
        leftover: null,
        estimatedDemand: null,
        demandIsEstimate: false,
      };
    });
  return {
    days: [{ date, weekday, unusual: false, closed: false }],
    menuDays,
  };
}

export function buildDemoRecords(
  today: ISODate,
  scenario: DemoScenarioId = DEFAULT_DEMO_SCENARIO,
  moment?: DemoMoment,
): DemoRecords {
  const history = generateScenarioHistory(today, demoScenario(scenario));
  const current =
    moment === undefined
      ? { days: [], menuDays: [] }
      : demoToday(history, today, moment);
  return {
    stall: {
      id: STALL_ID,
      name: history.stallName,
      settings: pickSettings(history.settings),
      setupComplete: true,
      demo: {
        scenario,
        generatedFor: today,
        ...(moment === undefined ? {} : { moment }),
      },
    },
    menus: history.menus.map(pickMenu),
    days: [...history.days, ...current.days].map(pickDay),
    menuDays: [...history.menuDays, ...current.menuDays].map(pickMenuDay),
  };
}
