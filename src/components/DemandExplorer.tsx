// src/components/DemandExplorer.tsx
import { useId, useState, type CSSProperties } from "react";
import {
  arrivalShare,
  estimateDemand,
  hourWeight,
} from "../domain/estimate.ts";
import {
  EXAMPLE_COOKED,
  EXAMPLE_MENU,
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
import { useT } from "../i18n/index.ts";
import { EstimateValue } from "./EstimateValue.tsx";
import { Sticker } from "./Sticker.tsx";

const STEP_MINUTES = 30;
const HOURS = profileHours(EXAMPLE_SETTINGS.openAt, EXAMPLE_SETTINGS.closeAt);

export function DemandExplorer() {
  const t = useT();
  const sliderId = useId();
  const titleId = useId();
  const [minute, setMinute] = useState(() => parseHHMM(EXAMPLE_SOLD_OUT_AT));
  const time = formatHHMM(minute);
  const percent = Math.round(100 * arrivalShare(EXAMPLE_SETTINGS, time));
  const demand =
    estimateDemand(EXAMPLE_COOKED, 0, time, EXAMPLE_SETTINGS)?.demand ??
    EXAMPLE_COOKED;
  return (
    <section className="explorer" aria-labelledby={titleId}>
      <div className="explorer__head">
        <div>
          <h2 id={titleId}>{t("landing.explorer.title")}</h2>
          <p className="explorer__meta">
            {EXAMPLE_MENU.name}
            {" · "}
            {t("landing.explorer.cooked", { cooked: EXAMPLE_COOKED })}
          </p>
        </div>
        <Sticker>{t("landing.exampleBadge")}</Sticker>
      </div>
      <div className="explorer__bars" aria-hidden="true">
        {HOURS.map((hour) => {
          const filled = Math.min(
            1,
            Math.max(0, (minute - Number(hour) * 60) / 60),
          );
          const style = {
            "--weight": hourWeight(EXAMPLE_SETTINGS, Number(hour)),
            "--fill": filled,
          } as CSSProperties;
          return (
            <div key={hour} className="explorer__hour" style={style}>
              <span className="explorer__bar">
                <span className="explorer__fill" />
              </span>
              <span className="explorer__label">{hour}</span>
            </div>
          );
        })}
      </div>
      <p className="explorer__legend">
        <span className="explorer__key explorer__key--sold">
          {t("landing.explorer.legendSold")}
        </span>
        <span className="explorer__key explorer__key--missed">
          {t("landing.explorer.legendMissed")}
        </span>
      </p>
      <div className="explorer__control">
        <label htmlFor={sliderId}>
          <span>{t("landing.exampleSoldOut")}</span>
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
      </div>
      <dl className="explorer__result" aria-live="polite">
        <div>
          <dt>{t("landing.explorer.arrived")}</dt>
          <dd className="num">{t("week.percent", { value: percent })}</dd>
        </div>
        <div className="explorer__wanted">
          <dt>{t("close.wanted")}</dt>
          <dd className="num">
            <EstimateValue demand={demand} isEstimate />
          </dd>
        </div>
      </dl>
      <p className="explorer__hint">{t("landing.explorer.hint")}</p>
    </section>
  );
}
