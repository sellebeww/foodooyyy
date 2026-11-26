// src/components/WeekStats.tsx
import type { WeeklyMetrics } from "../domain/metrics.ts";
import { useT } from "../i18n/index.ts";
import { EstimateNumber } from "./EstimateNumber.tsx";
import { StatTile } from "./StatTile.tsx";

interface WeekStatsProps {
  metrics: WeeklyMetrics;
}

export function WeekStats({ metrics }: WeekStatsProps) {
  const t = useT();
  if (metrics.menuDayCount === 0) {
    return <p className="muted">{t("week.empty")}</p>;
  }
  return (
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
  );
}
