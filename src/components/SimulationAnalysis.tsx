// src/components/SimulationAnalysis.tsx
import type { DemoScenario } from "../demo/generator.ts";
import { hourStarts, type SimState } from "../demo/simulation.ts";
import { averageLoads, hourLoads, rankMenus } from "../domain/pattern.ts";
import { suggestAll } from "../domain/plan.ts";
import { addDays, formatHHMM, weekdayOf } from "../domain/time.ts";
import { formatRupiah } from "../i18n/format.ts";
import { useT } from "../i18n/index.ts";

interface SimulationAnalysisProps {
  scenario: DemoScenario;
  state: SimState;
}

const clock = (minute: number) => formatHHMM(minute % 1440);

export function SimulationAnalysis({
  scenario,
  state,
}: SimulationAnalysisProps) {
  const t = useT();
  const starts = hourStarts(scenario.settings);
  const finished = state.hoursDone === starts.length;
  const end = (starts[state.hoursDone - 1] ?? -60) + 60;
  const running = finished
    ? []
    : state.visits.filter((visit) => visit.minute < end);
  const loads = averageLoads(
    hourLoads([...state.pastVisits, ...running], starts),
    state.daysDone,
    finished ? 0 : state.hoursDone,
  );
  const highest = Math.max(1, ...loads.map((load) => load.sold + load.missed));
  const peak = loads.reduce((best, load) =>
    load.sold + load.missed > best.sold + best.missed ? load : best,
  );
  const hasLoads = peak.sold + peak.missed > 0;
  const nextDate = finished ? addDays(state.date, 1) : state.date;
  const next = new Map(
    suggestAll(
      scenario.menus,
      weekdayOf(nextDate),
      state.menuDays,
      state.days,
    ).map((item) => [item.menuId, item.qty]),
  );
  const nameOf = (menuId: string) =>
    scenario.menus.find((menu) => menu.id === menuId)?.name ?? menuId;

  return (
    <section className="card panel" aria-labelledby="sim-analysis">
      <h2 id="sim-analysis">{t("sim.analysis")}</h2>
      <h3>{t("sim.pattern")}</h3>
      {hasLoads ? (
        <>
          <p>{t("sim.peak", { from: clock(peak.start) })}</p>
          <ul className="sim-bars">
            {loads.map((load) => (
              <li key={load.start} className="sim-bars__row">
                <span className="num">{clock(load.start)}</span>
                <span className="sim-bars__track" aria-hidden="true">
                  <span
                    className="sim-bars__sold"
                    style={{ width: `${(100 * load.sold) / highest}%` }}
                  />
                  <span
                    className="sim-bars__missed"
                    style={{ width: `${(100 * load.missed) / highest}%` }}
                  />
                </span>
                <span className="num">
                  {t("sim.barValue", {
                    sold: load.sold.toFixed(1),
                    missed: load.missed.toFixed(1),
                  })}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="muted">{t("sim.patternEmpty")}</p>
      )}
      <h3>{t("sim.menus")}</h3>
      <ol className="sim-menus">
        {rankMenus(scenario.menus, state.menuDays, state.days).map((item) => (
          <li key={item.menuId} className="sim-menus__item">
            <p className="sim-menus__head">
              <strong>{nameOf(item.menuId)}</strong>
              <span className="chip">{t(`sim.signal.${item.signal}`)}</span>
            </p>
            <p>{t("sim.next", { qty: next.get(item.menuId) ?? 0 })}</p>
            <p className="panel__note">
              {t("sim.menuStats", {
                profit: formatRupiah(item.profit),
                soldOut: item.soldOutDays,
                days: item.days,
                leftover: item.leftover.toFixed(1),
                demand: item.demand.toFixed(1),
              })}
            </p>
          </li>
        ))}
      </ol>
      <p className="panel__note">{t("sim.menusNote")}</p>
    </section>
  );
}
