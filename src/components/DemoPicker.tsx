// src/components/DemoPicker.tsx
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
  initial?: DemoScenarioId;
  onClose: () => void;
  onPick: (entry: DemoCatalogEntry, moment: DemoMoment | null) => void;
}

export function DemoPicker({
  open,
  busy,
  initial,
  onClose,
  onPick,
}: DemoPickerProps) {
  const t = useT();
  return (
    <Sheet open={open} title={t("demo.pick.title")} onClose={onClose}>
      <p className="field__hint">{t("demo.pick.intro")}</p>
      <DemoLauncher initial={initial} disabled={busy} onOpen={onPick} />
    </Sheet>
  );
}
