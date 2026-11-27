// src/screens/Start.tsx
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { DEMO_ENABLED } from "../app/demoConfig.ts";
import { useOpenDemo } from "../app/useOpenDemo.ts";
import { useScreenArrival } from "../app/useScreenArrival.ts";
import { AppIcon } from "../components/AppIcon.tsx";
import { Button } from "../components/Button.tsx";
import { DemoPicker } from "../components/DemoPicker.tsx";
import { ExportImportPanel } from "../components/ExportImportPanel.tsx";
import { HeroLoop } from "../components/HeroLoop.tsx";
import { ArrowIcon } from "../components/icons/ArrowIcon.tsx";
import { LanguageSwitch } from "../components/LanguageSwitch.tsx";
import { OfflinePill } from "../components/OfflinePill.tsx";
import { Splash } from "../components/Splash.tsx";
import { useDb, useStall } from "../db/hooks.ts";
import { startSetup } from "../db/repositories.ts";
import type { DemoCatalogEntry, DemoMoment } from "../demo/catalog.ts";
import { useT } from "../i18n/index.ts";

export function Start() {
  const t = useT();
  const db = useDb();
  const navigate = useNavigate();
  const stall = useStall();
  const openDemo = useOpenDemo();
  const [busy, setBusy] = useState(false);
  const [picking, setPicking] = useState(false);
  const [failed, setFailed] = useState(false);

  useScreenArrival(t("start.title"), stall !== undefined);

  if (stall === undefined) {
    return <Splash />;
  }
  if (stall?.setupComplete === true && !busy) {
    return <Navigate to="/today" replace />;
  }
  const started = stall !== null;

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setFailed(false);
    try {
      await action();
    } catch {
      setFailed(true);
      setBusy(false);
    }
  }

  function setUp() {
    void run(async () => {
      await startSetup(db);
      navigate("/setup/menus");
    });
  }

  function pickDemo(entry: DemoCatalogEntry, moment: DemoMoment | null) {
    setPicking(false);
    void run(() => openDemo(entry, moment));
  }

  return (
    <div className="hero start">
      <HeroLoop />
      <header className="start__top">
        <Link className="start__back" to="/">
          {t("settings.about.landing")}
        </Link>
        <LanguageSwitch compact />
      </header>
      <main id="main" className="start__main" tabIndex={-1}>
        <AppIcon size={72} />
        <h1 className="start__title" tabIndex={-1}>
          {t("start.title")}
        </h1>
        <p className="hero__lead">{t("start.lead")}</p>
        <div className="landing__actions start__actions">
          <Button disabled={busy} icon={<ArrowIcon />} onClick={setUp}>
            {t(started ? "welcome.continue" : "welcome.start")}
          </Button>
          {DEMO_ENABLED ? (
            <Button
              variant="secondary"
              disabled={busy || started}
              aria-describedby="start-demo-note"
              onClick={() => {
                setPicking(true);
              }}
            >
              {t("welcome.demo")}
            </Button>
          ) : null}
          <ExportImportPanel compact />
          {DEMO_ENABLED ? (
            <>
              <p id="start-demo-note" className="field__hint">
                {t(started ? "welcome.demoBlocked" : "welcome.demoNote")}
              </p>
              <DemoPicker
                open={picking}
                busy={busy}
                onClose={() => {
                  setPicking(false);
                }}
                onPick={pickDemo}
              />
            </>
          ) : null}
          {failed ? (
            <p className="form__failure" role="alert">
              {t("common.saveFailed")}
            </p>
          ) : null}
        </div>
        <OfflinePill />
      </main>
    </div>
  );
}
