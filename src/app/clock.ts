// src/app/clock.ts
import { createContext, useContext, useEffect, useState } from "react";
import { toLocalStamp, type LocalStamp } from "./localStamp.ts";

export const CLOCK_TICK_MS = 30_000;

export interface ClockValue {
  now: () => Date;
}

export const ClockContext = createContext<ClockValue>({
  now: () => new Date(),
});

export function useNow(intervalMs: number = CLOCK_TICK_MS): Date {
  const { now } = useContext(ClockContext);
  const [value, setValue] = useState(now);
  useEffect(() => {
    const tick = () => {
      setValue(now());
    };
    const timer = window.setInterval(tick, intervalMs);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [now, intervalMs]);
  return value;
}

export function useLocalStamp(): LocalStamp {
  return toLocalStamp(useNow());
}

export function useClock(): ClockValue {
  return useContext(ClockContext);
}
