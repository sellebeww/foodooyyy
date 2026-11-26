// src/domain/estimate.ts
import { closeMinute, dayMinute, openMinute } from "./time.ts";
import type { DemandEstimate, HHMM, StallSettings } from "./types.ts";

const DEFAULT_WEIGHT = 2;
const FULL_SHARE_NUMERATOR = 19;
const FULL_SHARE_DENOMINATOR = 20;
export const DEMAND_CAP_FACTOR = 3;

export function hourWeight(settings: StallSettings, hour: number): number {
  const level = settings.busyProfile[String(hour).padStart(2, "0")];
  return level ?? DEFAULT_WEIGHT;
}

function weightedMinutes(settings: StallSettings, untilMinute: number): number {
  const open = openMinute(settings);
  const end = Math.min(untilMinute, closeMinute(settings));
  let total = 0;
  for (let hour = Math.floor(open / 60); hour * 60 < end; hour += 1) {
    const from = Math.max(open, hour * 60);
    const to = Math.min(end, (hour + 1) * 60);
    total += hourWeight(settings, hour % 24) * Math.max(0, to - from);
  }
  return total;
}

export function arrivalWeights(
  settings: StallSettings,
  at: HHMM,
): { arrived: number; total: number } {
  return {
    arrived: weightedMinutes(settings, dayMinute(at, settings)),
    total: weightedMinutes(settings, closeMinute(settings)),
  };
}

export function arrivalShare(settings: StallSettings, at: HHMM): number {
  const { arrived, total } = arrivalWeights(settings, at);
  return total === 0 ? 1 : arrived / total;
}

function assertQuantities(cooked: number, leftover: number | null): void {
  if (!Number.isInteger(cooked) || cooked < 0) {
    throw new RangeError(`Invalid cooked quantity: ${cooked}`);
  }
  if (
    leftover !== null &&
    (!Number.isInteger(leftover) || leftover < 0 || leftover > cooked)
  ) {
    throw new RangeError(`Invalid leftover: ${leftover} of ${cooked}`);
  }
}

export function estimateDemand(
  cooked: number,
  leftover: number | null,
  soldOutAt: HHMM | null,
  settings: StallSettings,
): DemandEstimate | null {
  assertQuantities(cooked, leftover);
  if (soldOutAt === null) {
    return leftover === null
      ? null
      : { demand: cooked - leftover, isEstimate: false };
  }
  const { arrived, total } = arrivalWeights(settings, soldOutAt);
  if (arrived * FULL_SHARE_DENOMINATOR >= total * FULL_SHARE_NUMERATOR) {
    return { demand: cooked, isEstimate: true };
  }
  const cap = cooked * DEMAND_CAP_FACTOR;
  if (arrived === 0) {
    return { demand: cap, isEstimate: true };
  }
  const rounded = Math.floor((2 * cooked * total + arrived) / (2 * arrived));
  return { demand: Math.min(rounded, cap), isEstimate: true };
}
