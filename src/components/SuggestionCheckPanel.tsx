// src/components/SuggestionCheckPanel.tsx
import { useStallStamp } from "../app/useStallStamp.ts";
import { useHistory, useMenus } from "../db/hooks.ts";
import { MIN_CHECK_DAYS, suggestionCheck } from "../domain/accuracy.ts";
import { formatDecimal } from "../i18n/format.ts";
import { useI18n } from "../i18n/index.ts";
import { StatTile } from "./StatTile.tsx";

interface SuggestionCheckPanelProps {
  headingLevel?: 2 | 3;
}

export function SuggestionCheckPanel({
  headingLevel = 2,
}: SuggestionCheckPanelProps) {
  const { t, language } = useI18n();
  const { date } = useStallStamp();
  const menus = useMenus();
  const history = useHistory();
  const Heading = headingLevel === 2 ? "h2" : "h3";

  if (menus === undefined || history === undefined) {
    return null;
  }
  const check = suggestionCheck(history.menuDays, history.days, menus, date);

  return (
    <section
      className="card panel suggestion-check"
      aria-labelledby="check-title"
    >
      <Heading id="check-title">{t("check.title")}</Heading>
      <p className="muted">{t("check.lead")}</p>
      {check.enough &&
      check.meanAbsoluteError !== null &&
      check.coveredShare !== null &&
      check.targetShare !== null ? (
        <>
          <dl className="stats">
            <StatTile label={t("check.days")}>
              <span className="num">{check.evaluated}</span>
            </StatTile>
            <StatTile label={t("check.error")}>
              <span className="num">
                {t("check.errorValue", {
                  value: formatDecimal(check.meanAbsoluteError, language),
                })}
              </span>
            </StatTile>
            <StatTile label={t("check.covered")}>
              <span className="num">
                {t("check.coveredValue", {
                  value: Math.round(check.coveredShare * 100),
                })}
              </span>
            </StatTile>
          </dl>
          <p className="panel__note">
            {t("check.target", { value: Math.round(check.targetShare * 100) })}
          </p>
          <p className="panel__note">
            {t("check.overUnder", {
              over: check.overDays,
              under: check.underDays,
            })}
          </p>
          {check.includesEstimates ? (
            <p className="panel__note">{t("check.estimateNote")}</p>
          ) : null}
        </>
      ) : (
        <p className="note note--info" role="status">
          {t("check.empty", { count: check.evaluated, min: MIN_CHECK_DAYS })}
        </p>
      )}
      <p className="panel__note">{t("check.scopeNote")}</p>
    </section>
  );
}
