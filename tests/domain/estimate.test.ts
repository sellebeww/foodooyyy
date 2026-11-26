// tests/domain/estimate.test.ts
import { describe, expect, it } from "vitest";
import {
  arrivalShare,
  arrivalWeights,
  estimateDemand,
  hourWeight,
} from "../../src/domain/estimate.ts";
import type { StallSettings } from "../../src/domain/types.ts";
import { referenceSettings } from "../helpers.ts";

describe("arrivalShare", () => {
  it("T1: is 12/23 at 10:30", () => {
    expect(arrivalShare(referenceSettings, "10:30")).toBeCloseTo(12 / 23, 10);
  });

  it("T2: is 18/23 at 12:15", () => {
    expect(arrivalShare(referenceSettings, "12:15")).toBeCloseTo(18 / 23, 10);
  });

  it("T3: is 0 before opening and 1 at closing", () => {
    expect(arrivalShare(referenceSettings, "05:30")).toBe(0);
    expect(arrivalShare(referenceSettings, "14:00")).toBe(1);
    expect(arrivalShare(referenceSettings, "15:00")).toBe(1);
  });

  it("is 0 at the opening minute", () => {
    expect(arrivalShare(referenceSettings, "06:00")).toBe(0);
  });

  it("counts hours after midnight for a night stall", () => {
    const night: StallSettings = {
      openAt: "20:00",
      closeAt: "04:00",
      busyProfile: {
        "20": 1,
        "21": 4,
        "22": 4,
        "23": 2,
        "00": 2,
        "01": 4,
        "02": 4,
        "03": 2,
      },
      isDemo: false,
    };
    expect(arrivalShare(night, "00:30")).toBeCloseTo(
      arrivalShare(referenceSettings, "10:30"),
      10,
    );
    expect(arrivalShare(night, "04:00")).toBe(1);
    expect(estimateDemand(42, 0, "00:30", night)).toEqual(
      estimateDemand(42, 0, "10:30", referenceSettings),
    );
  });

  it("treats a missing hour as normal (weight 2)", () => {
    const sparse: StallSettings = { ...referenceSettings, busyProfile: {} };
    expect(hourWeight(sparse, 7)).toBe(2);
    expect(arrivalShare(sparse, "10:00")).toBeCloseTo(0.5, 10);
  });

  it("handles opening and closing times that are not on the hour", () => {
    const halfHour: StallSettings = {
      ...referenceSettings,
      openAt: "06:30",
      closeAt: "08:30",
      busyProfile: { "06": 1, "07": 4, "08": 2 },
    };
    expect(arrivalShare(halfHour, "06:30")).toBe(0);
    const { arrived, total } = arrivalWeights(halfHour, "07:00");
    expect(arrived).toBe(30);
    expect(total).toBe(30 * 1 + 60 * 4 + 30 * 2);
  });

  it("returns 1 when the closing time equals the opening time", () => {
    const broken: StallSettings = {
      ...referenceSettings,
      openAt: "10:00",
      closeAt: "10:00",
    };
    expect(arrivalShare(broken, "09:30")).toBe(1);
  });
});

describe("estimateDemand", () => {
  it("T4: cooked 42, sold out 10:30 gives 81 (estimate)", () => {
    expect(estimateDemand(42, null, "10:30", referenceSettings)).toEqual({
      demand: 81,
      isEstimate: true,
    });
  });

  it("T5: cooked 24, sold out 12:15 gives 31 (estimate)", () => {
    expect(estimateDemand(24, null, "12:15", referenceSettings)).toEqual({
      demand: 31,
      isEstimate: true,
    });
  });

  it("T6: a late sell-out (share at least 0.95) keeps demand equal to cooked", () => {
    expect(estimateDemand(24, null, "13:50", referenceSettings)).toEqual({
      demand: 24,
      isEstimate: true,
    });
  });

  it("T7: a very early sell-out is capped at 3 times cooked", () => {
    expect(estimateDemand(10, null, "06:30", referenceSettings)).toEqual({
      demand: 30,
      isEstimate: true,
    });
  });

  it("uses 3 times cooked when nobody had arrived yet", () => {
    expect(estimateDemand(10, null, "05:00", referenceSettings)).toEqual({
      demand: 30,
      isEstimate: true,
    });
  });

  it("T8: cooked 31, leftover 3 gives 28 (recorded)", () => {
    expect(estimateDemand(31, 3, null, referenceSettings)).toEqual({
      demand: 28,
      isEstimate: false,
    });
  });

  it("returns null when there is neither a leftover nor a sell-out time", () => {
    expect(estimateDemand(31, null, null, referenceSettings)).toBeNull();
  });

  it("prefers the sell-out time when both are present", () => {
    expect(estimateDemand(42, 0, "10:30", referenceSettings)).toEqual({
      demand: 81,
      isEstimate: true,
    });
  });

  it("rejects an invalid cooked quantity", () => {
    expect(() => estimateDemand(-1, 0, null, referenceSettings)).toThrow(
      RangeError,
    );
    expect(() => estimateDemand(2.5, 0, null, referenceSettings)).toThrow(
      RangeError,
    );
  });

  it("rejects a leftover outside 0 to cooked", () => {
    expect(() => estimateDemand(10, 15, null, referenceSettings)).toThrow(
      RangeError,
    );
    expect(() => estimateDemand(10, -1, null, referenceSettings)).toThrow(
      RangeError,
    );
    expect(() => estimateDemand(10, 1.5, null, referenceSettings)).toThrow(
      RangeError,
    );
  });

  it("accepts zero cooked with zero leftover", () => {
    expect(estimateDemand(0, 0, null, referenceSettings)).toEqual({
      demand: 0,
      isEstimate: false,
    });
  });

  it("returns cooked when the closing time equals the opening time", () => {
    const broken: StallSettings = {
      ...referenceSettings,
      openAt: "10:00",
      closeAt: "10:00",
    };
    expect(estimateDemand(12, null, "09:30", broken)).toEqual({
      demand: 12,
      isEstimate: true,
    });
  });
});
