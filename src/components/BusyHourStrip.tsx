// src/components/BusyHourStrip.tsx
import { useId } from "react";
import { nextBusyLevel } from "../domain/setup.ts";
import type { BusyLevel } from "../domain/types.ts";
import { useT } from "../i18n/index.ts";

interface BusyHourStripProps {
  hours: readonly string[];
  profile: Readonly<Record<string, BusyLevel>>;
  onChange: (profile: Record<string, BusyLevel>) => void;
}

const LEVEL_CLASS: Record<BusyLevel, string> = {
  1: "quiet",
  2: "normal",
  4: "busy",
};

export function BusyHourStrip({
  hours,
  profile,
  onChange,
}: BusyHourStripProps) {
  const t = useT();
  const hintId = useId();
  return (
    <fieldset className="busy">
      <legend>{t("hours.busyTitle")}</legend>
      <p id={hintId} className="field__hint">
        {t("hours.busyHint")}
      </p>
      {hours.length === 0 ? (
        <p className="busy__empty">{t("hours.busyEmpty")}</p>
      ) : (
        <ul className="busy__strip">
          {hours.map((hour) => {
            const level = profile[hour] ?? 2;
            return (
              <li key={hour}>
                <button
                  type="button"
                  className={`busy__cell busy__cell--${LEVEL_CLASS[level]}`}
                  aria-describedby={hintId}
                  onClick={() => {
                    onChange({ ...profile, [hour]: nextBusyLevel(level) });
                  }}
                >
                  <span className="busy__hour">{hour}:00</span>{" "}
                  <span className="busy__level">
                    {t(`hours.level.${level}`)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </fieldset>
  );
}
