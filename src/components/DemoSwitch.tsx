// src/components/DemoSwitch.tsx
import { useState } from "react";
import { DEMO_ENABLED } from "../app/demoConfig.ts";
import { demoTimeOf } from "../app/demoTime.ts";
import { useToast } from "../app/toast.ts";
import { useOpenDemo } from "../app/useOpenDemo.ts";
import { useStall } from "../db/hooks.ts";
import { useT } from "../i18n/index.ts";
import { DemoPicker } from "./DemoPicker.tsx";
import { Sticker } from "./Sticker.tsx";

export function DemoSwitch() {
  const t = useT();
  const toast = useToast();
  const stall = useStall();
  const openDemo = useOpenDemo();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  if (stall?.settings.isDemo !== true) {
    return null;
  }
  const time = demoTimeOf(stall);
  const sticker = (
    <Sticker>
      <span>{t("header.demo")}</span>
      {time === null ? null : (
        <span className="num">
          <span className="visually-hidden">{t("header.demoTime")} </span>
          {time}
        </span>
      )}
    </Sticker>
  );
  if (!DEMO_ENABLED) {
    return sticker;
  }
  return (
    <>
      <button
        type="button"
        className="demo-switch"
        aria-haspopup="dialog"
        onClick={() => {
          setOpen(true);
        }}
      >
        {sticker}
        <span className="visually-hidden"> {t("header.demoSwitch")}</span>
      </button>
      <DemoPicker
        open={open}
        busy={busy}
        initial={stall.demo?.scenario}
        onClose={() => {
          setOpen(false);
        }}
        onPick={(entry, moment) => {
          setBusy(true);
          openDemo(entry, moment)
            .then(() => {
              setOpen(false);
            })
            .catch(() => {
              toast.show(t("common.saveFailed"));
            })
            .finally(() => {
              setBusy(false);
            });
        }}
      />
    </>
  );
}
