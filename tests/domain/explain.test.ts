// tests/domain/explain.test.ts
import { describe, expect, it } from "vitest";
import { arrivalShare, estimateDemand } from "../../src/domain/estimate.ts";
import {
  demandAt,
  EXAMPLE_SETTINGS,
  suggestionAtCost,
  workedExample,
} from "../../src/domain/explain.ts";
import { quantile } from "../../src/domain/suggest.ts";
import { referenceSettings } from "../helpers.ts";

describe("workedExample", () => {
  const example = workedExample();

  it("uses the SPEC 6.6 reference profile", () => {
    expect(EXAMPLE_SETTINGS).toEqual(referenceSettings);
  });

  it("DESIGN 5.8: sold out at 10:30, about 52% had arrived, about 81 wanted it", () => {
    expect(example.soldOutAt).toBe("10:30");
    expect(example.cooked).toBe(42);
    expect(example.arrivedPercent).toBe(52);
    expect(example.demand).toBe(81);
    expect(example.demand).toBe(
      estimateDemand(42, 0, "10:30", referenceSettings)?.demand,
    );
    expect(example.arrivedPercent).toBe(
      Math.round(100 * arrivalShare(referenceSettings, "10:30")),
    );
    expect(example.cap).toBe(126);
  });

  it("marks the busy hours that had passed by the sell-out", () => {
    expect(example.hours.map((hour) => hour.hour)).toEqual([
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
      "13",
    ]);
    expect(example.hours.map((hour) => hour.weight)).toEqual([
      1, 4, 4, 2, 2, 4, 4, 2,
    ]);
    expect(
      example.hours.filter((hour) => hour.beforeSellOut).map((h) => h.hour),
    ).toEqual(["06", "07", "08", "09", "10"]);
  });

  it("T9, T11: weighs Rp 3.500 gained against Rp 4.500 lost and suggests 34 with suggestQty", () => {
    expect(example.gainPerPortion).toBe(3500);
    expect(example.lossPerLeftover).toBe(4500);
    expect(example.coverPercent).toBe(44);
    expect(example.history).toEqual([30, 32, 35, 40, 41]);
    expect(quantile(example.history, 0.4375)).toBe(34.25);
    expect(example.suggestion.qty).toBe(34);
    expect(example.suggestion.reason).toEqual({
      code: "history",
      scope: "weekday",
      observations: 5,
      soldOutDays: 0,
      leftoverDays: 5,
      delta: 34 - example.historyCooked,
    });
    expect(example.weekday).toBe(1);
  });
});

describe("demandAt", () => {
  it("matches the worked example at 10:30", () => {
    const result = demandAt("10:30");
    expect(result.demand).toBe(81);
    expect(result.arrivedPercent).toBe(52);
    expect(result.cap).toBe(126);
    expect(result.rule).toBe("scaled");
  });

  it("is capped when almost nobody had arrived", () => {
    const result = demandAt("06:30");
    expect(result.demand).toBe(126);
    expect(result.rule).toBe("capped");
  });

  it("is the cooked amount when it sold out at closing time", () => {
    const result = demandAt("14:00");
    expect(result.demand).toBe(42);
    expect(result.arrivedPercent).toBe(100);
    expect(result.rule).toBe("late");
  });

  it("agrees with estimateDemand for every half hour of the day", () => {
    for (let minute = 6 * 60 + 30; minute <= 14 * 60; minute += 30) {
      const time = `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
      expect(demandAt(time).demand).toBe(
        estimateDemand(42, 0, time, referenceSettings)?.demand,
      );
    }
  });
});

describe("suggestionAtCost", () => {
  it("matches the worked example at the example cost", () => {
    const result = suggestionAtCost(4500);
    expect(result.suggestion.qty).toBe(34);
    expect(result.coverPercent).toBe(44);
    expect(result.gainPerPortion).toBe(3500);
    expect(result.lossPerLeftover).toBe(4500);
  });

  it("suggests more portions when cooking is cheaper", () => {
    const cheap = suggestionAtCost(1500).suggestion.qty;
    const dear = suggestionAtCost(7500).suggestion.qty;
    expect(cheap).toBeGreaterThan(34);
    expect(dear).toBeLessThan(34);
    expect(suggestionAtCost(1500).coverPercent).toBeGreaterThan(80);
  });
});
