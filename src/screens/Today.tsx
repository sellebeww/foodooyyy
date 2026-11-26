// src/screens/Today.tsx
import { Link } from "react-router-dom";
import { DEMO_ENABLED } from "../app/demoConfig.ts";
import { useStallStamp } from "../app/useStallStamp.ts";
import { Button } from "../components/Button.tsx";
import { EmptyState } from "../components/EmptyState.tsx";
import { LoopProgress } from "../components/LoopProgress.tsx";
import { Screen } from "../components/Screen.tsx";
import { TodayMenus } from "../components/TodayMenus.tsx";
import { WeekStats } from "../components/WeekStats.tsx";
import { useHistory, useMenus, useStall, useTodayState } from "../db/hooks.ts";
import { incompleteDays } from "../domain/close.ts";
import { weeklyMetrics } from "../domain/metrics.ts";
import { weeklyMoney } from "../domain/money.ts";
import { summarizeDay, todayPhase, type Phase } from "../domain/phase.ts";
import { formatLongDate } from "../i18n/format.ts";
import { useI18n, type MessageKey } from "../i18n/index.ts";

const MAX_INCOMPLETE_SHOWN = 3;

const ACTIONS: Record<Phase, { label: MessageKey; to: string | null }> = {
  plan: { label: "today.action.plan", to: "/plan" },
  service: { label: "today.action.service", to: "/service" },
  close: { label: "today.action.close", to: "/close" },
  done: { label: "today.action.done", to: null },
};

export function Today() {
  const { t, language } = useI18n();
  const { date, time } = useStallStamp();
  const stall = useStall();
  const menus = useMenus();
  const today = useTodayState(date);
  const history = useHistory();

  if (!stall || menus === undefined || today === undefined) {
    return (
      <Screen title={t("today.title")}>
        <p role="status">{t("app.loading")}</p>
      </Screen>
    );
  }

  if (!stall.setupComplete) {
    return (
      <Screen title={t("today.title")}>
        <EmptyState
          title={t("today.empty.setupTitle")}
          body={t("today.empty.setupBody")}
          action={
            <Button to="/setup/menus">{t("today.empty.setupAction")}</Button>
          }
        />
      </Screen>
    );
  }

  const summary = summarizeDay(today.menuDays, today.day);
  const hasActiveMenu = menus.some((menu) => !menu.archived);
  if (!hasActiveMenu && summary.plannedCount === 0) {
    return (
      <Screen title={t("today.title")}>
        <EmptyState
          title={t("today.empty.menusTitle")}
          body={t("today.empty.menusBody")}
          action={
            <Button to="/settings">{t("today.empty.menusAction")}</Button>
          }
        />
      </Screen>
    );
  }

  const incomplete =
    history === undefined
      ? []
      : incompleteDays(history.days, history.menuDays, date);
  const phase = todayPhase({
    ...summary,
    time,
    openAt: stall.settings.openAt,
    closeAt: stall.settings.closeAt,
  });
  const action = ACTIONS[phase];

  return (
    <Screen title={t("today.title")}>
      <section className="card today">
        <div className="today__intro">
          {stall.name === "" ? null : <p className="eyebrow">{stall.name}</p>}
          <p className="today__hint">
            {t(phase === "done" ? "today.doneNote" : `today.hint.${phase}`)}
          </p>
        </div>
        <LoopProgress phase={phase} />
        {action.to === null ? (
          <Button wide disabled>
            {t(action.label)}
          </Button>
        ) : (
          <Button wide to={action.to}>
            {t(action.label)}
          </Button>
        )}
      </section>
      {DEMO_ENABLED && stall.settings.isDemo ? (
        <section className="card panel" aria-labelledby="today-sim">
          <h2 id="today-sim">{t("sim.title")}</h2>
          <p>{t("sim.cardBody")}</p>
          <div data-tour="open-sim">
            <Button variant="secondary" to="/simulate">
              {t("sim.open")}
            </Button>
          </div>
        </section>
      ) : null}
      <section className="counts" aria-labelledby="today-counts">
        <h2 id="today-counts">{t("today.counts.title")}</h2>
        <dl className="counts__grid">
          <div className="counts__item">
            <dt>{t("today.counts.portions")}</dt>
            <dd className="num">{summary.portions}</dd>
          </div>
          <div className="counts__item">
            <dt>{t("today.counts.soldOut")}</dt>
            <dd className="num">{summary.soldOutCount}</dd>
          </div>
          <div className="counts__item">
            <dt>{t("today.counts.closed")}</dt>
            <dd className="num">
              {t(summary.closed ? "common.yes" : "common.no")}
            </dd>
          </div>
        </dl>
      </section>
      <TodayMenus
        heading={[stall.name, formatLongDate(date, language)]
          .filter((part) => part !== "")
          .join(" · ")}
        rows={today.menuDays}
        nameOf={(menuId) =>
          menus.find((menu) => menu.id === menuId)?.name ?? menuId
        }
      />
      {history === undefined ? null : (
        <section className="card panel" aria-labelledby="today-week">
          <div className="panel__head">
            <h2 id="today-week">{t("week.title")}</h2>
            <Link className="link-target panel__link" to="/history">
              {t("today.historyLink")}
            </Link>
          </div>
          <WeekStats
            metrics={weeklyMetrics(history.menuDays, history.days, date)}
            money={weeklyMoney(history.menuDays, history.days, menus, date)}
          />
        </section>
      )}
      {incomplete.length === 0 ? null : (
        <section className="card notice" aria-labelledby="today-incomplete">
          <h2 id="today-incomplete">{t("today.incompleteTitle")}</h2>
          <p>{t("today.incompleteBody")}</p>
          <ul>
            {incomplete.slice(0, MAX_INCOMPLETE_SHOWN).map((day) => (
              <li key={day}>
                <Link className="link-target" to={`/close/${day}`}>
                  {t("today.incompleteAction", {
                    date: formatLongDate(day, language),
                  })}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Screen>
  );
}
