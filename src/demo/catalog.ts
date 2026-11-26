// src/demo/catalog.ts
import {
  closeMinute,
  formatHHMM,
  openMinute,
  stallDate,
  type DayHours,
} from "../domain/time.ts";
import type { HHMM, ISODate } from "../domain/types.ts";

export type DemoScenarioId = 1 | 2 | 3 | 4;

export const DEMO_SCENARIO_IDS: readonly DemoScenarioId[] = [1, 2, 3, 4];
export const DEFAULT_DEMO_SCENARIO: DemoScenarioId = 1;

export type DemoMoment = "plan" | "service" | "close" | "summary";

export const DEMO_MOMENTS: readonly DemoMoment[] = [
  "plan",
  "service",
  "close",
  "summary",
];

export const DEMO_MOMENT_PATHS: Record<DemoMoment, string> = {
  plan: "/plan",
  service: "/service",
  close: "/close",
  summary: "/history",
};

export const DEMO_SERVICE_SHARE = 0.6;

export interface DemoCatalogEntry {
  id: DemoScenarioId;
  stallName: string;
  openAt: HHMM;
  closeAt: HHMM;
  historyDays: number;
}

export const DEMO_CATALOG: readonly DemoCatalogEntry[] = [
  {
    id: 1,
    stallName: "Warung Demo",
    openAt: "06:00",
    closeAt: "14:00",
    historyDays: 56,
  },
  {
    id: 2,
    stallName: "Demo Warung Makan Kantor",
    openAt: "10:00",
    closeAt: "15:00",
    historyDays: 56,
  },
  {
    id: 3,
    stallName: "Demo Angkringan Malam",
    openAt: "18:00",
    closeAt: "02:00",
    historyDays: 56,
  },
  {
    id: 4,
    stallName: "Demo Warung Baru Buka",
    openAt: "07:00",
    closeAt: "13:00",
    historyDays: 4,
  },
];

export function isDemoScenarioId(value: unknown): value is DemoScenarioId {
  return DEMO_SCENARIO_IDS.some((id) => id === value);
}

export function isDemoMoment(value: unknown): value is DemoMoment {
  return DEMO_MOMENTS.some((moment) => moment === value);
}

export function demoMinute(hours: DayHours, share: number): number {
  const open = openMinute(hours);
  return open + Math.round(((closeMinute(hours) - open) * share) / 5) * 5;
}

export function demoMomentTime(moment: DemoMoment, hours: DayHours): HHMM {
  const close = closeMinute(hours);
  const minute =
    moment === "close"
      ? close
      : moment === "service"
        ? demoMinute(hours, DEMO_SERVICE_SHARE)
        : Math.min(close, openMinute(hours) + 60);
  return formatHHMM(minute % 1440);
}

const ON_VALUES = new Set(["", "on", "1", "true", "yes"]);
const OFF_VALUES = new Set(["off", "0", "false", "no", "none"]);

export function parseDemoEnabled(raw: string | undefined): boolean {
  const value = (raw ?? "").trim().toLowerCase();
  if (ON_VALUES.has(value)) {
    return true;
  }
  if (OFF_VALUES.has(value)) {
    return false;
  }
  throw new RangeError(`Invalid VITE_DEMO: "${raw ?? ""}". Use on or off.`);
}

export function demoStallDate(
  entry: DemoCatalogEntry,
  date: ISODate,
  time: HHMM,
): ISODate {
  return stallDate(date, time, entry);
}
