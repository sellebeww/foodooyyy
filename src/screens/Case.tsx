// src/screens/Case.tsx
import { useState } from "react";
import { DEMO_ENABLED } from "../app/demoConfig.ts";
import { useCaseGuide } from "../app/caseGuide.ts";
import { useToast } from "../app/toast.ts";
import { useCaseView } from "../app/useCaseView.ts";
import { useOpenDemo } from "../app/useOpenDemo.ts";
import { Button } from "../components/Button.tsx";
import { EmptyState } from "../components/EmptyState.tsx";
import { ArrowIcon } from "../components/icons/ArrowIcon.tsx";
import { Screen } from "../components/Screen.tsx";
import { caseTextKey } from "../demo/cases.ts";
import { type DemoMoment } from "../demo/catalog.ts";
import { useT } from "../i18n/index.ts";

// Start each exercise where the stall's main decision happens.
const CASE_ORDER = {
  1: ["service", "close", "summary", "plan"],
  2: ["summary", "plan", "service", "close"],
  3: ["service", "close", "plan", "summary"],
  4: ["plan", "service", "close", "summary"],
} as const;

export function Case() {
  const t = useT();
  const toast = useToast();
  const view = useCaseView();
  const { start, stop } = useCaseGuide();
  const openDemo = useOpenDemo();
  const [busy, setBusy] = useState(false);

  if (view === undefined) {
    return (
      <Screen title={t("case.title")}>
        <p role="status">{t("app.loading")}</p>
      </Screen>
    );
  }
  if (!DEMO_ENABLED || view === null) {
    return (
      <Screen title={t("case.title")}>
        <EmptyState
          title={t("case.emptyTitle")}
          body={t("case.emptyBody")}
          action={<Button to="/today">{t("nav.today")}</Button>}
        />
      </Screen>
    );
  }
  if (view.facts === null) {
    return (
      <Screen title={t("case.title")}>
        <EmptyState
          title={t("case.unavailableTitle")}
          body={t("case.unavailableBody")}
          action={<Button to="/settings">{t("nav.settings")}</Button>}
        />
      </Screen>
    );
  }

  const scenario = view.entry.id;
  const open = (moment: DemoMoment) => {
    setBusy(true);
    start();
    openDemo(view.entry, moment, { quiet: true })
      .catch(() => {
        toast.show(t("common.saveFailed"));
      })
      .finally(() => {
        setBusy(false);
      });
  };

  return (
    <Screen title={t("case.title")}>
      <section className="card panel case" aria-labelledby="case-head">
        <p className="eyebrow">
          {t("case.eyebrow")} · {view.stallName}
        </p>
        <h2 id="case-head">{t(`case.s${scenario}.title`)}</h2>
        <p>{t(`case.s${scenario}.situation`, view.params)}</p>
        <p className="field__hint">{t("case.intro")}</p>
      </section>
      <ol className="case__steps">
        {CASE_ORDER[scenario].map((moment, index) => (
          <li
            key={moment}
            className="card panel case__step"
            aria-labelledby={`case-step-${moment}`}
          >
            <h2 id={`case-step-${moment}`}>
              {index + 1}. {t(`demo.moment.${moment}.title`)}
            </h2>
            <p className="eyebrow">{t("case.try")}</p>
            <p>{t(caseTextKey(scenario, moment, "try"), view.params)}</p>
            <p className="eyebrow">{t("case.happens")}</p>
            <p>{t(caseTextKey(scenario, moment, "happens"), view.params)}</p>
            <Button
              variant="secondary"
              icon={<ArrowIcon />}
              disabled={busy}
              onClick={() => {
                open(moment);
              }}
            >
              {t(`case.open.${moment}`)}
            </Button>
          </li>
        ))}
      </ol>
      <section className="card panel" aria-label={t("case.note.label")}>
        <p className="field__hint">{t("case.resetNote")}</p>
        <p className="field__hint">{t("case.another")}</p>
        <Button variant="secondary" onClick={stop}>
          {t("case.stop")}
        </Button>
      </section>
    </Screen>
  );
}
