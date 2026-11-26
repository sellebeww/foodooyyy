// src/components/DemoPicker.tsx
import { DEMO_CATALOG, type DemoCatalogEntry } from "../demo/catalog.ts";
import { useT } from "../i18n/index.ts";
import { Sheet } from "./Sheet.tsx";

interface DemoPickerProps {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onPick: (entry: DemoCatalogEntry) => void;
}

export function DemoPicker({ open, busy, onClose, onPick }: DemoPickerProps) {
  const t = useT();
  return (
    <Sheet open={open} title={t("demo.pick.title")} onClose={onClose}>
      <p className="field__hint">{t("demo.pick.intro")}</p>
      <ul className="demo-picker">
        {DEMO_CATALOG.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              className="demo-option"
              disabled={busy}
              onClick={() => {
                onPick(entry);
              }}
            >
              <span className="demo-option__name">{entry.stallName}</span>
              <span className="demo-option__meta">
                {t("demo.pick.hours", {
                  open: entry.openAt,
                  close: entry.closeAt,
                })}
                {" · "}
                {t("demo.pick.history", { days: entry.historyDays })}
              </span>
              <span className="demo-option__desc">
                {t(`demo.s${entry.id}.desc`)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
