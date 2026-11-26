// src/components/EstimateValue.tsx
import { useT } from "../i18n/index.ts";

interface EstimateValueProps {
  demand: number | null;
  isEstimate: boolean;
}

export function EstimateValue({ demand, isEstimate }: EstimateValueProps) {
  const t = useT();
  if (demand === null) {
    return <span className="estimate">{t("estimate.none")}</span>;
  }
  if (!isEstimate) {
    return <span className="estimate">{demand}</span>;
  }
  return (
    <span className="estimate estimate--approx">
      {t("estimate.value", { qty: demand })}
    </span>
  );
}
