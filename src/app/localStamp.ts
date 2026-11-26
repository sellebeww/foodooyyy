// src/app/localStamp.ts
import type { HHMM, ISODate } from "../domain/types.ts";

export interface LocalStamp {
  date: ISODate;
  time: HHMM;
  weekday: number;
}

function pad(value: number, length = 2): string {
  return String(value).padStart(length, "0");
}

export function toLocalStamp(at: Date): LocalStamp {
  return {
    date: `${pad(at.getFullYear(), 4)}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`,
    time: `${pad(at.getHours())}:${pad(at.getMinutes())}`,
    weekday: at.getDay(),
  };
}
