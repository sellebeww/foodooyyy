// src/app/useStallStamp.ts
import { useStall } from "../db/hooks.ts";
import { stallDate, weekdayOf } from "../domain/time.ts";
import { useLocalStamp } from "./clock.ts";
import type { LocalStamp } from "./localStamp.ts";

export function useStallStamp(): LocalStamp {
  const stamp = useLocalStamp();
  const stall = useStall();
  if (!stall) {
    return stamp;
  }
  const date = stallDate(stamp.date, stamp.time, stall.settings);
  return date === stamp.date
    ? stamp
    : { date, time: stamp.time, weekday: weekdayOf(date) };
}
