// src/app/useOpenDemo.ts
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
import { useEnterApp } from "./useEnterApp.ts";

export interface OpenDemoOptions {
  quiet?: boolean;
  to?: string;
}

export function useOpenDemo(): (
  entry: DemoCatalogEntry,
  moment: DemoMoment | null,
  options?: OpenDemoOptions,
) => Promise<void> {
  const t = useT();
  const db = useDb();
  const toast = useToast();
  const enterApp = useEnterApp();
  const { date, time } = useLocalStamp();
  return async (entry, moment, options = {}) => {
    await loadDemo(
      db,
      demoStallDate(entry, date, time),
      entry.id,
      moment ?? undefined,
    );
    if (options.quiet !== true) {
      toast.show(t("settings.data.demoLoaded"));
    }
    void requestPersistentStorage(navigator.storage);
    await enterApp(
      options.to ?? (moment === null ? "/today" : DEMO_MOMENT_PATHS[moment]),
      { demoRun: Date.now() },
    );
  };
}
