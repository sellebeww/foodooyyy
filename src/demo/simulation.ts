// src/demo/simulation.ts
import { suggestAll } from "../domain/plan.ts";
import type { Visit } from "../domain/pattern.ts";
import { addDays, closeMinute, openMinute, weekdayOf } from "../domain/time.ts";
import type {
  DayRecord,
  ISODate,
  MenuDay,
  StallSettings,
} from "../domain/types.ts";
import {
  createRng,
  drawDay,
  observeOutcome,
  toMenuDay,
  type DemoScenario,
} from "./generator.ts";

export type SimPlanRow = Pick<
  MenuDay,
  "menuId" | "suggestedQty" | "reason" | "cookedQty"
>;

export interface SimState {
  date: ISODate;
  hoursDone: number;
  daysDone: number;
  plan: SimPlanRow[];
  visits: Visit[];
  pastVisits: Visit[];
  days: DayRecord[];
  menuDays: MenuDay[];
}

export function hourStarts(settings: StallSettings): number[] {
  const starts: number[] = [];
  const close = closeMinute(settings);
  for (
    let start = Math.floor(openMinute(settings) / 60) * 60;
    start < close;
    start += 60
  ) {
    starts.push(start);
  }
  return starts;
}

function openDay(
  scenario: DemoScenario,
  date: ISODate,
  days: readonly DayRecord[],
  menuDays: readonly MenuDay[],
): Pick<SimState, "date" | "plan" | "visits"> {
  const plan = suggestAll(scenario.menus, weekdayOf(date), menuDays, days).map(
    (suggestion): SimPlanRow => ({
      menuId: suggestion.menuId,
      suggestedQty: suggestion.qty,
      reason: suggestion.reason,
      cookedQty: Math.max(1, suggestion.qty),
    }),
  );
  const draw = drawDay(
    createRng(`${scenario.seed}:simulation:${date}`),
    date,
    scenario.menus,
    scenario.settings,
    scenario.trueMeans,
    scenario.weekdayFactors,
    0,
  );
  const visits = plan
    .flatMap((row) =>
      (draw.arrivals[row.menuId] ?? []).map((minute, index): Visit => ({
        minute,
        menuId: row.menuId,
        served: index < row.cookedQty,
      })),
    )
    .sort((a, b) => a.minute - b.minute);
  return { date, plan, visits };
}

export function startSimulation(
  scenario: DemoScenario,
  date: ISODate,
  days: readonly DayRecord[],
  menuDays: readonly MenuDay[],
): SimState {
  const pastDays = days.filter((day) => day.date < date);
  const pastMenuDays = menuDays.filter((row) => row.date < date);
  return {
    ...openDay(scenario, date, pastDays, pastMenuDays),
    hoursDone: 0,
    daysDone: 0,
    pastVisits: [],
    days: pastDays,
    menuDays: pastMenuDays,
  };
}

function closeSimDay(scenario: DemoScenario, state: SimState): SimState {
  const closed = state.plan.map((row) => {
    const arrivals = state.visits
      .filter((visit) => visit.menuId === row.menuId)
      .map((visit) => visit.minute);
    return toMenuDay(
      state.date,
      row.menuId,
      observeOutcome(row.cookedQty, arrivals.length, arrivals),
      scenario.settings,
      { suggestedQty: row.suggestedQty, reason: row.reason },
    );
  });
  return {
    ...state,
    daysDone: state.daysDone + 1,
    pastVisits: [...state.pastVisits, ...state.visits],
    days: [
      ...state.days,
      {
        date: state.date,
        weekday: weekdayOf(state.date),
        unusual: false,
        closed: true,
      },
    ],
    menuDays: [...state.menuDays, ...closed],
  };
}

export function stepSimulation(
  scenario: DemoScenario,
  state: SimState,
): SimState {
  const total = hourStarts(scenario.settings).length;
  if (state.hoursDone >= total) {
    return {
      ...state,
      ...openDay(scenario, addDays(state.date, 1), state.days, state.menuDays),
      hoursDone: 0,
    };
  }
  const next = { ...state, hoursDone: state.hoursDone + 1 };
  return next.hoursDone === total ? closeSimDay(scenario, next) : next;
}
