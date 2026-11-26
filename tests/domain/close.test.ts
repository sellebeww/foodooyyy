// tests/domain/close.test.ts
import { describe, expect, it } from "vitest";
import {
  closeDayRecords,
  closeMenuDay,
  EARLY_SELL_OUT_MINUTES,
  incompleteDays,
  isEarlySellOut,
  missingLeftovers,
  tomorrowPlan,
  validateSoldOutTime,
  withClosedDay,
} from "../../src/domain/close.ts";
import { suggestAll } from "../../src/domain/plan.ts";
import {
  makeDay,
  makeMenu,
  makeMenuDay,
  referenceSettings,
} from "../helpers.ts";

const TODAY = "2026-03-02";

function planned(menuId: string, cookedQty: number, soldOutAt: string | null) {
  return makeMenuDay(TODAY, {
    menuId,
    cookedQty,
    soldOutAt,
    leftover: null,
    estimatedDemand: null,
    demandIsEstimate: false,
    suggestedQty: 40,
  });
}

describe("validateSoldOutTime", () => {
  it("accepts times from opening to closing", () => {
    expect(validateSoldOutTime("06:00", referenceSettings)).toBeNull();
    expect(validateSoldOutTime("10:30", referenceSettings)).toBeNull();
    expect(validateSoldOutTime("14:00", referenceSettings)).toBeNull();
  });

  it("rejects malformed times and times outside the opening hours", () => {
    expect(validateSoldOutTime("", referenceSettings)).toBe("timeInvalid");
    expect(validateSoldOutTime("25:00", referenceSettings)).toBe("timeInvalid");
    expect(validateSoldOutTime("05:59", referenceSettings)).toBe(
      "outsideHours",
    );
    expect(validateSoldOutTime("14:01", referenceSettings)).toBe(
      "outsideHours",
    );
  });

  it("accepts times after midnight for a night stall", () => {
    const night = { openAt: "18:00", closeAt: "02:00" };
    expect(validateSoldOutTime("18:00", night)).toBeNull();
    expect(validateSoldOutTime("23:45", night)).toBeNull();
    expect(validateSoldOutTime("01:30", night)).toBeNull();
    expect(validateSoldOutTime("02:00", night)).toBeNull();
    expect(validateSoldOutTime("02:01", night)).toBe("outsideHours");
    expect(validateSoldOutTime("17:59", night)).toBe("outsideHours");
  });
});

describe("isEarlySellOut", () => {
  it("is true before opening and in the first 30 minutes", () => {
    expect(EARLY_SELL_OUT_MINUTES).toBe(30);
    expect(isEarlySellOut("05:50", referenceSettings)).toBe(true);
    expect(isEarlySellOut("06:00", referenceSettings)).toBe(true);
    expect(isEarlySellOut("06:29", referenceSettings)).toBe(true);
    expect(isEarlySellOut("06:30", referenceSettings)).toBe(false);
    expect(isEarlySellOut("10:30", referenceSettings)).toBe(false);
  });

  it("works for a night stall", () => {
    const night = { openAt: "23:45", closeAt: "03:00" };
    expect(isEarlySellOut("00:10", night)).toBe(true);
    expect(isEarlySellOut("00:15", night)).toBe(false);
  });
});

describe("missingLeftovers", () => {
  it("lists cooked menus that are neither sold out nor counted", () => {
    const rows = [
      planned("nasi-uduk", 42, "10:30"),
      planned("ayam-goreng", 31, null),
      planned("tempe-orek", 24, null),
      planned("sayur-lodeh", 0, null),
    ];
    expect(missingLeftovers(rows, {})).toEqual(["ayam-goreng", "tempe-orek"]);
    expect(
      missingLeftovers(rows, { "ayam-goreng": 3, "tempe-orek": 0 }),
    ).toEqual([]);
  });
});

describe("closeMenuDay", () => {
  it("CL acceptance: Ayam Goreng cooked 31 with leftover 3 has demand 28, not an estimate", () => {
    const row = closeMenuDay(
      planned("ayam-goreng", 31, null),
      { leftover: 3, soldOutAt: null },
      referenceSettings,
    );
    expect(row).toMatchObject({
      cookedQty: 31,
      leftover: 3,
      soldOutAt: null,
      estimatedDemand: 28,
      demandIsEstimate: false,
      suggestedQty: 40,
    });
  });

  it("CL acceptance: Nasi Uduk cooked 42 sold out at 10:30 has demand 81, an estimate", () => {
    const row = closeMenuDay(
      planned("nasi-uduk", 42, "10:30"),
      { leftover: 7, soldOutAt: "10:30" },
      referenceSettings,
    );
    expect(row).toMatchObject({
      soldOutAt: "10:30",
      leftover: 0,
      estimatedDemand: 81,
      demandIsEstimate: true,
    });
  });

  it("CL-3: a confirmed missed sell-out time is stored and estimated", () => {
    const row = closeMenuDay(
      planned("tempe-orek", 24, null),
      { leftover: 0, soldOutAt: "12:15" },
      referenceSettings,
    );
    expect(row).toMatchObject({
      soldOutAt: "12:15",
      leftover: 0,
      estimatedDemand: 31,
      demandIsEstimate: true,
    });
  });

  it("refuses leftover 0 without a sell-out time", () => {
    expect(() =>
      closeMenuDay(
        planned("tempe-orek", 24, null),
        { leftover: 0, soldOutAt: null },
        referenceSettings,
      ),
    ).toThrow(RangeError);
  });

  it("refuses a cooked menu with no leftover and no sell-out time", () => {
    expect(() =>
      closeMenuDay(
        planned("tempe-orek", 24, null),
        { leftover: null, soldOutAt: null },
        referenceSettings,
      ),
    ).toThrow(RangeError);
  });

  it("records a menu that was not cooked without a demand, so it never enters history", () => {
    const row = closeMenuDay(
      planned("sayur-lodeh", 0, null),
      { leftover: 0, soldOutAt: null },
      referenceSettings,
    );
    expect(row).toMatchObject({
      cookedQty: 0,
      leftover: 0,
      soldOutAt: null,
      estimatedDemand: null,
      demandIsEstimate: false,
    });
  });
});

describe("closeDayRecords", () => {
  it("CL-4, CL-5: closes every row and keeps the unusual flag on the day", () => {
    const closed = closeDayRecords(
      TODAY,
      true,
      [
        planned("nasi-uduk", 42, "10:30"),
        planned("ayam-goreng", 31, null),
        planned("sayur-lodeh", 0, null),
      ],
      [
        { menuId: "nasi-uduk", leftover: 0, soldOutAt: "10:30" },
        { menuId: "ayam-goreng", leftover: 3, soldOutAt: null },
      ],
      referenceSettings,
    );
    expect(closed.day).toEqual({
      date: TODAY,
      weekday: 1,
      unusual: true,
      closed: true,
    });
    expect(closed.menuDays.map((row) => row.estimatedDemand)).toEqual([
      81,
      28,
      null,
    ]);
  });

  it("refuses a cooked menu without an entry and a row from another day", () => {
    expect(() =>
      closeDayRecords(
        TODAY,
        false,
        [planned("nasi-uduk", 42, null)],
        [],
        referenceSettings,
      ),
    ).toThrow(RangeError);
    expect(() =>
      closeDayRecords(
        TODAY,
        false,
        [makeMenuDay("2026-03-01")],
        [{ menuId: "nasi-uduk", leftover: 1, soldOutAt: null }],
        referenceSettings,
      ),
    ).toThrow(RangeError);
  });
});

describe("withClosedDay and tomorrowPlan", () => {
  it("replaces today's rows and day, then suggests for tomorrow's weekday", () => {
    const menu = makeMenu();
    const history = [
      makeMenuDay("2026-02-24", { estimatedDemand: 30 }),
      planned("nasi-uduk", 42, "10:30"),
    ];
    const days = [
      makeDay("2026-02-24", 2),
      makeDay(TODAY, 1, { closed: false }),
    ];
    const closed = closeDayRecords(
      TODAY,
      false,
      [planned("nasi-uduk", 42, "10:30")],
      [{ menuId: "nasi-uduk", leftover: 0, soldOutAt: "10:30" }],
      referenceSettings,
    );
    const merged = withClosedDay(history, days, closed);
    expect(merged.menuDays).toHaveLength(2);
    expect(merged.days).toHaveLength(2);
    expect(merged.days.find((day) => day.date === TODAY)?.closed).toBe(true);

    const plan = tomorrowPlan(TODAY, [menu], merged.menuDays, merged.days);
    expect(plan.date).toBe("2026-03-03");
    expect(plan.weekday).toBe(2);
    expect(plan.suggestions).toEqual(
      suggestAll([menu], 2, merged.menuDays, merged.days),
    );
    expect(plan.suggestions[0]?.reason.code).toBe("cold-start-up");
  });
});

describe("incompleteDays", () => {
  it("CL-6: lists past planned days that were never closed, newest first", () => {
    const days = [
      makeDay("2026-02-27", 5, { closed: false }),
      makeDay("2026-02-28", 6, { closed: true }),
      makeDay("2026-03-01", 0, { closed: false }),
      makeDay("2026-02-26", 4, { closed: false }),
      makeDay(TODAY, 1, { closed: false }),
    ];
    const menuDays = [
      makeMenuDay("2026-02-27"),
      makeMenuDay("2026-02-28"),
      makeMenuDay("2026-03-01"),
      makeMenuDay("2026-02-26", { cookedQty: 0 }),
      makeMenuDay(TODAY),
    ];
    expect(incompleteDays(days, menuDays, TODAY)).toEqual([
      "2026-03-01",
      "2026-02-27",
    ]);
  });
});
