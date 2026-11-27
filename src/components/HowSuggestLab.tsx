// src/components/HowSuggestLab.tsx
import { useId, useState } from "react";
import {
  EXAMPLE_HISTORY_COOKED,
  EXAMPLE_HISTORY_DEMAND,
  EXAMPLE_MENU,
  suggestionAtCost,
} from "../domain/explain.ts";
import { formatRupiah } from "../i18n/format.ts";
import { useT, type MessageKey } from "../i18n/index.ts";
import { renderReason } from "../i18n/reason.ts";

const COST_MIN = 1000;
const COST_STEP = 500;
const COST_MAX = EXAMPLE_MENU.price - COST_STEP;
const WEEKDAY = 1;

export function HowSuggestLab() {
  const t = useT();
  const sliderId = useId();
  const [cost, setCost] = useState(EXAMPLE_MENU.cost);
  const result = suggestionAtCost(cost);
  const history = [...EXAMPLE_HISTORY_DEMAND].sort((a, b) => a - b);
  return (
    <section className="card how how-lab" aria-labelledby="how-suggest">
      <h2 id="how-suggest">{t("how.suggestTitle")}</h2>
      <div className="how-lab__control">
        <label htmlFor={sliderId}>
          <span>{t("how.costSlider")}</span>
          <strong className="num">{formatRupiah(cost)}</strong>
        </label>
        <input
          id={sliderId}
          type="range"
          min={COST_MIN}
          max={COST_MAX}
          step={COST_STEP}
          value={cost}
          aria-valuetext={formatRupiah(cost)}
          onChange={(event) => {
            setCost(Number(event.target.value));
          }}
        />
        <p className="field__hint">
          {t("how.suggestTry")}{" "}
          {t("how.suggestPrice", { price: formatRupiah(EXAMPLE_MENU.price) })}
        </p>
      </div>
      <p>
        {t("how.suggestMoney", {
          gain: formatRupiah(result.gainPerPortion),
          loss: formatRupiah(result.lossPerLeftover),
        })}
      </p>
      <p>{t("how.suggestCover", { cover: result.coverPercent })}</p>
      <p>
        {t("how.suggestHistory", {
          count: history.length,
          weekdays: t(`weekday.plural.${WEEKDAY}` as MessageKey),
          values: history.join(", "),
        })}
      </p>
      <p className="how__result" aria-live="polite">
        <span className="num">{result.suggestion.qty}</span>{" "}
        <span>{t("close.suggestedPortions")}</span>
      </p>
      <p className="summary__reason">
        {renderReason(t, result.suggestion.reason, {
          weekday: WEEKDAY,
          usualQty: EXAMPLE_HISTORY_COOKED,
        })}
      </p>
      <ul className="how__rules">
        <li>{t("how.ruleEligible")}</li>
        <li>{t("how.ruleWeekday")}</li>
        <li>{t("how.ruleColdStart")}</li>
        <li>{t("how.ruleYouDecide")}</li>
      </ul>
    </section>
  );
}
