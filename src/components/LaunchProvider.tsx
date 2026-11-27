// src/components/LaunchProvider.tsx
import { useMemo, useState, type ReactNode } from "react";
import { LauncherContext } from "../app/launcher.ts";
import { useToast } from "../app/toast.ts";
import { useEnterApp } from "../app/useEnterApp.ts";
import { useOpenDemo } from "../app/useOpenDemo.ts";
import { useStall } from "../db/hooks.ts";
import { useT } from "../i18n/index.ts";
import { DemoPicker } from "./DemoPicker.tsx";

// Owns the one demo chooser that every "Launch Demo App" button opens.
export function LaunchProvider({ children }: { children: ReactNode }) {
  const t = useT();
  const toast = useToast();
  const stall = useStall();
  const openDemo = useOpenDemo();
  const enterApp = useEnterApp();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const value = useMemo(() => ({ open: () => setOpen(true) }), []);
  const resumable = stall?.settings.isDemo === true && stall.setupComplete;

  return (
    <LauncherContext.Provider value={value}>
      {children}
      <DemoPicker
        open={open}
        busy={busy}
        initial={stall?.demo?.scenario}
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
        onResume={
          resumable
            ? () => {
                setBusy(true);
                enterApp("/today")
                  .then(() => {
                    setOpen(false);
                  })
                  .catch(() => {
                    toast.show(t("common.saveFailed"));
                  })
                  .finally(() => {
                    setBusy(false);
                  });
              }
            : undefined
        }
      />
    </LauncherContext.Provider>
  );
}
