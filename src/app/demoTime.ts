// src/app/demoTime.ts
import type { StallRow } from "../db/schema.ts";
import { demoMomentTime } from "../demo/catalog.ts";
import type { HHMM } from "../domain/types.ts";

export function demoTimeOf(stall: StallRow | null | undefined): HHMM | null {
  const moment = stall?.settings.isDemo ? stall.demo?.moment : undefined;
  return stall && moment !== undefined
    ? demoMomentTime(moment, stall.settings)
    : null;
}
