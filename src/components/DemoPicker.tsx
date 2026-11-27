// src/components/DemoPicker.tsx
import { useState } from "react";
import { useToast } from "../app/toast.ts";
import { useBeginTour } from "../app/useBeginTour.ts";
import type {
  DemoCatalogEntry,
  DemoMoment,
  DemoScenarioId,
} from "../demo/catalog.ts";
import { useT } from "../i18n/index.ts";
import { DemoLauncher } from "./DemoLauncher.tsx";
import { Sheet } from "./Sheet.tsx";

interface DemoPickerProps {
  open: boolean;
  busy: boolean;
  initial?: DemoScenarioId | undefined;
  onClose: () => void;
  onPick: (entry: DemoCatalogEntry, moment: DemoMoment | null) => void;
  onResume?: (() => void) | undefined;
}

export function DemoPicker({
  open,
  busy,
  initial,
  onClose,
  onPick,
  onResume,
}: DemoPickerProps) {
  const t = useT();
  const toast = useToast();
  const beginTour = useBeginTour();
  const [working, setWorking] = useState(false);
  const run = (action: () => Promise<void>) => {
    setWorking(true);
    action()
      .then(onClose)
      .catch(() => {
        toast.show(t("common.saveFailed"));
      })
      .finally(() => {
        setWorking(false);
      });
  };
  return (
    <Sheet open={open} title={t("demo.pick.title")} onClose={onClose}>
      <p className="field__hint">{t("demo.pick.intro")}</p>
      <DemoLauncher
        initial={initial}
        disabled={busy || working}
        onOpen={onPick}
        onTutorial={(entry) => {
          run(() => beginTour(entry, 0));
        }}
        onResume={onResume}
      />
    </Sheet>
  );
}
