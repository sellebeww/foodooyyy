// src/screens/Simulate.tsx
import { useEffect, useMemo, useState } from "react";
import { DEMO_ENABLED } from "../app/demoConfig.ts";
import { useStallStamp } from "../app/useStallStamp.ts";
import { Button } from "../components/Button.tsx";
import { EmptyState } from "../components/EmptyState.tsx";
import { Screen } from "../components/Screen.tsx";
import { SimulationAnalysis } from "../components/SimulationAnalysis.tsx";
import { SimulationDay } from "../components/SimulationDay.tsx";
import { useHistory, useMenus, useStall } from "../db/hooks.ts";
import { DEFAULT_DEMO_SCENARIO } from "../demo/catalog.ts";
import { demoScenario } from "../demo/scenarios.ts";
import {
  hourStarts,
  startSimulation,
  stepSimulation,
  type SimState,
} from "../demo/simulation.ts";
import { formatLongDate } from "../i18n/format.ts";
import { useI18n } from "../i18n/index.ts";

export const SIM_STEP_MS = 1500;

export function Simulate() {
  const { t, language } = useI18n();
  const { date } = useStallStamp();
  const stall = useStall();
  const menus = useMenus();
  const history = useHistory();
  const [advanced, setAdvanced] = useState<SimState | null>(null);
  const [playing, setPlaying] = useState(false);

  const scenario = useMemo(
    () =>
      stall && menus !== undefined
        ? {
            ...demoScenario(stall.demo?.scenario ?? DEFAULT_DEMO_SCENARIO),
            settings: stall.settings,
            menus: menus.filter((menu) => !menu.archived),
          }
        : null,
    [stall, menus],
  );
  const initial = useMemo(
    () =>
      scenario !== null && history !== undefined
        ? startSimulation(scenario, date, history.days, history.menuDays)
        : null,
    [scenario, history, date],
  );

  useEffect(() => {
    if (!playing || scenario === null || initial === null) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setAdvanced((current) => stepSimulation(scenario, current ?? initial));
    }, SIM_STEP_MS);
    return () => {
      window.clearInterval(timer);
    };
  }, [playing, scenario, initial]);

  const state = advanced ?? initial;

  if (!stall || scenario === null || state === null || initial === null) {
    return (
      <Screen title={t("sim.title")}>
        <p role="status">{t("app.loading")}</p>
      </Screen>
    );
  }

  if (!DEMO_ENABLED || !stall.settings.isDemo || state.plan.length === 0) {
    return (
      <Screen title={t("sim.title")}>
        <EmptyState
          title={t("sim.emptyTitle")}
          body={t("sim.emptyBody")}
          action={<Button to="/today">{t("how.back")}</Button>}
        />
      </Screen>
    );
  }

  const total = hourStarts(scenario.settings).length;
  const finished = state.hoursDone === total;

  function finishDay() {
    if (scenario === null || state === null) {
      return;
    }
    let next = stepSimulation(scenario, state);
    while (next.hoursDone < total) {
      next = stepSimulation(scenario, next);
    }
    setPlaying(false);
    setAdvanced(next);
  }

  return (
    <Screen title={t("sim.title")}>
      <p className="note note--info">{t("sim.note")}</p>
      <section className="card panel" aria-labelledby="sim-controls">
        <h2 id="sim-controls">
          {t("sim.day", {
            day: finished ? state.daysDone : state.daysDone + 1,
            date: formatLongDate(state.date, language),
          })}
        </h2>
        <p role="status">
          {finished
            ? t("sim.dayDone")
            : t("sim.hours", { done: state.hoursDone, total })}
        </p>
        <div className="sim-controls">
          <Button
            aria-pressed={playing}
            onClick={() => {
              setPlaying(!playing);
            }}
          >
            {t(playing ? "sim.pause" : "sim.play")}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setAdvanced(stepSimulation(scenario, state));
            }}
          >
            {t(finished ? "sim.nextDay" : "sim.nextHour")}
          </Button>
          <Button variant="secondary" disabled={finished} onClick={finishDay}>
            {t("sim.finishDay")}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setPlaying(false);
              setAdvanced(null);
            }}
          >
            {t("sim.restart")}
          </Button>
        </div>
      </section>
      <SimulationDay scenario={scenario} state={state} />
      <SimulationAnalysis scenario={scenario} state={state} />
    </Screen>
  );
}
