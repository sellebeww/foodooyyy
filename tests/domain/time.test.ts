// tests/domain/time.test.ts
import { describe, expect, it } from "vitest";
import {
  addDays,
  closeMinute,
  dayMinute,
  formatHHMM,
  parseHHMM,
  rolloverMinute,
  spansMidnight,
  stallDate,
  weekdayOf,
} from "../../src/domain/time.ts";

const DAY = { openAt: "06:00", closeAt: "14:00" };
const NIGHT = { openAt: "18:00", closeAt: "02:00" };

describe("stall day across midnight", () => {
  it("leaves a same-day stall on the calendar day", () => {
    expect(spansMidnight(DAY)).toBe(false);
    expect(rolloverMinute(DAY)).toBe(0);
    expect(dayMinute("05:00", DAY)).toBe(300);
    expect(closeMinute(DAY)).toBe(840);
    expect(stallDate("2026-03-02", "00:30", DAY)).toBe("2026-03-02");
  });

  it("rolls over halfway between closing and opening for a night stall", () => {
    expect(spansMidnight(NIGHT)).toBe(true);
    expect(rolloverMinute(NIGHT)).toBe(600);
    expect(dayMinute("01:30", NIGHT)).toBe(1530);
    expect(dayMinute("10:00", NIGHT)).toBe(600);
    expect(dayMinute("19:00", NIGHT)).toBe(1140);
    expect(closeMinute(NIGHT)).toBe(1560);
  });

  it("keeps hours after midnight on the opening date", () => {
    expect(stallDate("2026-03-03", "01:30", NIGHT)).toBe("2026-03-02");
    expect(stallDate("2026-03-03", "09:59", NIGHT)).toBe("2026-03-02");
    expect(stallDate("2026-03-03", "10:00", NIGHT)).toBe("2026-03-03");
    expect(stallDate("2026-03-01", "00:10", NIGHT)).toBe("2026-02-28");
  });
});

describe("parseHHMM and formatHHMM", () => {
  it("round-trips valid times", () => {
    expect(parseHHMM("10:32")).toBe(632);
    expect(parseHHMM("00:00")).toBe(0);
    expect(parseHHMM("23:59")).toBe(1439);
    expect(formatHHMM(632)).toBe("10:32");
    expect(formatHHMM(0)).toBe("00:00");
  });

  it("rejects malformed times", () => {
    expect(() => parseHHMM("24:00")).toThrow(RangeError);
    expect(() => parseHHMM("9:30")).toThrow(RangeError);
    expect(() => parseHHMM("10:60")).toThrow(RangeError);
  });

  it("rejects minutes outside one day", () => {
    expect(() => formatHHMM(-1)).toThrow(RangeError);
    expect(() => formatHHMM(1440)).toThrow(RangeError);
    expect(() => formatHHMM(10.5)).toThrow(RangeError);
  });
});

describe("addDays and weekdayOf", () => {
  it("moves across month and year boundaries", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
    expect(addDays("2026-03-10", 0)).toBe("2026-03-10");
  });

  it("returns the weekday with Sunday as 0", () => {
    expect(weekdayOf("2026-01-04")).toBe(0);
    expect(weekdayOf("2026-01-05")).toBe(1);
    expect(weekdayOf("2026-01-10")).toBe(6);
  });

  it("rejects invalid dates", () => {
    expect(() => addDays("2026-02-30", 1)).toThrow(RangeError);
    expect(() => weekdayOf("2026/02/01")).toThrow(RangeError);
  });
});
