// tests/demo/simulation.test.ts
import { describe, expect, it } from "vitest";
import { generateScenarioHistory } from "../../src/demo/generator.ts";
import { demoScenario } from "../../src/demo/scenarios.ts";
import {
  hourStarts,
  startSimulation,
  stepSimulation,
  type SimState,
} from "../../src/demo/simulation.ts";
import { DEMO_SCENARIO_IDS } from "../../src/demo/catalog.ts";

const TODAY = "2026-03-02";

describe("hourly simulation", () => {
  it.each(DEMO_SCENARIO_IDS)(
    "scenario %i closes days that match their transactions and repeats",
    (id) => {
      const scenario = demoScenario(id);
      const history = generateScenarioHistory(TODAY, scenario);
      const start = () =>
        startSimulation(scenario, TODAY, history.days, history.menuDays);
      const hours = hourStarts(scenario.settings).length;
      let state: SimState = start();
      for (let step = 0; step < hours; step += 1) {
        state = stepSimulation(scenario, state);
      }
      expect(state.daysDone).toBe(1);
      expect(state.days).toHaveLength(history.days.length + 1);
      for (const row of state.menuDays.filter((item) => item.date === TODAY)) {
        const sold = state.visits.filter(
          (visit) => visit.menuId === row.menuId && visit.served,
        ).length;
        expect(row.leftover).toBe(row.cookedQty - sold);
      }
      state = stepSimulation(scenario, state);
      expect(state.date).toBe("2026-03-03");
      expect(state.hoursDone).toBe(0);
      expect(start().visits).toEqual(start().visits);
    },
  );
});
