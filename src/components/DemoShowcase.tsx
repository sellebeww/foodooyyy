// src/components/DemoShowcase.tsx
import { DEMO_CATALOG, type DemoCatalogEntry } from "../demo/catalog.ts";
import { useT } from "../i18n/index.ts";
import { Button } from "./Button.tsx";
import { ArrowIcon } from "./icons/ArrowIcon.tsx";

interface DemoShowcaseProps {
  disabled: boolean;
  onPick: (entry: DemoCatalogEntry) => void;
}

export function DemoShowcase({ disabled, onPick }: DemoShowcaseProps) {
  const t = useT();
  return (
    <ul className="showcase">
      {DEMO_CATALOG.map((entry) => (
        <li key={entry.id} className="showcase__card">
          <p className="showcase__hours num">
            {entry.openAt}–{entry.closeAt}
          </p>
          <h3>{entry.stallName}</h3>
          <p className="showcase__desc">{t(`demo.s${entry.id}.desc`)}</p>
          <p className="showcase__meta">
            {t("demo.pick.history", { days: entry.historyDays })}
          </p>
          <Button
            variant="secondary"
            disabled={disabled}
            aria-label={t("landing.demoOpenLabel", { name: entry.stallName })}
            icon={<ArrowIcon />}
            onClick={() => {
              onPick(entry);
            }}
          >
            {t("landing.demoOpen")}
          </Button>
        </li>
      ))}
    </ul>
  );
}
