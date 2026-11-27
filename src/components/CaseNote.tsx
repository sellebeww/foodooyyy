// src/components/CaseNote.tsx
import { Link, useLocation } from "react-router-dom";
import { DEMO_ENABLED } from "../app/demoConfig.ts";
import { useCaseGuide } from "../app/caseGuide.ts";
import { useTour } from "../app/tour.ts";
import { useCaseView } from "../app/useCaseView.ts";
import { caseTextKey } from "../demo/cases.ts";
import type { DemoMoment } from "../demo/catalog.ts";
import { useT } from "../i18n/index.ts";

const MOMENT_OF_PATH: Readonly<Record<string, DemoMoment>> = {
  "/plan": "plan",
  "/service": "service",
  "/close": "close",
  "/history": "summary",
};

export function CaseNote() {
  const { pathname } = useLocation();
  const { active } = useCaseGuide();
  const { step } = useTour();
  const moment = MOMENT_OF_PATH[pathname];
  if (!DEMO_ENABLED || !active || step !== null || moment === undefined) {
    return null;
  }
  return <CaseNoteBody moment={moment} />;
}

function CaseNoteBody({ moment }: { moment: DemoMoment }) {
  const t = useT();
  const { stop } = useCaseGuide();
  const view = useCaseView();
  if (view === undefined || view === null || view.facts === null) {
    return null;
  }
  const scenario = view.entry.id;
  return (
    <details className="case-note" open>
      <summary className="case-note__title">
        {t("case.eyebrow")}: {t(`case.s${scenario}.title`)}
      </summary>
      <div
        className="case-note__body"
        role="note"
        aria-label={t("case.note.label")}
      >
        <p className="eyebrow">{t("case.try")}</p>
        <p>{t(caseTextKey(scenario, moment, "try"), view.params)}</p>
        <p className="eyebrow">{t("case.happens")}</p>
        <p>{t(caseTextKey(scenario, moment, "happens"), view.params)}</p>
        <div className="case-note__actions">
          <Link className="link-target" to="/case">
            {t("case.back")}
          </Link>
          <button type="button" className="case-note__stop" onClick={stop}>
            {t("case.stop")}
          </button>
        </div>
      </div>
    </details>
  );
}
