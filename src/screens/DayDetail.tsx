// src/screens/DayDetail.tsx
import { Link, useParams } from "react-router-dom";
import { useStallStamp } from "../app/useStallStamp.ts";
import { Button } from "../components/Button.tsx";
import { EstimateNumber } from "../components/EstimateNumber.tsx";
import { ChevronIcon } from "../components/icons/ChevronIcon.tsx";
import { Screen } from "../components/Screen.tsx";
import { StatusBadge } from "../components/StatusBadge.tsx";
import { useHistory, useMenus, useTodayState } from "../db/hooks.ts";
import { incompleteDays } from "../domain/close.ts";
import { soldPortions } from "../domain/metrics.ts";
import { summarizeDay } from "../domain/phase.ts";
import { weekdayOf } from "../domain/time.ts";
import { formatLongDate } from "../i18n/format.ts";
import { useI18n } from "../i18n/index.ts";
import { renderReason } from "../i18n/reason.ts";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function DayDetail() {
  const { t, language } = useI18n();
  const stamp = useStallStamp();
  const { date = "" } = useParams();
  const valid = ISO_DATE.test(date);
  const menus = useMenus();
  const state = useTodayState(valid ? date : stamp.date);
  const history = useHistory();
  const title = t("day.title");

  if (menus === undefined || state === undefined || history === undefined) {
    return (
      <Screen title={title}>
        <p role="status">{t("app.loading")}</p>
      </Screen>
    );
  }

  const back = (
    <Link className="link-target back-link" to="/history">
      <ChevronIcon />
      {t("day.back")}
    </Link>
  );

  if (!valid || (state.menuDays.length === 0 && state.day === undefined)) {
    return (
      <Screen title={title}>
        {back}
        <p className="muted">{t("day.empty")}</p>
      </Screen>
    );
  }

  const byId = new Map(menus.map((menu) => [menu.id, menu]));
  const closed = state.day?.closed ?? false;
  const summary = summarizeDay(state.menuDays, state.day);
  const canClose =
    !closed &&
    incompleteDays(history.days, history.menuDays, stamp.date).includes(date);

  return (
    <Screen title={title}>
      {back}
      <section className="card panel" aria-labelledby="day-date">
        <div className="panel__head">
          <h2 id="day-date">{formatLongDate(date, language)}</h2>
          <StatusBadge closed={closed} unusual={state.day?.unusual === true} />
        </div>
        <p className="muted">
          {t("history.days.meta", {
            portions: summary.portions,
            soldOut: summary.soldOutCount,
          })}
        </p>
        {canClose ? (
          <Button to={`/close/${date}`}>{t("day.closeAction")}</Button>
        ) : null}
      </section>
      <ul className="card-grid">
        {state.menuDays.map((item) => {
          const menu = byId.get(item.menuId);
          return (
            <li key={item.menuId} className="card panel">
              <div className="panel__head">
                <h3>{menu?.name ?? item.menuId}</h3>
                {item.soldOutAt === null ? (
                  <span className="badge badge--plain">
                    {t("day.notSoldOut")}
                  </span>
                ) : (
                  <span className="badge badge--soldout">
                    {t("day.soldOutAt", { time: item.soldOutAt })}
                  </span>
                )}
              </div>
              <dl className="figures">
                <div>
                  <dt>{t("history.col.cooked")}</dt>
                  <dd>
                    <span className="num">{item.cookedQty}</span>
                  </dd>
                </div>
                <div>
                  <dt>{t("history.col.sold")}</dt>
                  <dd>
                    <EstimateNumber
                      value={soldPortions(item)}
                      isEstimate={false}
                    />
                  </dd>
                </div>
                <div>
                  <dt>{t("history.col.leftover")}</dt>
                  <dd>
                    <EstimateNumber value={item.leftover} isEstimate={false} />
                  </dd>
                </div>
                <div>
                  <dt>{t("history.col.demand")}</dt>
                  <dd>
                    <EstimateNumber
                      value={item.estimatedDemand}
                      isEstimate={item.demandIsEstimate}
                    />
                  </dd>
                </div>
              </dl>
              <p className="panel__note">
                {item.suggestedQty === null
                  ? t("day.noSuggestion")
                  : t("day.suggested", { qty: item.suggestedQty })}
                {item.reason === null || menu === undefined
                  ? null
                  : ` · ${renderReason(t, item.reason, {
                      weekday: weekdayOf(date),
                      usualQty: menu.usualQty,
                    })}`}
              </p>
            </li>
          );
        })}
      </ul>
    </Screen>
  );
}
