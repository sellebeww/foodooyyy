// src/components/MenuCard.tsx
import { PLAN_QTY_MAX } from "../domain/plan.ts";
import { useT } from "../i18n/index.ts";
import { Stepper } from "./Stepper.tsx";

interface MenuCardProps {
  name: string;
  value: number;
  suggested: number | null;
  reason: string | null;
  readOnly: boolean;
  onChange: (value: number) => void;
}

export function MenuCard({
  name,
  value,
  suggested,
  reason,
  readOnly,
  onChange,
}: MenuCardProps) {
  const t = useT();
  const edited = suggested !== null && value !== suggested;
  return (
    <li className="card menu-card">
      <div className="menu-card__head">
        <span className="menu-card__photo" aria-hidden="true">
          {name.trim().charAt(0).toUpperCase()}
        </span>
        <h2 className="menu-card__name">{name}</h2>
        {edited ? (
          <span className="tag tag--edited">{t("plan.edited")}</span>
        ) : null}
      </div>
      {readOnly ? (
        <p className="menu-card__fixed">
          <span className="num menu-card__qty">{value}</span>{" "}
          <span>{t("plan.cooked", { qty: value })}</span>
        </p>
      ) : (
        <Stepper
          label={t("plan.portionsLabel", { name })}
          decreaseLabel={t("plan.decrease", { name })}
          increaseLabel={t("plan.increase", { name })}
          value={value}
          min={0}
          max={PLAN_QTY_MAX}
          onChange={onChange}
        />
      )}
      {edited ? (
        <p className="menu-card__suggested">
          {t("plan.suggested", { qty: suggested })}
        </p>
      ) : null}
      {reason === null ? null : <p className="menu-card__reason">{reason}</p>}
    </li>
  );
}
