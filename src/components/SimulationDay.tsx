// src/components/SimulationDay.tsx
import type { DemoScenario } from "../demo/generator.ts";
import { hourStarts, type SimState } from "../demo/simulation.ts";
import { hourLoads, type Visit } from "../domain/pattern.ts";
import { formatHHMM } from "../domain/time.ts";
import { formatRupiah } from "../i18n/format.ts";
import { useT } from "../i18n/index.ts";

interface SimulationDayProps {
  scenario: DemoScenario;
  state: SimState;
}

const clock = (minute: number) => formatHHMM(minute % 1440);

export function SimulationDay({ scenario, state }: SimulationDayProps) {
  const t = useT();
  const starts = hourStarts(scenario.settings).slice(0, state.hoursDone);
  const menus = new Map(scenario.menus.map((menu) => [menu.id, menu]));
  const nameOf = (menuId: string) => menus.get(menuId)?.name ?? menuId;
  const revenue = (visits: readonly Visit[]) =>
    visits.reduce(
      (sum, visit) =>
        sum + (visit.served ? (menus.get(visit.menuId)?.price ?? 0) : 0),
      0,
    );
  const end = (starts[starts.length - 1] ?? -60) + 60;
  const seen = state.visits.filter((visit) => visit.minute < end);
  const latest = seen.filter((visit) => visit.minute >= end - 60);
  const latestSold = latest.filter((visit) => visit.served).length;
  const finished = state.hoursDone === hourStarts(scenario.settings).length;
  const closedRows = state.menuDays.filter((row) => row.date === state.date);

  return (
    <>
      {starts.length === 0 ? null : (
        <section className="card panel" aria-labelledby="sim-hour">
          <h2 id="sim-hour">
            {t("sim.hourTitle", {
              from: clock(end - 60),
              to: clock(end),
            })}
          </h2>
          <dl className="counts__grid">
            <div className="counts__item">
              <dt>{t("sim.customers")}</dt>
              <dd className="num">{latest.length}</dd>
            </div>
            <div className="counts__item">
              <dt>{t("sim.sold")}</dt>
              <dd className="num">{latestSold}</dd>
            </div>
            <div className="counts__item">
              <dt>{t("sim.missed")}</dt>
              <dd className="num">{latest.length - latestSold}</dd>
            </div>
          </dl>
          <ol className="sim-log" aria-label={t("sim.transactions")}>
            {latest.map((visit, index) => (
              <li key={index} className="sim-log__row">
                <span className="num">{clock(visit.minute)}</span>
                <span>{nameOf(visit.menuId)}</span>
                <span className={visit.served ? "num" : "stamp"}>
                  {visit.served
                    ? formatRupiah(menus.get(visit.menuId)?.price ?? 0)
                    : t("sim.turnedAway")}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
      {starts.length === 0 ? null : (
        <section className="card panel" aria-labelledby="sim-today">
          <h2 id="sim-today">{t("sim.byHour")}</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">{t("sim.col.hour")}</th>
                <th scope="col">{t("sim.sold")}</th>
                <th scope="col">{t("sim.missed")}</th>
                <th scope="col">{t("sim.col.sales")}</th>
              </tr>
            </thead>
            <tbody>
              {hourLoads(seen, starts).map((load) => (
                <tr key={load.start}>
                  <th scope="row">{clock(load.start)}</th>
                  <td className="num">{load.sold}</td>
                  <td className="num">{load.missed}</td>
                  <td className="num">
                    {formatRupiah(
                      revenue(
                        seen.filter(
                          (visit) =>
                            visit.minute >= load.start &&
                            visit.minute < load.start + 60,
                        ),
                      ),
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
      <section className="card panel" aria-labelledby="sim-stock">
        <h2 id="sim-stock">{t("sim.stock")}</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">{t("history.col.menu")}</th>
              <th scope="col">{t("history.col.cooked")}</th>
              <th scope="col">{t("history.col.leftover")}</th>
              {finished ? (
                <>
                  <th scope="col">{t("sim.col.estimate")}</th>
                  <th scope="col">{t("sim.col.truth")}</th>
                </>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {state.plan.map((row) => {
              const sold = seen.filter(
                (visit) => visit.menuId === row.menuId && visit.served,
              ).length;
              return (
                <tr key={row.menuId}>
                  <th scope="row">{nameOf(row.menuId)}</th>
                  <td className="num">{row.cookedQty}</td>
                  <td className="num">{row.cookedQty - sold}</td>
                  {finished ? (
                    <>
                      <td className="num">
                        {closedRows.find((item) => item.menuId === row.menuId)
                          ?.estimatedDemand ?? "–"}
                      </td>
                      <td className="num">
                        {
                          state.visits.filter(
                            (visit) => visit.menuId === row.menuId,
                          ).length
                        }
                      </td>
                    </>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
        {finished ? <p className="panel__note">{t("sim.truthNote")}</p> : null}
      </section>
    </>
  );
}
