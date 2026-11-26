// src/app/useActionTime.ts
import { useStall } from "../db/hooks.ts";
import type { HHMM } from "../domain/types.ts";
import { useClock } from "./clock.ts";
import { demoTimeOf } from "./demoTime.ts";
import { toLocalStamp } from "./localStamp.ts";

export function useActionTime(): () => HHMM {
  const clock = useClock();
  const stall = useStall();
  return () => demoTimeOf(stall) ?? toLocalStamp(clock.now()).time;
}
