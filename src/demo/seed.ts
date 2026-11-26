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
import { generateScenarioHistory } from "./generator.ts";
import { DEFAULT_DEMO_SCENARIO, type DemoScenarioId } from "./catalog.ts";
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

export function buildDemoRecords(
  today: ISODate,
  scenario: DemoScenarioId = DEFAULT_DEMO_SCENARIO,
): DemoRecords {
  const history = generateScenarioHistory(today, demoScenario(scenario));
  return {
    stall: {
      id: STALL_ID,
      name: history.stallName,
      settings: pickSettings(history.settings),
      setupComplete: true,
      demo: { scenario, generatedFor: today },
    },
    menus: history.menus.map(pickMenu),
    days: history.days.map(pickDay),
    menuDays: history.menuDays.map(pickMenuDay),
  };
}
