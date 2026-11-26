// src/domain/plan.ts
import { suggestQty } from "./suggest.ts";
import type { DayRecord, Menu, MenuDay, Suggestion } from "./types.ts";

export const PLAN_QTY_MAX = 999;

export function isPlanQty(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0 && value <= PLAN_QTY_MAX;
}

export function clampQty(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function suggestAll(
  menus: readonly Menu[],
  weekday: number,
  menuDays: readonly MenuDay[],
  days: readonly DayRecord[],
): Suggestion[] {
  return menus
    .filter((menu) => !menu.archived)
    .map((menu) => suggestQty(menu, weekday, menuDays, days));
}

export function isCooked(menuDay: MenuDay): boolean {
  return menuDay.cookedQty > 0;
}

export function isPlanLocked(menuDays: readonly MenuDay[]): boolean {
  return menuDays.some((menuDay) => menuDay.soldOutAt !== null);
}
