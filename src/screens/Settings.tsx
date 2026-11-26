// src/screens/Settings.tsx
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLocalStamp } from "../app/clock.ts";
import { DEMO_ENABLED } from "../app/demoConfig.ts";
import { README_URL } from "../app/links.ts";
import { useToast } from "../app/toast.ts";
import { Button } from "../components/Button.tsx";
import { DemoPicker } from "../components/DemoPicker.tsx";
import { HoursEditor } from "../components/HoursEditor.tsx";
import { LanguageSwitch } from "../components/LanguageSwitch.tsx";
import { ModeSwitch } from "../components/ModeSwitch.tsx";
import { ExportImportPanel } from "../components/ExportImportPanel.tsx";
import { MenuManager } from "../components/MenuManager.tsx";
import { Screen } from "../components/Screen.tsx";
import { Sheet } from "../components/Sheet.tsx";
import { StorageStatus } from "../components/StorageStatus.tsx";
import { TextField } from "../components/TextField.tsx";
import { useDb, useStall } from "../db/hooks.ts";
import {
  DEFAULT_DEMO_SCENARIO,
  DEMO_CATALOG,
  demoStallDate,
  type DemoCatalogEntry,
} from "../demo/catalog.ts";
import {
  deleteAll,
  hoursOf,
  loadDemo,
  removeDemo,
  saveHours,
  saveStallName,
  setMode,
  STALL_NAME_MAX_LENGTH,
  type Hours,
} from "../db/repositories.ts";
import { modeOf } from "../domain/pos.ts";
import { validateHours, type HoursErrors } from "../domain/setup.ts";
import { useT } from "../i18n/index.ts";

type Confirm = "delete" | "removeDemo" | null;

export function Settings() {
  const t = useT();
  const db = useDb();
  const toast = useToast();
  const navigate = useNavigate();
  const stall = useStall();
  const { date, time } = useLocalStamp();
  const [name, setName] = useState<string | null>(null);
  const [hoursDraft, setHoursDraft] = useState<Hours | null>(null);
  const [hoursSubmitted, setHoursSubmitted] = useState(false);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [busy, setBusy] = useState(false);
  const [picking, setPicking] = useState(false);

  if (!stall) {
    return (
      <Screen title={t("settings.title")}>
        <p role="status">{t("app.loading")}</p>
      </Screen>
    );
  }

  const isDemo = stall.settings.isDemo;
  const nameValue = name ?? stall.name;
  const nameError =
    nameValue.trim().length > STALL_NAME_MAX_LENGTH
      ? t("settings.stall.nameError")
      : undefined;
  const hours = hoursDraft ?? hoursOf(stall.settings);
  const hoursErrors: HoursErrors = hoursSubmitted
    ? validateHours(hours.openAt, hours.closeAt)
    : {};

  function loadDemoEntry(entry: DemoCatalogEntry) {
    return attempt(
      () => loadDemo(db, demoStallDate(entry, date, time), entry.id),
      t("settings.data.demoLoaded"),
    );
  }

  async function attempt(action: () => Promise<void>, success: string) {
    try {
      await action();
      toast.show(success);
    } catch {
      toast.show(t("common.saveFailed"));
    }
  }

  function onSaveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (nameError !== undefined) {
      return;
    }
    void attempt(
      () => saveStallName(db, nameValue),
      t("settings.stall.nameSaved"),
    );
  }

  function onSaveHours(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHoursSubmitted(true);
    if (Object.keys(validateHours(hours.openAt, hours.closeAt)).length > 0) {
      return;
    }
    void attempt(async () => {
      await saveHours(db, hours);
      setHoursDraft(null);
      setHoursSubmitted(false);
    }, t("hours.saved"));
  }

  async function wipe(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
      setConfirm(null);
      navigate("/welcome", { replace: true });
    } catch {
      toast.show(t("common.saveFailed"));
      setBusy(false);
    }
  }

  return (
    <Screen title={t("settings.title")}>
      <section className="card settings-section" aria-labelledby="set-stall">
        <h2 id="set-stall">{t("settings.stall.title")}</h2>
        <form className="form form--inline" noValidate onSubmit={onSaveName}>
          <TextField
            label={t("settings.stall.name")}
            value={nameValue}
            onChange={setName}
            error={nameError}
            autoComplete="off"
          />
          <Button type="submit" variant="secondary">
            {t("common.save")}
          </Button>
        </form>
        <h3>{t("settings.menus.title")}</h3>
        <MenuManager showSalvage />
        <h3>{t("settings.hours.title")}</h3>
        <form className="form" noValidate onSubmit={onSaveHours}>
          <HoursEditor
            value={hours}
            errors={hoursErrors}
            onChange={setHoursDraft}
          />
          <Button type="submit" variant="secondary">
            {t("settings.hours.save")}
          </Button>
        </form>
      </section>

      <section className="card settings-section" aria-labelledby="set-mode">
        <h2 id="set-mode">{t("settings.mode.title")}</h2>
        <ModeSwitch
          value={modeOf(stall.settings)}
          onChange={(mode) => {
            setMode(db, mode).then(
              () => {
                toast.show(t("settings.mode.saved"));
              },
              () => {
                toast.show(t("common.saveFailed"));
              },
            );
          }}
        />
      </section>

      <section className="card settings-section" aria-labelledby="set-lang">
        <h2 id="set-lang">{t("settings.language.title")}</h2>
        <LanguageSwitch />
      </section>

      <section className="card settings-section" aria-labelledby="set-data">
        <h2 id="set-data">{t("settings.data.title")}</h2>
        <p>{t("settings.data.onDevice")}</p>
        <StorageStatus />
        <ExportImportPanel />
        <h3 className="transfer__head">{t("transfer.manage.title")}</h3>
        <div className="settings-actions">
          {isDemo ? (
            <>
              {DEMO_ENABLED ? (
                <>
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={() => {
                      const scenario =
                        stall.demo?.scenario ?? DEFAULT_DEMO_SCENARIO;
                      const entry = DEMO_CATALOG.find(
                        (item) => item.id === scenario,
                      );
                      if (entry !== undefined) {
                        void loadDemoEntry(entry);
                      }
                    }}
                  >
                    {t("settings.data.resetDemo")}
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={() => {
                      setPicking(true);
                    }}
                  >
                    {t("settings.data.switchDemo")}
                  </Button>
                  <DemoPicker
                    open={picking}
                    busy={busy}
                    onClose={() => {
                      setPicking(false);
                    }}
                    onPick={(entry) => {
                      setPicking(false);
                      void loadDemoEntry(entry);
                    }}
                  />
                </>
              ) : null}
              <Button
                variant="danger"
                onClick={() => {
                  setConfirm("removeDemo");
                }}
              >
                {t("settings.data.removeDemo")}
              </Button>
            </>
          ) : !DEMO_ENABLED ? null : (
            <>
              <Button
                variant="secondary"
                disabled
                aria-describedby="set-demo-blocked"
              >
                {t("settings.data.loadDemo")}
              </Button>
              <p id="set-demo-blocked" className="field__hint">
                {t("settings.data.loadDemoBlocked")}
              </p>
            </>
          )}
          <Button
            variant="danger"
            onClick={() => {
              setConfirm("delete");
            }}
          >
            {t("settings.data.deleteAll")}
          </Button>
        </div>
      </section>

      <section className="card settings-section" aria-labelledby="set-about">
        <h2 id="set-about">{t("settings.about.title")}</h2>
        <p>{t("settings.about.version", { version: __APP_VERSION__ })}</p>
        <p>{t("settings.about.body")}</p>
        <p>
          <Link className="link-target" to="/about">
            {t("settings.about.landing")}
          </Link>
        </p>
        <p>
          <Link className="link-target" to="/how">
            {t("settings.about.how")}
          </Link>
        </p>
        <a
          className="link-target"
          href={README_URL}
          target="_blank"
          rel="noreferrer"
        >
          {t("settings.about.link")}
        </a>
      </section>

      <Sheet
        open={confirm !== null}
        title={t(
          confirm === "removeDemo"
            ? "settings.removeDemo.title"
            : "settings.delete.title",
        )}
        onClose={() => {
          setConfirm(null);
        }}
      >
        <p>
          {t(
            confirm === "removeDemo"
              ? "settings.removeDemo.body"
              : "settings.delete.body",
          )}
        </p>
        <div className="form__actions">
          <Button
            variant="secondary"
            onClick={() => {
              setConfirm(null);
            }}
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="danger"
            disabled={busy}
            onClick={() => {
              void wipe(() =>
                confirm === "removeDemo" ? removeDemo(db) : deleteAll(db),
              );
            }}
          >
            {t(
              confirm === "removeDemo"
                ? "settings.removeDemo.confirm"
                : "settings.delete.confirm",
            )}
          </Button>
        </div>
      </Sheet>
    </Screen>
  );
}
