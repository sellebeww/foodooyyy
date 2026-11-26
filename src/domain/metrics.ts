// src/domain/metrics.ts
import { addDays } from "./time.ts";
import type { DayRecord, HHMM, ISODate, MenuDay } from "./types.ts";

const WINDOW_DAYS = 7;

export interface MenuWeeklyMetrics {
  menuDayCount: number;
  leftoverPortions: number;
  sellOutEvents: number;
  sellOutFrequency: number;
  estimatedLostSales: number;
  suggestedCount: number;
  acceptedWithoutEdit: number;
  acceptanceShare: number | null;
}

export interface WeeklyMetrics extends MenuWeeklyMetrics {
  byMenu: Record<string, MenuWeeklyMetrics>;
}

function aggregate(items: readonly MenuDay[]): MenuWeeklyMetrics {
  const leftoverPortions = items.reduce(
    (sum, item) => sum + (item.leftover ?? 0),
    0,
  );
  const soldOut = items.filter((item) => item.soldOutAt !== null);
  const estimatedLostSales = soldOut.reduce(
    (sum, item) =>
      sum +
      (item.estimatedDemand === null
        ? 0
        : Math.max(0, item.estimatedDemand - item.cookedQty)),
    0,
  );
  const suggested = items.filter((item) => item.suggestedQty !== null);
  const acceptedWithoutEdit = suggested.filter(
    (item) => item.cookedQty === item.suggestedQty,
  ).length;

  return {
    menuDayCount: items.length,
    leftoverPortions,
    sellOutEvents: soldOut.length,
    sellOutFrequency: items.length === 0 ? 0 : soldOut.length / items.length,
    estimatedLostSales,
    suggestedCount: suggested.length,
    acceptedWithoutEdit,
    acceptanceShare:
      suggested.length === 0 ? null : acceptedWithoutEdit / suggested.length,
  };
}

export function countedDates(
  days: readonly DayRecord[],
  endDate: ISODate,
): Set<ISODate> {
  const startDate = addDays(endDate, 1 - WINDOW_DAYS);
  return new Set(
    days
      .filter(
        (day) =>
          day.closed &&
          !day.unusual &&
          day.date >= startDate &&
          day.date <= endDate,
      )
      .map((day) => day.date),
  );
}

export function weeklyMetrics(
  menuDays: readonly MenuDay[],
  days: readonly DayRecord[],
  endDate: ISODate,
): WeeklyMetrics {
  const counted = countedDates(days, endDate);
  const included = menuDays.filter((item) => counted.has(item.date));

  const groups = new Map<string, MenuDay[]>();
  for (const item of included) {
    const group = groups.get(item.menuId) ?? [];
    group.push(item);
    groups.set(item.menuId, group);
  }
  const byMenu: Record<string, MenuWeeklyMetrics> = {};
  for (const [menuId, group] of groups) {
    byMenu[menuId] = aggregate(group);
  }

  return { ...aggregate(included), byMenu };
}

export interface MenuDayRow {
  date: ISODate;
  cooked: number;
  sold: number | null;
  leftover: number | null;
  soldOutAt: HHMM | null;
  demand: number | null;
  isEstimate: boolean;
}

export interface MenuTotals {
  days: number;
  cooked: number;
  sold: number;
  leftover: number;
  demand: number;
  demandHasEstimate: boolean;
}

export interface DayListItem {
  date: ISODate;
  closed: boolean;
  unusual: boolean;
  portions: number;
  soldOutCount: number;
}

export function soldPortions(item: MenuDay): number | null {
  if (item.soldOutAt !== null) {
    return item.cookedQty;
  }
  return item.leftover === null ? null : item.cookedQty - item.leftover;
}

function toRow(item: MenuDay): MenuDayRow {
  return {
    date: item.date,
    cooked: item.cookedQty,
    sold: soldPortions(item),
    leftover: item.leftover,
    soldOutAt: item.soldOutAt,
    demand: item.estimatedDemand,
    isEstimate: item.estimatedDemand !== null && item.demandIsEstimate,
  };
}

export function menuTotals(
  menuDays: readonly MenuDay[],
  days: readonly DayRecord[],
  endDate: ISODate,
): Record<string, MenuTotals> {
  const counted = countedDates(days, endDate);
  const totals: Record<string, MenuTotals> = {};
  for (const item of menuDays) {
    if (!counted.has(item.date)) {
      continue;
    }
    const row = toRow(item);
    const total = totals[item.menuId] ?? {
      days: 0,
      cooked: 0,
      sold: 0,
      leftover: 0,
      demand: 0,
      demandHasEstimate: false,
    };
    totals[item.menuId] = {
      days: total.days + 1,
      cooked: total.cooked + row.cooked,
      sold: total.sold + (row.sold ?? 0),
      leftover: total.leftover + (row.leftover ?? 0),
      demand: total.demand + (row.demand ?? 0),
      demandHasEstimate: total.demandHasEstimate || row.isEstimate,
    };
  }
  return totals;
}

export function menuSeries(
  menuDays: readonly MenuDay[],
  days: readonly DayRecord[],
  menuId: string,
  endDate: ISODate,
): MenuDayRow[] {
  const counted = countedDates(days, endDate);
  return menuDays
    .filter((item) => item.menuId === menuId && counted.has(item.date))
    .map(toRow)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function dayRows(menuDays: readonly MenuDay[]): MenuDayRow[] {
  return menuDays.map(toRow);
}

export function pastDays(
  days: readonly DayRecord[],
  menuDays: readonly MenuDay[],
  endDate: ISODate,
): DayListItem[] {
  const items = new Map<ISODate, DayListItem>();
  for (const day of days) {
    if (day.date <= endDate) {
      items.set(day.date, {
        date: day.date,
        closed: day.closed,
        unusual: day.unusual,
        portions: 0,
        soldOutCount: 0,
      });
    }
  }
  for (const item of menuDays) {
    if (item.date > endDate) {
      continue;
    }
    const entry = items.get(item.date) ?? {
      date: item.date,
      closed: false,
      unusual: false,
      portions: 0,
      soldOutCount: 0,
    };
    items.set(item.date, {
      ...entry,
      portions: entry.portions + item.cookedQty,
      soldOutCount: entry.soldOutCount + (item.soldOutAt === null ? 0 : 1),
    });
  }
  return [...items.values()].sort((a, b) => b.date.localeCompare(a.date));
}
