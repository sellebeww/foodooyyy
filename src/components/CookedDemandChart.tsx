// src/components/CookedDemandChart.tsx
import type { MenuDayRow } from "../domain/metrics.ts";
import { useT } from "../i18n/index.ts";

interface CookedDemandChartProps {
  rows: readonly MenuDayRow[];
  title: string;
}

function shortDate(date: string): string {
  const [, month, day] = date.split("-");
  return `${Number(day)}/${Number(month)}`;
}

function percent(value: number, max: number): string {
  return `${Math.round((value / max) * 1000) / 10}%`;
}

export function CookedDemandChart({ rows, title }: CookedDemandChartProps) {
  const t = useT();
  const max = Math.max(
    1,
    ...rows.map((row) => Math.max(row.cooked, row.demand ?? 0)),
  );

  return (
    <figure className="chart">
      <div className="bars" role="img" aria-label={title}>
        {rows.map((row) => (
          <div key={row.date} className="bars__day">
            <div className="bars__pair">
              <div
                className="bars__bar bars__bar--cooked"
                style={{ height: percent(row.cooked, max) }}
              >
                <span className="bars__value">{row.cooked}</span>
              </div>
              {row.demand === null ? (
                <div className="bars__bar bars__bar--empty" />
              ) : (
                <div
                  className={
                    row.isEstimate
                      ? "bars__bar bars__bar--demand bars__bar--estimate"
                      : "bars__bar bars__bar--demand"
                  }
                  style={{ height: percent(row.demand, max) }}
                >
                  <span className="bars__value">
                    {row.isEstimate ? `≈${row.demand}` : row.demand}
                  </span>
                </div>
              )}
            </div>
            <span className="bars__label">{shortDate(row.date)}</span>
          </div>
        ))}
      </div>
      <figcaption className="chart__legend">
        <span className="chart__key">
          <span className="swatch swatch--cooked" aria-hidden="true" />
          {t("history.chart.cooked")}
        </span>
        <span className="chart__key">
          <span className="swatch swatch--demand" aria-hidden="true" />
          {t("history.chart.demand")}
        </span>
        <span className="chart__key">
          <span className="swatch swatch--estimate" aria-hidden="true" />
          {t("history.chart.estimate")}
        </span>
      </figcaption>
      <div className="visually-hidden">
        <table>
          <caption>{title}</caption>
          <thead>
            <tr>
              <th scope="col">{t("history.col.date")}</th>
              <th scope="col">{t("history.chart.cooked")}</th>
              <th scope="col">{t("history.chart.demand")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.date}>
                <th scope="row">{row.date}</th>
                <td>{row.cooked}</td>
                <td>
                  {row.demand === null
                    ? t("estimate.none")
                    : row.isEstimate
                      ? t("estimate.value", { qty: row.demand })
                      : row.demand}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
