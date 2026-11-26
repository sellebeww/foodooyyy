// src/components/WeekStats.tsx
import type { WeeklyMetrics } from "../domain/metrics.ts";
import type { WeekMoney } from "../domain/money.ts";
import { formatRupiah } from "../i18n/format.ts";
import { useT } from "../i18n/index.ts";
import { EstimateNumber } from "./EstimateNumber.tsx";
import { StatTile } from "./StatTile.tsx";

interface WeekStatsProps {
  metrics: WeeklyMetrics;
  money: WeekMoney;
}

export function WeekStats({ metrics, money }: WeekStatsProps) {
  const t = useT();
  if (metrics.menuDayCount === 0) {
    return <p className="muted">{t("week.empty")}</p>;
  }
  return (
    <div className="week">
      <dl className="stats">
        <StatTile label={t("week.leftover")}>
          <span className="num">{metrics.leftoverPortions}</span>
        </StatTile>
        <StatTile label={t("week.sellOuts")}>
          <span className="num">{metrics.sellOutEvents}</span>
        </StatTile>
        <StatTile label={t("week.lostSales")}>
          <EstimateNumber value={metrics.estimatedLostSales} isEstimate />
        </StatTile>
        {metrics.acceptanceShare === null ? null : (
          <StatTile label={t("week.accepted")}>
            <span className="num">
              {t("week.percent", {
                value: Math.round(metrics.acceptanceShare * 100),
              })}
            </span>
          </StatTile>
        )}
      </dl>
      <dl className="money">
        <div className="money__item">
          <dt>{t("week.leftoverCost")}</dt>
          <dd className="num">{formatRupiah(money.leftoverCost)}</dd>
        </div>
        <div className="money__item money__item--missed">
          <dt>{t("week.missedEarnings")}</dt>
          <dd className="num">
            <span className="money__value">
              {`≈ ${formatRupiah(money.missedEarnings)}`}
            </span>{" "}
            <span className="est__tag">{t("estimate.tag")}</span>
          </dd>
        </div>
      </dl>
      <p className="panel__note">{t("week.moneyNote")}</p>
    </div>
  );
}
