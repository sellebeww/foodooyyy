// src/components/CloseSummary.tsx
import { useId } from "react";
import { Link } from "react-router-dom";
import type { TomorrowPlan } from "../domain/close.ts";
import { isCooked } from "../domain/plan.ts";
import type { Menu, MenuDay } from "../domain/types.ts";
import { formatLongDate, formatRupiah } from "../i18n/format.ts";
import { useI18n } from "../i18n/index.ts";
import { renderReason } from "../i18n/reason.ts";
import { EstimateValue } from "./EstimateValue.tsx";

interface CloseSummaryProps {
  rows: readonly MenuDay[];
  menus: readonly Menu[];
  tomorrow: TomorrowPlan | null;
  revenue?: number;
}

export function CloseSummary({
  rows,
  menus,
  tomorrow,
  revenue,
}: CloseSummaryProps) {
  const { t, language } = useI18n();
  const todayId = useId();
  const tomorrowId = useId();
  const byId = new Map(menus.map((menu) => [menu.id, menu]));
  const nameOf = (menuId: string) => byId.get(menuId)?.name ?? menuId;
  return (
    <div className="summary">
      <section aria-labelledby={todayId}>
        <h3 id={todayId}>{t("close.todayHeading")}</h3>
        <ul className="summary__list">
          {rows.filter(isCooked).map((row) => (
            <li key={row.menuId} className="summary__row">
              <span className="summary__name">{nameOf(row.menuId)}</span>{" "}
              <span className="summary__meta">
                {t("close.cookedOf", { qty: row.cookedQty })}
              </span>{" "}
              <span className="summary__value">
                <span className="summary__label">{t("close.wanted")}</span>{" "}
                <EstimateValue
                  demand={row.estimatedDemand}
                  isEstimate={row.demandIsEstimate}
                />
              </span>
            </li>
          ))}
        </ul>
        {revenue === undefined ? null : (
          <p className="num">
            {t("close.revenue", { amount: formatRupiah(revenue) })}
          </p>
        )}
        <p>
          <Link className="link-target" to="/how">
            {t("close.howLink")}
          </Link>
        </p>
      </section>
      {tomorrow === null ? null : (
        <section aria-labelledby={tomorrowId}>
          <h3 id={tomorrowId}>
            {t("close.tomorrowHeading", {
              date: formatLongDate(tomorrow.date, language),
            })}
          </h3>
          {tomorrow.suggestions.length === 0 ? (
            <p>{t("close.tomorrowNone")}</p>
          ) : (
            <ul className="summary__list">
              {tomorrow.suggestions.map((suggestion) => {
                const menu = byId.get(suggestion.menuId);
                return (
                  <li key={suggestion.menuId} className="summary__row">
                    <span className="summary__name">
                      {nameOf(suggestion.menuId)}
                    </span>{" "}
                    <span className="summary__value">
                      <span className="num">{suggestion.qty}</span>{" "}
                      <span>{t("close.suggestedPortions")}</span>
                    </span>{" "}
                    <span className="summary__reason">
                      {renderReason(t, suggestion.reason, {
                        weekday: tomorrow.weekday,
                        usualQty: menu?.usualQty ?? 0,
                      })}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
