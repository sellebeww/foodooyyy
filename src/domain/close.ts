// src/domain/close.ts
import { estimateDemand } from "./estimate.ts";
import { isCooked, suggestAll } from "./plan.ts";
import { markSoldOut } from "./pos.ts";
import {
  addDays,
  closeMinute,
  dayMinute,
  openMinute,
  parseHHMM,
  weekdayOf,
} from "./time.ts";
import type {
  DayRecord,
  HHMM,
  ISODate,
  Menu,
  MenuDay,
  SoldOutSource,
  StallSettings,
  Suggestion,
} from "./types.ts";

export interface CloseEntry {
  menuId: string;
  leftover: number | null;
  soldOutAt: HHMM | null;
  soldOutSource?: SoldOutSource;
}

export interface ClosedDay {
  day: DayRecord;
  menuDays: MenuDay[];
}

export interface TomorrowPlan {
  date: ISODate;
  weekday: number;
  suggestions: Suggestion[];
}

export type SoldOutTimeError = "timeInvalid" | "outsideHours";

export const EARLY_SELL_OUT_MINUTES = 30;

export function validateSoldOutTime(
  time: HHMM,
  settings: Pick<StallSettings, "openAt" | "closeAt">,
): SoldOutTimeError | null {
  try {
    parseHHMM(time);
  } catch {
    return "timeInvalid";
  }
  const minute = dayMinute(time, settings);
  if (minute < openMinute(settings) || minute > closeMinute(settings)) {
    return "outsideHours";
  }
  return null;
}

export function isEarlySellOut(
  time: HHMM,
  settings: Pick<StallSettings, "openAt" | "closeAt">,
): boolean {
  return (
    dayMinute(time, settings) < openMinute(settings) + EARLY_SELL_OUT_MINUTES
  );
}

export function missingLeftovers(
  rows: readonly MenuDay[],
  leftovers: Readonly<Record<string, number>>,
): string[] {
  return rows
    .filter(
      (row) =>
        isCooked(row) &&
        row.soldOutAt === null &&
        leftovers[row.menuId] === undefined,
    )
    .map((row) => row.menuId);
}

export function closeMenuDay(
  menuDay: MenuDay,
  entry: Omit<CloseEntry, "menuId">,
  settings: StallSettings,
): MenuDay {
  if (!isCooked(menuDay)) {
    return {
      ...markSoldOut(menuDay, null, "manual"),
      leftover: 0,
      estimatedDemand: null,
      demandIsEstimate: false,
    };
  }
  const soldOutAt = entry.soldOutAt;
  const leftover = soldOutAt === null ? entry.leftover : 0;
  if (soldOutAt === null && leftover === 0) {
    throw new RangeError(
      `Missing sell-out time for ${menuDay.menuId}: leftover is 0`,
    );
  }
  const estimate = estimateDemand(
    menuDay.cookedQty,
    leftover,
    soldOutAt,
    settings,
  );
  if (estimate === null) {
    throw new RangeError(`Missing leftover for ${menuDay.menuId}`);
  }
  return {
    ...markSoldOut(
      menuDay,
      soldOutAt,
      entry.soldOutSource ?? menuDay.soldOutSource ?? "manual",
    ),
    leftover,
    estimatedDemand: estimate.demand,
    demandIsEstimate: estimate.isEstimate,
  };
}

export function closeDayRecords(
  date: ISODate,
  unusual: boolean,
  todayRows: readonly MenuDay[],
  entries: readonly CloseEntry[],
  settings: StallSettings,
): ClosedDay {
  const byMenu = new Map(entries.map((entry) => [entry.menuId, entry]));
  const menuDays = todayRows.map((row) => {
    if (row.date !== date) {
      throw new RangeError(`Row for ${row.date} given to close ${date}`);
    }
    const entry = byMenu.get(row.menuId);
    if (entry === undefined && isCooked(row)) {
      throw new RangeError(`No close entry for ${row.menuId}`);
    }
    return closeMenuDay(
      row,
      entry ?? { leftover: 0, soldOutAt: null },
      settings,
    );
  });
  return {
    day: { date, weekday: weekdayOf(date), unusual, closed: true },
    menuDays,
  };
}

export function withClosedDay(
  menuDays: readonly MenuDay[],
  days: readonly DayRecord[],
  closed: ClosedDay,
): { menuDays: MenuDay[]; days: DayRecord[] } {
  const date = closed.day.date;
  return {
    menuDays: [
      ...menuDays.filter((menuDay) => menuDay.date !== date),
      ...closed.menuDays,
    ],
    days: [...days.filter((day) => day.date !== date), closed.day],
  };
}

export function tomorrowPlan(
  date: ISODate,
  menus: readonly Menu[],
  menuDays: readonly MenuDay[],
  days: readonly DayRecord[],
): TomorrowPlan {
  const tomorrow = addDays(date, 1);
  const weekday = weekdayOf(tomorrow);
  return {
    date: tomorrow,
    weekday,
    suggestions: suggestAll(menus, weekday, menuDays, days),
  };
}

export function incompleteDays(
  days: readonly DayRecord[],
  menuDays: readonly MenuDay[],
  today: ISODate,
): ISODate[] {
  const planned = new Set(
    menuDays.filter((menuDay) => isCooked(menuDay)).map((item) => item.date),
  );
  return days
    .filter((day) => !day.closed && day.date < today && planned.has(day.date))
    .map((day) => day.date)
    .sort((a, b) => b.localeCompare(a));
}
