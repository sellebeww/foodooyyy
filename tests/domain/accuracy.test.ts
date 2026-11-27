// tests/domain/accuracy.test.ts
import { describe, expect, it } from "vitest";
import {
  CHECK_WINDOW_DAYS,
  MIN_CHECK_DAYS,
  suggestionCheck,
} from "../../src/domain/accuracy.ts";
import type { Reason } from "../../src/domain/types.ts";
import { makeDay, makeMenu, makeMenuDay } from "../helpers.ts";

const historyReason: Reason = {
  code: "history",
  scope: "weekday",
  observations: 6,
  soldOutDays: 0,
  leftoverDays: 2,
  delta: 0,
};

const menu = makeMenu();
const END = "2026-02-20";

function dated(index: number): string {
  return `2026-02-${String(index + 1).padStart(2, "0")}`;
}

function series(
  count: number,
  suggested: (index: number) => number,
  demand: (index: number) => number,
) {
  const days = Array.from({ length: count }, (_, index) =>
    makeDay(dated(index), index % 7),
  );
  const menuDays = Array.from({ length: count }, (_, index) =>
    makeMenuDay(dated(index), {
      suggestedQty: suggested(index),
      reason: historyReason,
      cookedQty: suggested(index),
      estimatedDemand: demand(index),
    }),
  );
  return { days, menuDays };
}

describe("suggestionCheck", () => {
  it("needs at least the minimum number of checked days", () => {
    const { days, menuDays } = series(
      MIN_CHECK_DAYS - 1,
      () => 40,
      () => 38,
    );
    const result = suggestionCheck(menuDays, days, [menu], END);
    expect(result.evaluated).toBe(MIN_CHECK_DAYS - 1);
    expect(result.enough).toBe(false);
    expect(result.meanAbsoluteError).toBeNull();
    expect(result.coveredShare).toBeNull();
    expect(result.targetShare).toBeNull();
  });

  it("reports an empty check with no history", () => {
    const result = suggestionCheck([], [], [menu], END);
    expect(result).toEqual({
      evaluated: 0,
      enough: false,
      meanAbsoluteError: null,
      coveredShare: null,
      targetShare: null,
      overDays: 0,
      underDays: 0,
      includesEstimates: false,
    });
  });

  it("computes the mean absolute error and the covered share", () => {
    const suggested = [40, 40, 40, 40, 40];
    const demand = [38, 44, 40, 30, 41];
    const { days, menuDays } = series(
      5,
      (index) => suggested[index] as number,
      (index) => demand[index] as number,
    );
    const result = suggestionCheck(menuDays, days, [menu], END);
    expect(result.enough).toBe(true);
    expect(result.evaluated).toBe(5);
    expect(result.meanAbsoluteError).toBeCloseTo((2 + 4 + 0 + 10 + 1) / 5);
    expect(result.coveredShare).toBeCloseTo(3 / 5);
    expect(result.overDays).toBe(2);
    expect(result.underDays).toBe(2);
    expect(result.targetShare).toBeCloseTo(0.4375, 5);
    expect(result.includesEstimates).toBe(false);
  });

  it("flags days whose demand was itself an estimate", () => {
    const { days, menuDays } = series(
      5,
      () => 40,
      () => 40,
    );
    const first = menuDays[0];
    if (first === undefined) {
      throw new Error("missing fixture");
    }
    first.demandIsEstimate = true;
    const result = suggestionCheck(menuDays, days, [menu], END);
    expect(result.includesEstimates).toBe(true);
  });

  it("ignores starting-point suggestions that were not made from history", () => {
    const { days, menuDays } = series(
      6,
      () => 40,
      () => 38,
    );
    const colds = menuDays.slice(0, 3).map((item) => ({
      ...item,
      reason: { ...historyReason, code: "cold-start" as const },
    }));
    const result = suggestionCheck(
      [...colds, ...menuDays.slice(3)],
      days,
      [menu],
      END,
    );
    expect(result.evaluated).toBe(3);
    expect(result.enough).toBe(false);
  });

  it("ignores days that are open, unusual, in the future, too old, without a demand or without a suggestion", () => {
    const { days, menuDays } = series(
      6,
      () => 40,
      () => 38,
    );
    const open = days.map((day, index) =>
      index === 0 ? { ...day, closed: false } : day,
    );
    const unusual = open.map((day, index) =>
      index === 1 ? { ...day, unusual: true } : day,
    );
    const noDemand = menuDays.map((item, index) =>
      index === 2 ? { ...item, estimatedDemand: null } : item,
    );
    const noSuggestion = noDemand.map((item, index) =>
      index === 3 ? { ...item, suggestedQty: null } : item,
    );
    const noReason = noSuggestion.map((item, index) =>
      index === 4 ? { ...item, reason: null } : item,
    );
    const result = suggestionCheck(noReason, unusual, [menu], "2026-02-20");
    expect(result.evaluated).toBe(1);
    const future = suggestionCheck(menuDays, days, [menu], "2026-02-03");
    expect(future.evaluated).toBe(3);
    const old = suggestionCheck(menuDays, days, [menu], "2026-03-10");
    expect(old.evaluated).toBe(0);
    const edge = suggestionCheck(menuDays, days, [menu], "2026-02-28");
    expect(edge.evaluated).toBe(6);
    expect(CHECK_WINDOW_DAYS).toBe(28);
  });

  it("ignores menus that no longer exist and days without a record", () => {
    const { days, menuDays } = series(
      5,
      () => 40,
      () => 38,
    );
    expect(suggestionCheck(menuDays, days, [], END).evaluated).toBe(0);
    expect(suggestionCheck(menuDays, [], [menu], END).evaluated).toBe(0);
  });

  it("averages the target over each checked menu", () => {
    const cheap = makeMenu({ id: "tempe", price: 4000, cost: 1500 });
    const { days, menuDays } = series(
      5,
      () => 40,
      () => 38,
    );
    const second = menuDays.map((item) => ({ ...item, menuId: "tempe" }));
    const result = suggestionCheck(
      [...menuDays, ...second],
      days,
      [menu, cheap],
      END,
    );
    const expected = (0.4375 + 0.625) / 2;
    expect(result.evaluated).toBe(10);
    expect(result.targetShare).toBeCloseTo(expected, 5);
  });
});
