// tests/domain/phase.test.ts
import { describe, expect, it } from "vitest";
import {
  segmentStatus,
  summarizeDay,
  todayPhase,
  type PhaseInput,
} from "../../src/domain/phase.ts";
import { makeDay, makeMenuDay } from "../helpers.ts";

function input(overrides: Partial<PhaseInput> = {}): PhaseInput {
  return {
    time: "09:00",
    openAt: "06:00",
    closeAt: "14:00",
    plannedCount: 4,
    portions: 120,
    soldOutCount: 0,
    closed: false,
    ...overrides,
  };
}

describe("summarizeDay", () => {
  it("counts planned menus, portions and sell-outs", () => {
    const summary = summarizeDay(
      [
        makeMenuDay("2026-03-02", { cookedQty: 42, soldOutAt: "10:32" }),
        makeMenuDay("2026-03-02", { menuId: "b", cookedQty: 30 }),
      ],
      makeDay("2026-03-02", 1, { closed: false }),
    );
    expect(summary).toEqual({
      plannedCount: 2,
      portions: 72,
      soldOutCount: 1,
      closed: false,
    });
  });

  it("does not count a menu planned with 0 portions as planned", () => {
    const summary = summarizeDay(
      [
        makeMenuDay("2026-03-02", { cookedQty: 0 }),
        makeMenuDay("2026-03-02", { menuId: "b", cookedQty: 30 }),
      ],
      undefined,
    );
    expect(summary.plannedCount).toBe(1);
    expect(summary.portions).toBe(30);
  });

  it("treats a missing day record as not closed", () => {
    expect(summarizeDay([], undefined)).toEqual({
      plannedCount: 0,
      portions: 0,
      soldOutCount: 0,
      closed: false,
    });
    expect(summarizeDay([], makeDay("2026-03-02", 1)).closed).toBe(true);
  });
});

describe("todayPhase", () => {
  it("is plan when nothing is planned yet, even after closing time", () => {
    expect(todayPhase(input({ plannedCount: 0 }))).toBe("plan");
    expect(todayPhase(input({ plannedCount: 0, time: "20:00" }))).toBe("plan");
  });

  it("is service between planning and closing time", () => {
    expect(todayPhase(input())).toBe("service");
    expect(todayPhase(input({ time: "05:00" }))).toBe("service");
    expect(todayPhase(input({ time: "13:59", soldOutCount: 3 }))).toBe(
      "service",
    );
  });

  it("is close at closing time or when every menu sold out", () => {
    expect(todayPhase(input({ time: "14:00" }))).toBe("close");
    expect(todayPhase(input({ soldOutCount: 4 }))).toBe("close");
  });

  it("handles a stall that closes after midnight", () => {
    const night = { openAt: "18:00", closeAt: "02:00" };
    expect(todayPhase(input({ ...night, time: "17:00" }))).toBe("service");
    expect(todayPhase(input({ ...night, time: "23:30" }))).toBe("service");
    expect(todayPhase(input({ ...night, time: "01:59" }))).toBe("service");
    expect(todayPhase(input({ ...night, time: "02:00" }))).toBe("close");
    expect(todayPhase(input({ ...night, time: "09:59" }))).toBe("close");
  });

  it("is done once the day is closed", () => {
    expect(todayPhase(input({ closed: true, plannedCount: 0 }))).toBe("done");
  });
});

describe("segmentStatus", () => {
  it("marks earlier segments done, the current one current, later ones next", () => {
    expect(segmentStatus("service", "plan")).toBe("done");
    expect(segmentStatus("service", "service")).toBe("current");
    expect(segmentStatus("service", "close")).toBe("next");
  });

  it("marks every segment done when the day is done", () => {
    expect(segmentStatus("done", "plan")).toBe("done");
    expect(segmentStatus("done", "close")).toBe("done");
  });
});
