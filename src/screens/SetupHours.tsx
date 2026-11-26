// src/screens/SetupHours.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../app/toast.ts";
import { Button } from "../components/Button.tsx";
import { HoursEditor } from "../components/HoursEditor.tsx";
import { Screen } from "../components/Screen.tsx";
import { SetupProgress } from "../components/SetupProgress.tsx";
import { useDb, useStall } from "../db/hooks.ts";
import {
  completeSetup,
  hoursOf,
  requestPersistentStorage,
  saveHours,
  type Hours,
} from "../db/repositories.ts";
import { validateHours, type HoursErrors } from "../domain/setup.ts";
import { useT } from "../i18n/index.ts";

export function SetupHours() {
  const t = useT();
  const db = useDb();
  const toast = useToast();
  const navigate = useNavigate();
  const stall = useStall();
  const [draft, setDraft] = useState<Hours | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const hours = draft ?? (stall ? hoursOf(stall.settings) : null);
  const errors: HoursErrors =
    submitted && hours !== null
      ? validateHours(hours.openAt, hours.closeAt)
      : {};

  async function finish(value: Hours) {
    setSubmitted(true);
    setFailure(null);
    if (Object.keys(validateHours(value.openAt, value.closeAt)).length > 0) {
      return;
    }
    try {
      await saveHours(db, value);
    } catch {
      setFailure(t("common.saveFailed"));
      return;
    }
    try {
      await completeSetup(db);
    } catch {
      setFailure(t("setup.menus.needOne"));
      return;
    }
    toast.show(t("setup.done"));
    void requestPersistentStorage(navigator.storage);
    navigate("/today", { replace: true });
  }

  return (
    <Screen title={t("setup.hours.title")} showSettings={false} narrow>
      <SetupProgress step={2} />
      <p>{t("setup.hours.intro")}</p>
      {hours === null ? (
        <p role="status">{t("app.loading")}</p>
      ) : (
        <form
          className="form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void finish(hours);
          }}
        >
          <HoursEditor value={hours} errors={errors} onChange={setDraft} />
          {failure === null ? null : (
            <p className="form__failure" role="alert">
              {failure}
            </p>
          )}
          <div className="form__actions form__actions--page">
            <Button variant="secondary" to="/setup/menus">
              {t("common.back")}
            </Button>
            <Button type="submit">{t("setup.hours.finish")}</Button>
          </div>
        </form>
      )}
    </Screen>
  );
}
