// src/app/useEntryActions.ts
import { useState } from "react";
import { useStall } from "../db/hooks.ts";
import type { MessageKey } from "../i18n/index.ts";
import { DEMO_ENABLED } from "./demoConfig.ts";
import { useEnterApp } from "./useEnterApp.ts";
import { useLauncher } from "./launcher.ts";

export interface EntryAction {
  label: MessageKey;
  run: () => void;
}

export interface EntryActions {
  primary: EntryAction;
  secondary: EntryAction | null;
  note: MessageKey | null;
  busy: boolean;
  failed: boolean;
}

export function useEntryActions(): EntryActions {
  const stall = useStall();
  const enterApp = useEnterApp();
  const launcher = useLauncher();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  function guarded(action: () => Promise<void>): () => void {
    return () => {
      setBusy(true);
      setFailed(false);
      action().catch(() => {
        setFailed(true);
        setBusy(false);
      });
    };
  }

  const go = (path: string) => guarded(() => enterApp(path));
  const isDemo = stall?.settings.isDemo === true;

  if (stall === undefined) {
    return {
      primary: { label: "landing.nav.openApp", run: () => undefined },
      secondary: null,
      note: null,
      busy: true,
      failed: false,
    };
  }

  const base = { busy, failed };

  if (stall?.setupComplete === true) {
    return isDemo && DEMO_ENABLED
      ? {
          ...base,
          primary: { label: "landing.cta.launch", run: launcher.open },
          secondary: null,
          note: "landing.cta.note",
        }
      : {
          ...base,
          primary: { label: "landing.cta.continue", run: go("/today") },
          secondary: null,
          note: null,
        };
  }
  if (stall !== undefined && stall !== null) {
    return {
      ...base,
      primary: { label: "welcome.continue", run: go("/start") },
      secondary: null,
      note: null,
    };
  }
  if (!DEMO_ENABLED) {
    return {
      ...base,
      primary: { label: "landing.nav.openApp", run: go("/start") },
      secondary: null,
      note: null,
    };
  }
  return {
    ...base,
    primary: { label: "landing.cta.launch", run: launcher.open },
    secondary: { label: "landing.cta.setup", run: go("/start") },
    note: "landing.cta.note",
  };
}
