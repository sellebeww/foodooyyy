// src/app/useOpenDemo.ts
import { useNavigate } from "react-router-dom";
import { useDb } from "../db/hooks.ts";
import { loadDemo, requestPersistentStorage } from "../db/repositories.ts";
import {
  DEMO_MOMENT_PATHS,
  demoStallDate,
  type DemoCatalogEntry,
  type DemoMoment,
} from "../demo/catalog.ts";
import { useT } from "../i18n/index.ts";
import { useLocalStamp } from "./clock.ts";
import { useToast } from "./toast.ts";

export function useOpenDemo(): (
  entry: DemoCatalogEntry,
  moment: DemoMoment | null,
) => Promise<void> {
  const t = useT();
  const db = useDb();
  const toast = useToast();
  const navigate = useNavigate();
  const { date, time } = useLocalStamp();
  return async (entry, moment) => {
    await loadDemo(
      db,
      demoStallDate(entry, date, time),
      entry.id,
      moment ?? undefined,
    );
    toast.show(t("settings.data.demoLoaded"));
    void requestPersistentStorage(navigator.storage);
    navigate(moment === null ? "/today" : DEMO_MOMENT_PATHS[moment], {
      state: { demoRun: Date.now() },
    });
  };
}
