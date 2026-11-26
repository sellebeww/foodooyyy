// src/components/EstimateNumber.tsx
import { useT } from "../i18n/index.ts";

interface EstimateNumberProps {
  value: number | null;
  isEstimate: boolean;
}

export function EstimateNumber({ value, isEstimate }: EstimateNumberProps) {
  const t = useT();
  if (value === null) {
    return (
      <span className="est">
        <span aria-hidden="true">–</span>
        <span className="visually-hidden">{t("estimate.none")}</span>
      </span>
    );
  }
  if (!isEstimate) {
    return <span className="est num">{value}</span>;
  }
  return (
    <span className="est">
      <span className="num">≈ {value}</span>
      <span className="est__tag">{t("estimate.tag")}</span>
    </span>
  );
}
