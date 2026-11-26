// src/components/HoursEditor.tsx
import type { Hours } from "../db/repositories.ts";
import {
  profileHours,
  resizeProfile,
  type HoursErrors,
  type HoursField,
} from "../domain/setup.ts";
import { useT } from "../i18n/index.ts";
import { BusyHourStrip } from "./BusyHourStrip.tsx";
import { TimeInput } from "./TimeInput.tsx";

interface HoursEditorProps {
  value: Hours;
  errors: HoursErrors;
  onChange: (value: Hours) => void;
}

export function HoursEditor({ value, errors, onChange }: HoursEditorProps) {
  const t = useT();
  const hours = profileHours(value.openAt, value.closeAt);
  const overnight = hours.length > 0 && value.closeAt < value.openAt;

  function setTime(field: HoursField, time: string) {
    const next = { ...value, [field]: time };
    const valid = profileHours(next.openAt, next.closeAt).length > 0;
    onChange({
      ...next,
      busyProfile: valid
        ? resizeProfile(value.busyProfile, next.openAt, next.closeAt)
        : value.busyProfile,
    });
  }

  function message(field: HoursField): string | undefined {
    const code = errors[field];
    return code === undefined ? undefined : t(`hours.error.${code}`);
  }

  return (
    <div className="hours-editor">
      <div className="form__row">
        <TimeInput
          label={t("hours.open")}
          value={value.openAt}
          onChange={(time) => {
            setTime("openAt", time);
          }}
          error={message("openAt")}
        />
        <TimeInput
          label={t("hours.close")}
          value={value.closeAt}
          onChange={(time) => {
            setTime("closeAt", time);
          }}
          error={message("closeAt")}
        />
      </div>
      {overnight ? <p className="field__hint">{t("hours.overnight")}</p> : null}
      <BusyHourStrip
        hours={hours}
        profile={value.busyProfile}
        onChange={(busyProfile) => {
          onChange({ ...value, busyProfile });
        }}
      />
    </div>
  );
}
