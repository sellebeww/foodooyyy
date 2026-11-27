// src/components/DemoLauncher.tsx
import { useId, useState } from "react";
import {
  DEFAULT_DEMO_SCENARIO,
  DEMO_CATALOG,
  DEMO_MOMENTS,
  demoMomentTime,
  type DemoCatalogEntry,
  type DemoMoment,
  type DemoScenarioId,
} from "../demo/catalog.ts";
import { useT } from "../i18n/index.ts";
import { Button } from "./Button.tsx";
import { ArrowIcon } from "./icons/ArrowIcon.tsx";
import { NavIconFor } from "./NavIconFor.tsx";

interface DemoLauncherProps {
  initial?: DemoScenarioId;
  disabled: boolean;
  onOpen: (entry: DemoCatalogEntry, moment: DemoMoment | null) => void;
  onTutorial: (entry: DemoCatalogEntry) => void;
  onResume?: (() => void) | undefined;
}

const ICONS = {
  plan: "plan",
  service: "service",
  close: "close",
  summary: "history",
} as const;

export function DemoLauncher({
  initial = DEFAULT_DEMO_SCENARIO,
  disabled,
  onOpen,
  onTutorial,
  onResume,
}: DemoLauncherProps) {
  const t = useT();
  const momentsId = useId();
  const [scenario, setScenario] = useState(initial);
  const selected = DEMO_CATALOG.find((entry) => entry.id === scenario);
  if (selected === undefined) {
    return null;
  }
  return (
    <div className="launcher">
      {onResume === undefined ? null : (
        <div className="launcher__resume">
          <Button
            variant="secondary"
            disabled={disabled}
            icon={<ArrowIcon />}
            onClick={onResume}
          >
            {t("demo.launch.resume")}
          </Button>
          <p className="field__hint">{t("demo.launch.resumeNote")}</p>
        </div>
      )}
      <fieldset className="launcher__group" disabled={disabled}>
        <legend className="launcher__legend">{t("demo.launch.stall")}</legend>
        <div className="launcher__stalls">
          {DEMO_CATALOG.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className="launcher__stall"
              data-initial-focus={entry.id === initial ? true : undefined}
              onClick={() => onTutorial(entry)}
            >
              <span className="launcher__name">{entry.stallName}</span>
              <span className="launcher__meta">
                {t("demo.pick.hours", {
                  open: entry.openAt,
                  close: entry.closeAt,
                })}
                {" · "}
                {t("demo.pick.history", { days: entry.historyDays })}
              </span>
              <span className="launcher__desc">
                {t(`demo.s${entry.id}.desc`)}
              </span>
            </button>
          ))}
        </div>
      </fieldset>
      <div className="launcher__group" role="group" aria-labelledby={momentsId}>
        <p id={momentsId} className="launcher__legend">
          {t("demo.launch.moment")}
        </p>
        <label className="field">
          {t("demo.launch.practice")}
          <select
            value={scenario}
            disabled={disabled}
            onChange={(event) => {
              const entry = DEMO_CATALOG.find(
                (item) => String(item.id) === event.target.value,
              );
              if (entry) setScenario(entry.id);
            }}
          >
            {DEMO_CATALOG.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.stallName}
              </option>
            ))}
          </select>
        </label>
        <div key={scenario} className="launcher__moments">
          {DEMO_MOMENTS.map((moment) => (
            <button
              key={moment}
              type="button"
              className="launcher__moment"
              disabled={disabled}
              onClick={() => {
                onOpen(selected, moment);
              }}
            >
              <span className="launcher__icon">
                <NavIconFor icon={ICONS[moment]} />
              </span>
              <span className="launcher__name">
                {t(`demo.moment.${moment}.title`)}
              </span>
              <span className="launcher__desc">
                {t(`demo.moment.${moment}.desc`)}
              </span>
              {moment === "summary" ? null : (
                <span className="launcher__time num">
                  {demoMomentTime(moment, selected)}
                </span>
              )}
            </button>
          ))}
        </div>
        <p className="field__hint">{t("demo.launch.note")}</p>
        <Button
          variant="secondary"
          disabled={disabled}
          icon={<ArrowIcon />}
          onClick={() => {
            onOpen(selected, null);
          }}
        >
          {t("demo.launch.realClock")}
        </Button>
      </div>
    </div>
  );
}
