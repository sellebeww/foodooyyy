// src/screens/History.tsx
import { useState } from "react";
import { useStallStamp } from "../app/useStallStamp.ts";
import { Button } from "../components/Button.tsx";
import { CookedDemandChart } from "../components/CookedDemandChart.tsx";
import { EstimateNumber } from "../components/EstimateNumber.tsx";
import { DayRow } from "../components/DayRow.tsx";
import { Screen } from "../components/Screen.tsx";
import { WeekStats } from "../components/WeekStats.tsx";
import { useHistory, useMenus } from "../db/hooks.ts";
import {
  menuSeries,
  menuTotals,
  pastDays,
  weeklyMetrics,
} from "../domain/metrics.ts";
import { useI18n } from "../i18n/index.ts";

const PAGE_SIZE = 14;

export function History() {
  const { t } = useI18n();
  const { date } = useStallStamp();
  const menus = useMenus();
  const history = useHistory();
  const [picked, setPicked] = useState<string | null>(null);
  const [shown, setShown] = useState(PAGE_SIZE);

  if (menus === undefined || history === undefined) {
    return (
      <Screen title={t("history.title")}>
        <p role="status">{t("app.loading")}</p>
      </Screen>
    );
  }

  const totals = menuTotals(history.menuDays, history.days, date);
  const chartMenus = menus.filter((menu) => totals[menu.id] !== undefined);
  const menuId =
    picked !== null && totals[picked] !== undefined
      ? picked
      : (chartMenus[0]?.id ?? null);
  const menuName = chartMenus.find((menu) => menu.id === menuId)?.name ?? "";
  const series =
    menuId === null
      ? []
      : menuSeries(history.menuDays, history.days, menuId, date);
  const days = pastDays(history.days, history.menuDays, date);

  return (
    <Screen title={t("history.title")}>
      <section className="card panel" aria-labelledby="history-week">
        <h2 id="history-week">{t("week.title")}</h2>
        <WeekStats
          metrics={weeklyMetrics(history.menuDays, history.days, date)}
        />
      </section>

      {chartMenus.length === 0 ? null : (
        <section className="card panel" aria-labelledby="history-menus">
          <h2 id="history-menus">{t("history.menus.title")}</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">{t("history.col.menu")}</th>
                <th scope="col">{t("history.col.cooked")}</th>
                <th scope="col">{t("history.col.sold")}</th>
                <th scope="col">{t("history.col.leftover")}</th>
                <th scope="col">{t("history.col.demand")}</th>
              </tr>
            </thead>
            <tbody>
              {chartMenus.map((menu) => {
                const row = totals[menu.id];
                if (row === undefined) {
                  return null;
                }
                return (
                  <tr key={menu.id}>
                    <th scope="row">{menu.name}</th>
                    <td className="num">{row.cooked}</td>
                    <td className="num">{row.sold}</td>
                    <td className="num">{row.leftover}</td>
                    <td>
                      <EstimateNumber
                        value={row.demand}
                        isEstimate={row.demandHasEstimate}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="panel__note">{t("history.menus.note")}</p>
        </section>
      )}

      {menuId === null ? null : (
        <section className="card panel" aria-labelledby="history-chart">
          <h2 id="history-chart">{t("history.chart.title")}</h2>
          <fieldset className="segmented chips">
            <legend className="visually-hidden">
              {t("history.chart.menu")}
            </legend>
            <div className="segmented__options">
              {chartMenus.map((menu) => (
                <label key={menu.id} className="segmented__option">
                  <input
                    type="radio"
                    name="chart-menu"
                    value={menu.id}
                    checked={menu.id === menuId}
                    onChange={() => {
                      setPicked(menu.id);
                    }}
                  />
                  <span>{menu.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <CookedDemandChart
            rows={series}
            title={t("history.chart.caption", { menu: menuName })}
          />
        </section>
      )}

      <section className="card panel" aria-labelledby="history-days">
        <h2 id="history-days">{t("history.days.title")}</h2>
        {days.length === 0 ? (
          <p className="muted">{t("history.days.empty")}</p>
        ) : (
          <>
            <ul className="day-list">
              {days.slice(0, shown).map((day) => (
                <li key={day.date}>
                  <DayRow day={day} />
                </li>
              ))}
            </ul>
            {shown < days.length ? (
              <Button
                variant="secondary"
                wide
                onClick={() => {
                  setShown(shown + PAGE_SIZE);
                }}
              >
                {t("history.days.more")}
              </Button>
            ) : null}
          </>
        )}
      </section>
    </Screen>
  );
}
