// src/domain/time.ts
import type { HHMM, ISODate } from "./types.ts";

const HHMM_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MINUTES_PER_DAY = 1440;
const MS_PER_DAY = 86_400_000;

export function parseHHMM(value: HHMM): number {
  const match = HHMM_PATTERN.exec(value);
  if (match === null) {
    throw new RangeError(`Invalid time: ${value}`);
  }
  return Number(match[1]) * 60 + Number(match[2]);
}

export function formatHHMM(minutes: number): HHMM {
  if (!Number.isInteger(minutes) || minutes < 0 || minutes >= MINUTES_PER_DAY) {
    throw new RangeError(`Invalid minute of day: ${minutes}`);
  }
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
  const rest = String(minutes % 60).padStart(2, "0");
  return `${hours}:${rest}`;
}

export interface DayHours {
  openAt: HHMM;
  closeAt: HHMM;
}

export function spansMidnight(hours: DayHours): boolean {
  return parseHHMM(hours.closeAt) < parseHHMM(hours.openAt);
}

export function rolloverMinute(hours: DayHours): number {
  if (!spansMidnight(hours)) {
    return 0;
  }
  const open = parseHHMM(hours.openAt);
  const close = parseHHMM(hours.closeAt);
  return close + Math.floor((open - close) / 2);
}

export function dayMinute(time: HHMM, hours: DayHours): number {
  const minute = parseHHMM(time);
  return minute < rolloverMinute(hours) ? minute + MINUTES_PER_DAY : minute;
}

export function openMinute(hours: DayHours): number {
  return parseHHMM(hours.openAt);
}

export function closeMinute(hours: DayHours): number {
  return dayMinute(hours.closeAt, hours);
}

export function stallDate(date: ISODate, time: HHMM, hours: DayHours): ISODate {
  return parseHHMM(time) < rolloverMinute(hours) ? addDays(date, -1) : date;
}

function toUtcMs(date: ISODate): number {
  const match = ISO_DATE_PATTERN.exec(date);
  if (match === null) {
    throw new RangeError(`Invalid date: ${date}`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    throw new RangeError(`Invalid date: ${date}`);
  }
  return ms;
}

export function addDays(date: ISODate, days: number): ISODate {
  return new Date(toUtcMs(date) + days * MS_PER_DAY).toISOString().slice(0, 10);
}

export function weekdayOf(date: ISODate): number {
  return new Date(toUtcMs(date)).getUTCDay();
}
