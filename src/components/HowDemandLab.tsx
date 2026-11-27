// src/components/HowDemandLab.tsx
import { useId, useState, type CSSProperties } from "react";
import { hourWeight } from "../domain/estimate.ts";
import {
  demandAt,
  EXAMPLE_COOKED,
  EXAMPLE_SETTINGS,
  EXAMPLE_SOLD_OUT_AT,
} from "../domain/explain.ts";
import { profileHours } from "../domain/setup.ts";
import {
  closeMinute,
  formatHHMM,
  openMinute,
  parseHHMM,
} from "../domain/time.ts";
import { useT, type MessageKey } from "../i18n/index.ts";
import { EstimateValue } from "./EstimateValue.tsx";

const STEP_MINUTES = 30;
const HOURS = profileHours(EXAMPLE_SETTINGS.openAt, EXAMPLE_SETTINGS.closeAt);

export function HowDemandLab() {
  const t = useT();
  const sliderId = useId();
  const [minute, setMinute] = useState(() => parseHHMM(EXAMPLE_SOLD_OUT_AT));
  const time = formatHHMM(minute);
  const result = demandAt(time);
  return (
    <section className="card how how-lab" aria-labelledby="how-demand">
      <h2 id="how-demand">{t("how.demandTitle")}</h2>
      <p>
        {t("how.demandSetup", {
          cooked: EXAMPLE_COOKED,
          time: result.soldOutAt,
        })}
      </p>
      <div className="how-lab__control">
        <label htmlFor={sliderId}>
          <span>{t("how.demandSlider")}</span>
          <strong className="num">{time}</strong>
        </label>
        <input
          id={sliderId}
          type="range"
          min={openMinute(EXAMPLE_SETTINGS) + STEP_MINUTES}
          max={closeMinute(EXAMPLE_SETTINGS)}
          step={STEP_MINUTES}
          value={minute}
          aria-valuetext={time}
          onChange={(event) => {
            setMinute(Number(event.target.value));
          }}
        />
        <p className="field__hint">{t("how.demandTry")}</p>
      </div>
      <figure className="how-bars">
        <ol className="how-bars__list">
          {HOURS.map((hour) => {
            const before = Number(hour) * 60 < minute;
            const weight = hourWeight(EXAMPLE_SETTINGS, Number(hour));
            return (
              <li
                key={hour}
                className={
                  before
                    ? "how-bars__item how-bars__item--before"
                    : "how-bars__item"
                }
                style={{ "--weight": weight } as CSSProperties}
              >
                <span className="how-bars__hour">{hour}:00</span>{" "}
                <span className="how-bars__track" aria-hidden="true">
                  <span className="how-bars__bar" />
                </span>
                <span className="how-bars__level">
                  {t(`hours.level.${weight}` as MessageKey)}
                </span>
                {before ? (
                  <span className="visually-hidden">
                    {" "}
                    {t("how.barBefore", { time })}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
        <figcaption className="field__hint">
          {t("how.barsCaption", { time })}
        </figcaption>
      </figure>
      <p>{t("how.demandShare", { time, percent: result.arrivedPercent })}</p>
      <p>
        {t("how.demandResult", {
          cooked: EXAMPLE_COOKED,
          percent: result.arrivedPercent,
        })}
      </p>
      <p className="how__result" aria-live="polite">
        <span>{t("close.wanted")}</span>{" "}
        <EstimateValue demand={result.demand} isEstimate />
      </p>
      <p className="how-lab__rule" aria-live="polite">
        {t(`how.ruleNow.${result.rule}` as MessageKey, {
          cooked: EXAMPLE_COOKED,
          cap: result.cap,
        })}
      </p>
      <ul className="how__rules">
        <li>{t("how.ruleCounted")}</li>
        <li>{t("how.ruleLate")}</li>
        <li>{t("how.ruleCap", { cap: result.cap })}</li>
        <li>{t("how.ruleBusy")}</li>
      </ul>
    </section>
  );
}
