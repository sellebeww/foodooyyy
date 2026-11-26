// src/domain/suggest.ts
import type {
  DayRecord,
  Menu,
  MenuDay,
  ReasonCode,
  ReasonScope,
  Suggestion,
} from "./types.ts";

const MIN_RATIO = 0.05;
const MAX_RATIO = 0.95;
const MAX_QTY = 999;
const SAME_WEEKDAY_LIMIT = 8;
const ANY_WEEKDAY_LIMIT = 14;
const MIN_HISTORY = 5;
const LEFTOVER_LIMIT_PERCENT = 20;

interface Observation {
  weekday: number;
  demand: number;
  menuDay: MenuDay;
}

export function criticalRatio(
  menu: Pick<Menu, "price" | "cost" | "salvage">,
): number {
  const spread = menu.price - menu.salvage;
  if (spread <= 0) {
    return MAX_RATIO;
  }
  const ratio = (menu.price - menu.cost) / spread;
  return Math.min(MAX_RATIO, Math.max(MIN_RATIO, ratio));
}

export function quantile(values: readonly number[], p: number): number {
  if (values.length === 0) {
    throw new RangeError("Cannot take a quantile of an empty list");
  }
  const sorted = [...values].sort((a, b) => a - b);
  const position = (sorted.length - 1) * p;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.min(lowerIndex + 1, sorted.length - 1);
  const lower = sorted[lowerIndex] as number;
  const upper = sorted[upperIndex] as number;
  return lower + (position - lowerIndex) * (upper - lower);
}

function eligibleObservations(
  menuId: string,
  menuDays: readonly MenuDay[],
  days: readonly DayRecord[],
): Observation[] {
  const records = new Map(days.map((day) => [day.date, day]));
  const found: Observation[] = [];
  for (const menuDay of menuDays) {
    const record = records.get(menuDay.date);
    if (
      menuDay.menuId === menuId &&
      menuDay.estimatedDemand !== null &&
      record !== undefined &&
      record.closed &&
      !record.unusual
    ) {
      found.push({
        weekday: record.weekday,
        demand: menuDay.estimatedDemand,
        menuDay,
      });
    }
  }
  return found.sort((a, b) => b.menuDay.date.localeCompare(a.menuDay.date));
}

function selectHistory(
  eligible: readonly Observation[],
  weekday: number,
): { history: Observation[]; scope: ReasonScope } {
  const sameWeekday = eligible
    .filter((item) => item.weekday === weekday)
    .slice(0, SAME_WEEKDAY_LIMIT);
  return sameWeekday.length >= MIN_HISTORY
    ? { history: sameWeekday, scope: "weekday" }
    : { history: eligible.slice(0, ANY_WEEKDAY_LIMIT), scope: "recent" };
}

function coldStart(
  base: number,
  last: Observation | undefined,
): { qty: number; code: ReasonCode } {
  if (last === undefined) {
    return { qty: base, code: "cold-start" };
  }
  if (last.menuDay.soldOutAt !== null) {
    return { qty: Math.floor((base * 11 + 9) / 10), code: "cold-start-up" };
  }
  const leftover = last.menuDay.leftover;
  if (
    leftover !== null &&
    leftover * 100 > LEFTOVER_LIMIT_PERCENT * last.menuDay.cookedQty
  ) {
    return { qty: Math.floor((base * 9) / 10), code: "cold-start-down" };
  }
  return { qty: base, code: "cold-start" };
}

export function suggestQty(
  menu: Menu,
  weekday: number,
  menuDays: readonly MenuDay[],
  days: readonly DayRecord[],
): Suggestion {
  const { history, scope } = selectHistory(
    eligibleObservations(menu.id, menuDays, days),
    weekday,
  );
  const latest = history[0];
  const useHistory = history.length >= MIN_HISTORY;
  const decision =
    useHistory && latest !== undefined
      ? {
          qty: Math.round(
            quantile(
              history.map((item) => item.demand),
              criticalRatio(menu),
            ),
          ),
          code: "history" as const,
        }
      : coldStart(menu.usualQty, latest);
  const qty = Math.min(MAX_QTY, Math.max(0, decision.qty));
  const reference =
    useHistory && latest !== undefined
      ? latest.menuDay.cookedQty
      : menu.usualQty;
  return {
    menuId: menu.id,
    qty,
    reason: {
      code: decision.code,
      scope,
      observations: history.length,
      soldOutDays: history.filter((item) => item.menuDay.soldOutAt !== null)
        .length,
      leftoverDays: history.filter(
        (item) => item.menuDay.leftover !== null && item.menuDay.leftover > 0,
      ).length,
      delta: qty - reference,
    },
  };
}
