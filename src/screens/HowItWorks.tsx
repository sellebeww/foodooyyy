// src/screens/HowItWorks.tsx
import type { CSSProperties } from "react";
import { Button } from "../components/Button.tsx";
import { EstimateValue } from "../components/EstimateValue.tsx";
import { Screen } from "../components/Screen.tsx";
import { workedExample } from "../domain/explain.ts";
import { formatRupiah } from "../i18n/format.ts";
import { useT, type MessageKey } from "../i18n/index.ts";
import { renderReason } from "../i18n/reason.ts";

const example = workedExample();

export function HowItWorks() {
  const t = useT();
  const weekdays = t(`weekday.plural.${example.weekday}` as MessageKey);
  return (
    <Screen title={t("how.title")} showSettings={false}>
      <div className="how-intro">
        <p>{t("how.intro")}</p>
        <p className="note note--info">{t("how.exampleNote")}</p>
      </div>

      <div className="how-grid">
        <section className="card how" aria-labelledby="how-demand">
          <h2 id="how-demand">{t("how.demandTitle")}</h2>
          <p>
            {t("how.demandSetup", {
              cooked: example.cooked,
              time: example.soldOutAt,
            })}
          </p>
          <figure className="how-bars">
            <ol className="how-bars__list">
              {example.hours.map((hour) => (
                <li
                  key={hour.hour}
                  className={
                    hour.beforeSellOut
                      ? "how-bars__item how-bars__item--before"
                      : "how-bars__item"
                  }
                  style={{ "--weight": hour.weight } as CSSProperties}
                >
                  <span className="how-bars__hour">{hour.hour}:00</span>{" "}
                  <span className="how-bars__track" aria-hidden="true">
                    <span className="how-bars__bar" />
                  </span>
                  <span className="how-bars__level">
                    {t(`hours.level.${hour.weight}` as MessageKey)}
                  </span>
                  {hour.beforeSellOut ? (
                    <span className="visually-hidden">
                      {" "}
                      {t("how.barBefore", { time: example.soldOutAt })}
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
            <figcaption className="field__hint">
              {t("how.barsCaption", { time: example.soldOutAt })}
            </figcaption>
          </figure>
          <p>
            {t("how.demandShare", {
              time: example.soldOutAt,
              percent: example.arrivedPercent,
            })}
          </p>
          <p>
            {t("how.demandResult", {
              cooked: example.cooked,
              percent: example.arrivedPercent,
            })}
          </p>
          <p className="how__result">
            <span>{t("close.wanted")}</span>{" "}
            <EstimateValue demand={example.demand} isEstimate />
          </p>
          <ul className="how__rules">
            <li>{t("how.ruleCounted")}</li>
            <li>{t("how.ruleLate")}</li>
            <li>{t("how.ruleCap", { cap: example.cap })}</li>
            <li>{t("how.ruleBusy")}</li>
          </ul>
        </section>

        <div className="how-grid__side">
          <section className="card how" aria-labelledby="how-suggest">
            <h2 id="how-suggest">{t("how.suggestTitle")}</h2>
            <p>
              {t("how.suggestMoney", {
                gain: formatRupiah(example.gainPerPortion),
                loss: formatRupiah(example.lossPerLeftover),
              })}
            </p>
            <p>{t("how.suggestCover", { cover: example.coverPercent })}</p>
            <p>
              {t("how.suggestHistory", {
                count: example.history.length,
                weekdays,
                values: example.history.join(", "),
              })}
            </p>
            <p className="how__result">
              <span className="num">{example.suggestion.qty}</span>{" "}
              <span>{t("close.suggestedPortions")}</span>
            </p>
            <p className="summary__reason">
              {renderReason(t, example.suggestion.reason, {
                weekday: example.weekday,
                usualQty: example.historyCooked,
              })}
            </p>
            <ul className="how__rules">
              <li>{t("how.ruleEligible")}</li>
              <li>{t("how.ruleWeekday")}</li>
              <li>{t("how.ruleColdStart")}</li>
              <li>{t("how.ruleYouDecide")}</li>
            </ul>
          </section>

          <section className="card how how--dark" aria-labelledby="how-not">
            <h2 id="how-not">{t("how.notTitle")}</h2>
            <ul className="how__rules">
              <li>{t("how.notAi")}</li>
              <li>{t("how.notCloud")}</li>
            </ul>
          </section>
        </div>
      </div>

      <Button variant="secondary" to="/start">
        {t("how.back")}
      </Button>
    </Screen>
  );
}
