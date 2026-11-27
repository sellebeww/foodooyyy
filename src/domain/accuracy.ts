// src/domain/accuracy.ts
import { criticalRatio } from "./suggest.ts";
import { addDays } from "./time.ts";
import type { DayRecord, ISODate, Menu, MenuDay } from "./types.ts";

export const MIN_CHECK_DAYS = 5;
export const CHECK_WINDOW_DAYS = 28;

export interface SuggestionCheck {
  evaluated: number;
  enough: boolean;
  meanAbsoluteError: number | null;
  coveredShare: number | null;
  targetShare: number | null;
  overDays: number;
  underDays: number;
  includesEstimates: boolean;
}

export function suggestionCheck(
  menuDays: readonly MenuDay[],
  days: readonly DayRecord[],
  menus: readonly Menu[],
  endDate: ISODate,
): SuggestionCheck {
  const startDate = addDays(endDate, 1 - CHECK_WINDOW_DAYS);
  const records = new Map(days.map((day) => [day.date, day]));
  const byId = new Map(menus.map((menu) => [menu.id, menu]));
  let evaluated = 0;
  let errorSum = 0;
  let covered = 0;
  let over = 0;
  let under = 0;
  let targetSum = 0;
  let includesEstimates = false;
  for (const item of menuDays) {
    const record = records.get(item.date);
    const menu = byId.get(item.menuId);
    if (
      record === undefined ||
      menu === undefined ||
      !record.closed ||
      record.unusual ||
      item.date < startDate ||
      item.date > endDate ||
      item.suggestedQty === null ||
      item.estimatedDemand === null ||
      item.reason?.code !== "history"
    ) {
      continue;
    }
    const gap = item.suggestedQty - item.estimatedDemand;
    evaluated += 1;
    errorSum += Math.abs(gap);
    covered += gap >= 0 ? 1 : 0;
    over += gap > 0 ? 1 : 0;
    under += gap < 0 ? 1 : 0;
    targetSum += criticalRatio(menu);
    includesEstimates = includesEstimates || item.demandIsEstimate;
  }
  const enough = evaluated >= MIN_CHECK_DAYS;
  return {
    evaluated,
    enough,
    meanAbsoluteError: enough ? errorSum / evaluated : null,
    coveredShare: enough ? covered / evaluated : null,
    targetShare: enough ? targetSum / evaluated : null,
    overDays: over,
    underDays: under,
    includesEstimates,
  };
}
