// src/app/useStallStamp.ts
import { useStall } from "../db/hooks.ts";
import { stallDate, weekdayOf } from "../domain/time.ts";
import { useLocalStamp } from "./clock.ts";
import { demoTimeOf } from "./demoTime.ts";
import type { LocalStamp } from "./localStamp.ts";

export function useStallStamp(): LocalStamp {
  const stamp = useLocalStamp();
  const stall = useStall();
  if (!stall) {
    return stamp;
  }
  const date = stallDate(stamp.date, stamp.time, stall.settings);
  const time = demoTimeOf(stall) ?? stamp.time;
  return date === stamp.date
    ? { ...stamp, time }
    : { date, time, weekday: weekdayOf(date) };
}
