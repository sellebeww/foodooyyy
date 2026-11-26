// src/domain/setup.ts
import { parseHHMM } from "./time.ts";
import type { BusyLevel, HHMM } from "./types.ts";

export const NAME_MAX_LENGTH = 40;
export const USUAL_QTY_MAX = 999;
export const DEFAULT_BUSY_LEVEL: BusyLevel = 2;

export interface MenuInput {
  name: string;
  price: number;
  cost: number;
  salvage: number;
  usualQty: number;
}

export type MenuField = keyof MenuInput;

export type MenuErrorCode =
  | "nameLength"
  | "priceInvalid"
  | "costInvalid"
  | "costNotBelowPrice"
  | "salvageInvalid"
  | "salvageNotBelowPrice"
  | "usualInvalid";

export type MenuErrors = Partial<Record<MenuField, MenuErrorCode>>;

export type HoursField = "openAt" | "closeAt";
export type HoursErrorCode = "timeInvalid" | "closeSameAsOpen";

const MINUTES_PER_DAY = 1440;
export type HoursErrors = Partial<Record<HoursField, HoursErrorCode>>;

function isWholeAtLeast(value: number, min: number): boolean {
  return Number.isSafeInteger(value) && value >= min;
}

export function validateMenu(input: MenuInput): MenuErrors {
  const errors: MenuErrors = {};
  const nameLength = input.name.trim().length;
  if (nameLength < 1 || nameLength > NAME_MAX_LENGTH) {
    errors.name = "nameLength";
  }
  const priceValid = isWholeAtLeast(input.price, 1);
  if (!priceValid) {
    errors.price = "priceInvalid";
  }
  if (!isWholeAtLeast(input.cost, 0)) {
    errors.cost = "costInvalid";
  } else if (priceValid && input.cost >= input.price) {
    errors.cost = "costNotBelowPrice";
  }
  if (!isWholeAtLeast(input.salvage, 0)) {
    errors.salvage = "salvageInvalid";
  } else if (priceValid && input.salvage >= input.price) {
    errors.salvage = "salvageNotBelowPrice";
  }
  if (!isWholeAtLeast(input.usualQty, 1) || input.usualQty > USUAL_QTY_MAX) {
    errors.usualQty = "usualInvalid";
  }
  return errors;
}

function minutesOrNull(value: HHMM): number | null {
  try {
    return parseHHMM(value);
  } catch {
    return null;
  }
}

export function validateHours(openAt: HHMM, closeAt: HHMM): HoursErrors {
  const open = minutesOrNull(openAt);
  const close = minutesOrNull(closeAt);
  const errors: HoursErrors = {};
  if (open === null) {
    errors.openAt = "timeInvalid";
  }
  if (close === null) {
    errors.closeAt = "timeInvalid";
  } else if (open !== null && close === open) {
    errors.closeAt = "closeSameAsOpen";
  }
  return errors;
}

export function profileHours(openAt: HHMM, closeAt: HHMM): string[] {
  const open = minutesOrNull(openAt);
  const close = minutesOrNull(closeAt);
  if (open === null || close === null || close === open) {
    return [];
  }
  const end = close < open ? close + MINUTES_PER_DAY : close;
  const hours = new Set<string>();
  for (let hour = Math.floor(open / 60); hour * 60 < end; hour += 1) {
    hours.add(String(hour % 24).padStart(2, "0"));
  }
  return [...hours];
}

export function resizeProfile(
  profile: Readonly<Record<string, BusyLevel>>,
  openAt: HHMM,
  closeAt: HHMM,
): Record<string, BusyLevel> {
  const resized: Record<string, BusyLevel> = {};
  for (const hour of profileHours(openAt, closeAt)) {
    resized[hour] = profile[hour] ?? DEFAULT_BUSY_LEVEL;
  }
  return resized;
}

export function nextBusyLevel(level: BusyLevel): BusyLevel {
  if (level === 1) {
    return 2;
  }
  return level === 2 ? 4 : 1;
}
