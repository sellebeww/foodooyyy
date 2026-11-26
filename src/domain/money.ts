// src/domain/money.ts
import { countedDates } from "./metrics.ts";
import type { DayRecord, ISODate, Menu, MenuDay } from "./types.ts";

export interface PlanMoney {
  cost: number;
  revenue: number;
}

export interface WeekMoney {
  leftoverCost: number;
  missedEarnings: number;
}

export function planMoney(
  lines: readonly { menu: Menu; qty: number }[],
): PlanMoney {
  return {
    cost: lines.reduce((sum, line) => sum + line.qty * line.menu.cost, 0),
    revenue: lines.reduce((sum, line) => sum + line.qty * line.menu.price, 0),
  };
}

export function weeklyMoney(
  menuDays: readonly MenuDay[],
  days: readonly DayRecord[],
  menus: readonly Menu[],
  endDate: ISODate,
): WeekMoney {
  const counted = countedDates(days, endDate);
  const byId = new Map(menus.map((menu) => [menu.id, menu]));
  let leftoverCost = 0;
  let missedEarnings = 0;
  for (const item of menuDays) {
    const menu = byId.get(item.menuId);
    if (menu === undefined || !counted.has(item.date)) {
      continue;
    }
    leftoverCost +=
      (item.leftover ?? 0) * Math.max(0, menu.cost - menu.salvage);
    if (item.soldOutAt !== null && item.estimatedDemand !== null) {
      missedEarnings +=
        Math.max(0, item.estimatedDemand - item.cookedQty) *
        (menu.price - menu.cost);
    }
  }
  return { leftoverCost, missedEarnings };
}
