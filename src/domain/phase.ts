// src/domain/phase.ts
import { closeMinute, dayMinute } from "./time.ts";
import type { DayRecord, HHMM, MenuDay } from "./types.ts";

export type LoopPhase = "plan" | "service" | "close";
export type Phase = LoopPhase | "done";
export type SegmentStatus = "done" | "current" | "next";

export const LOOP_PHASES: readonly LoopPhase[] = ["plan", "service", "close"];

export interface DaySummary {
  plannedCount: number;
  portions: number;
  soldOutCount: number;
  closed: boolean;
}

export interface PhaseInput extends DaySummary {
  time: HHMM;
  openAt: HHMM;
  closeAt: HHMM;
}

export function summarizeDay(
  menuDays: readonly MenuDay[],
  day: DayRecord | undefined,
): DaySummary {
  return {
    plannedCount: menuDays.filter((item) => item.cookedQty > 0).length,
    portions: menuDays.reduce((sum, item) => sum + item.cookedQty, 0),
    soldOutCount: menuDays.filter((item) => item.soldOutAt !== null).length,
    closed: day?.closed ?? false,
  };
}

export function todayPhase(input: PhaseInput): Phase {
  if (input.closed) {
    return "done";
  }
  if (input.plannedCount === 0) {
    return "plan";
  }
  if (
    input.soldOutCount >= input.plannedCount ||
    dayMinute(input.time, input) >= closeMinute(input)
  ) {
    return "close";
  }
  return "service";
}

export function segmentStatus(phase: Phase, segment: LoopPhase): SegmentStatus {
  if (phase === "done") {
    return "done";
  }
  const current = LOOP_PHASES.indexOf(phase);
  const index = LOOP_PHASES.indexOf(segment);
  if (index < current) {
    return "done";
  }
  return index === current ? "current" : "next";
}
