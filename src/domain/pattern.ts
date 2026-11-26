// src/domain/pattern.ts
import type { DayRecord, Menu, MenuDay } from "./types.ts";

export const PATTERN_WINDOW = 14;

export interface Visit {
  minute: number;
  menuId: string;
  served: boolean;
}

export interface HourLoad {
  start: number;
  sold: number;
  missed: number;
}

export type MenuSignal = "loss" | "sellsOut" | "leftOver" | "steady";

export interface MenuPattern {
  menuId: string;
  days: number;
  soldOutDays: number;
  leftover: number;
  demand: number;
  profit: number;
  signal: MenuSignal;
}

export function hourLoads(
  visits: readonly Visit[],
  starts: readonly number[],
): HourLoad[] {
  return starts.map((start) => {
    const inHour = visits.filter(
      (visit) => visit.minute >= start && visit.minute < start + 60,
    );
    const sold = inHour.filter((visit) => visit.served).length;
    return { start, sold, missed: inHour.length - sold };
  });
}

export function averageLoads(
  loads: readonly HourLoad[],
  fullDays: number,
  partialHours: number,
): HourLoad[] {
  return loads.map((load, index) => {
    const days = fullDays + (index < partialHours ? 1 : 0);
    return days === 0
      ? { start: load.start, sold: 0, missed: 0 }
      : {
          start: load.start,
          sold: load.sold / days,
          missed: load.missed / days,
        };
  });
}

function signalOf(
  profit: number,
  soldOutDays: number,
  days: number,
  leftover: number,
  cooked: number,
): MenuSignal {
  if (profit < 0) {
    return "loss";
  }
  if (soldOutDays * 2 >= days) {
    return "sellsOut";
  }
  return leftover * 5 > cooked ? "leftOver" : "steady";
}

export function rankMenus(
  menus: readonly Menu[],
  menuDays: readonly MenuDay[],
  days: readonly DayRecord[],
): MenuPattern[] {
  const usable = new Set(
    days.filter((day) => day.closed && !day.unusual).map((day) => day.date),
  );
  const patterns: MenuPattern[] = [];
  for (const menu of menus.filter((item) => !item.archived)) {
    const rows = menuDays
      .filter(
        (row) =>
          row.menuId === menu.id &&
          usable.has(row.date) &&
          row.estimatedDemand !== null,
      )
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, PATTERN_WINDOW);
    if (rows.length === 0) {
      continue;
    }
    let cooked = 0;
    let leftover = 0;
    let demand = 0;
    let profit = 0;
    for (const row of rows) {
      const left = row.leftover ?? 0;
      cooked += row.cookedQty;
      leftover += left;
      demand += Number(row.estimatedDemand);
      profit +=
        (row.cookedQty - left) * menu.price +
        left * menu.salvage -
        row.cookedQty * menu.cost;
    }
    const count = rows.length;
    const soldOutDays = rows.filter((row) => row.soldOutAt !== null).length;
    patterns.push({
      menuId: menu.id,
      days: count,
      soldOutDays,
      leftover: leftover / count,
      demand: demand / count,
      profit: Math.round(profit / count),
      signal: signalOf(profit, soldOutDays, count, leftover, cooked),
    });
  }
  return patterns.sort((a, b) => b.profit - a.profit);
}
