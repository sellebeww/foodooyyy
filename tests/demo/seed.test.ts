// tests/demo/seed.test.ts
import { describe, expect, it } from "vitest";
import { generateDemoHistory } from "../../src/demo/generator.ts";
import { buildDemoRecords, pickMenuDay } from "../../src/demo/seed.ts";
import { makeMenuDay } from "../helpers.ts";

describe("buildDemoRecords", () => {
  it("copies the generated history field by field and marks it as demo", () => {
    const today = "2026-03-02";
    const records = buildDemoRecords(today);
    const history = generateDemoHistory(today);
    expect(records.stall).toEqual({
      id: "stall",
      name: history.stallName,
      settings: { ...history.settings, isDemo: true },
      setupComplete: true,
      demo: { scenario: 1, generatedFor: today },
    });
    expect(records.menus).toEqual(history.menus);
    expect(records.days).toEqual(history.days);
    expect(records.menuDays).toEqual(history.menuDays);
  });

  it("is deterministic for the same date", () => {
    expect(buildDemoRecords("2026-03-02")).toEqual(
      buildDemoRecords("2026-03-02"),
    );
  });

  it("drops any field outside the MenuDay and Reason types", () => {
    const reason = {
      code: "history" as const,
      scope: "weekday" as const,
      observations: 6,
      soldOutDays: 2,
      leftoverDays: 1,
      delta: 3,
    };
    const item = {
      ...makeMenuDay("2026-03-02", {
        reason: { ...reason, extra: 1 } as typeof reason,
      }),
      trueDemand: 99,
    };
    const picked = pickMenuDay(item);
    expect(picked).toEqual(makeMenuDay("2026-03-02", { reason }));
    expect("trueDemand" in picked).toBe(false);
  });
});
