// src/components/ModeSwitch.tsx
import type { SalesMode } from "../domain/types.ts";
import { useT } from "../i18n/index.ts";

interface ModeSwitchProps {
  value: SalesMode;
  onChange: (mode: SalesMode) => void;
}

export function ModeSwitch({ value, onChange }: ModeSwitchProps) {
  const t = useT();
  return (
    <fieldset className="segmented">
      <legend>{t("settings.mode.title")}</legend>
      <div className="segmented__options">
        {(["simple", "pos"] as const).map((option) => (
          <label key={option} className="segmented__option">
            <input
              type="radio"
              name="sales-mode"
              value={option}
              checked={value === option}
              onChange={() => {
                onChange(option);
              }}
            />
            <span>
              {t(
                option === "simple"
                  ? "settings.mode.simple"
                  : "settings.mode.pos",
              )}
            </span>
          </label>
        ))}
      </div>
      <p className="field__hint">
        {t(
          value === "simple"
            ? "settings.mode.simpleHint"
            : "settings.mode.posHint",
        )}
      </p>
      <p className="field__hint">{t("settings.mode.keep")}</p>
    </fieldset>
  );
}
