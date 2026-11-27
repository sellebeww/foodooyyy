// src/demo/cases.ts
import { criticalRatio, suggestQty } from "../domain/suggest.ts";
import type { DayRecord, Menu, MenuDay, Reason } from "../domain/types.ts";
import type { MessageKey } from "../i18n/index.ts";
import {
  DEMO_MOMENTS,
  type DemoMoment,
  type DemoScenarioId,
} from "./catalog.ts";

// A case is the story one demo stall is built to tell. It only names which
// menus to follow; every number shown in the guide is read from the stall's
// own stored history, so it always matches the plan screen.
export interface DemoCase {
  id: DemoScenarioId;
  primary: string;
  secondary: string;
  extra: string | null;
}

export const DEMO_CASES: Readonly<Record<DemoScenarioId, DemoCase>> = {
  1: { id: 1, primary: "nasi-uduk", secondary: "ayam-goreng", extra: null },
  2: { id: 2, primary: "nasi-rames", secondary: "sayur-asem", extra: null },
  3: { id: 3, primary: "nasi-kucing", secondary: "sate-usus", extra: null },
  4: {
    id: 4,
    primary: "lontong-sayur",
    secondary: "nasi-campur",
    extra: "bakwan",
  },
};

export interface CaseMenuFact {
  menuId: string;
  name: string;
  usual: number;
  qty: number;
  reason: Reason;
  ratio: number;
  salvage: number;
}

export interface CaseWeekdayFact {
  weekday: number;
  qty: number;
}

export interface CaseFacts {
  primary: CaseMenuFact;
  secondary: CaseMenuFact;
  extra: CaseMenuFact | null;
  closedDays: number;
  weekdayHigh: CaseWeekdayFact;
  weekdayLow: CaseWeekdayFact;
}

interface CaseHistory {
  days: readonly DayRecord[];
  menuDays: readonly MenuDay[];
}

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;

function factOf(menu: Menu, weekday: number, history: CaseHistory) {
  const suggestion = suggestQty(menu, weekday, history.menuDays, history.days);
  const fact: CaseMenuFact = {
    menuId: menu.id,
    name: menu.name,
    usual: menu.usualQty,
    qty: suggestion.qty,
    reason: suggestion.reason,
    ratio: criticalRatio(menu),
    salvage: menu.salvage,
  };
  return fact;
}

export function caseFacts(
  demoCase: DemoCase,
  menus: readonly Menu[],
  history: CaseHistory,
  weekday: number,
): CaseFacts | null {
  const active = menus.filter((menu) => !menu.archived);
  const first = active[0];
  if (first === undefined) {
    return null;
  }
  const primary = active.find((menu) => menu.id === demoCase.primary) ?? first;
  const secondary =
    active.find(
      (menu) => menu.id === demoCase.secondary && menu.id !== primary.id,
    ) ??
    active.find((menu) => menu.id !== primary.id) ??
    primary;
  const extra =
    demoCase.extra === null
      ? undefined
      : active.find((menu) => menu.id === demoCase.extra);

  const week = WEEKDAYS.map((day): CaseWeekdayFact => ({
    weekday: day,
    qty: suggestQty(primary, day, history.menuDays, history.days).qty,
  }));
  const weekdayHigh = week.reduce((best, item) =>
    item.qty > best.qty ? item : best,
  );
  const weekdayLow = week.reduce((best, item) =>
    item.qty < best.qty ? item : best,
  );

  return {
    primary: factOf(primary, weekday, history),
    secondary: factOf(secondary, weekday, history),
    extra: extra === undefined ? null : factOf(extra, weekday, history),
    closedDays: history.days.filter((day) => day.closed).length,
    weekdayHigh,
    weekdayLow,
  };
}

export function caseMessageKeys(scenario: DemoScenarioId): MessageKey[] {
  const keys: MessageKey[] = [`case.s${scenario}.title`];
  keys.push(`case.s${scenario}.situation`);
  for (const moment of DEMO_MOMENTS) {
    keys.push(caseTextKey(scenario, moment, "try"));
    keys.push(caseTextKey(scenario, moment, "happens"));
  }
  return keys;
}

export function caseTextKey(
  scenario: DemoScenarioId,
  moment: DemoMoment,
  part: "try" | "happens",
): MessageKey {
  return `case.s${scenario}.${moment}.${part}`;
}
