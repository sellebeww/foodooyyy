// src/app/useCurrentPhase.ts
import { useMenus, useStall, useTodayState } from "../db/hooks.ts";
import { summarizeDay, todayPhase, type Phase } from "../domain/phase.ts";
import { useStallStamp } from "./useStallStamp.ts";

export function useCurrentPhase(): Phase | null {
  const { date, time } = useStallStamp();
  const stall = useStall();
  const menus = useMenus();
  const today = useTodayState(date);
  if (!stall?.setupComplete || menus === undefined || today === undefined) {
    return null;
  }
  const summary = summarizeDay(today.menuDays, today.day);
  if (summary.plannedCount === 0 && menus.every((menu) => menu.archived)) {
    return null;
  }
  return todayPhase({
    ...summary,
    time,
    openAt: stall.settings.openAt,
    closeAt: stall.settings.closeAt,
  });
}
