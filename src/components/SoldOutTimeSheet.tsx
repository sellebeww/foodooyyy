// src/components/SoldOutTimeSheet.tsx
import { useState, type FormEvent } from "react";
import { validateSoldOutTime } from "../domain/close.ts";
import type { HHMM, StallSettings } from "../domain/types.ts";
import { useT } from "../i18n/index.ts";
import { Button } from "./Button.tsx";
import { Sheet } from "./Sheet.tsx";
import { TimeInput } from "./TimeInput.tsx";

interface SoldOutTimeSheetProps {
  menuName: string;
  initial: HHMM;
  settings: Pick<StallSettings, "openAt" | "closeAt">;
  onSave: (time: HHMM) => void;
  onClear?: () => void;
  onClose: () => void;
}

export function SoldOutTimeSheet({
  menuName,
  initial,
  settings,
  onSave,
  onClear,
  onClose,
}: SoldOutTimeSheetProps) {
  const t = useT();
  const [time, setTime] = useState(initial);
  const [submitted, setSubmitted] = useState(false);
  const error = submitted ? validateSoldOutTime(time, settings) : null;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (validateSoldOutTime(time, settings) === null) {
      onSave(time);
    }
  }

  return (
    <Sheet
      open
      title={t("soldOut.sheetTitle", { name: menuName })}
      onClose={onClose}
    >
      <form className="form" noValidate onSubmit={onSubmit}>
        <TimeInput
          label={t("soldOut.timeLabel")}
          value={time}
          onChange={setTime}
          error={
            error === null
              ? undefined
              : t(`soldOut.error.${error}`, {
                  open: settings.openAt,
                  close: settings.closeAt,
                })
          }
        />
        <div className="form__actions">
          {onClear === undefined ? null : (
            <Button variant="secondary" onClick={onClear}>
              {t("soldOut.clear")}
            </Button>
          )}
          <Button type="submit">{t("common.save")}</Button>
        </div>
      </form>
    </Sheet>
  );
}
