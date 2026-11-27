// src/app/useStartTour.ts
import { useStall } from "../db/hooks.ts";
import { DEFAULT_DEMO_SCENARIO, DEMO_CATALOG } from "../demo/catalog.ts";
import { useT } from "../i18n/index.ts";
import { useToast } from "./toast.ts";
import { useBeginTour } from "./useBeginTour.ts";

export function useStartTour(): () => void {
  const t = useT();
  const stall = useStall();
  const toast = useToast();
  const begin = useBeginTour();
  return () => {
    const scenario = stall?.demo?.scenario ?? DEFAULT_DEMO_SCENARIO;
    const entry = DEMO_CATALOG.find((item) => item.id === scenario);
    if (entry === undefined) {
      return;
    }
    begin(entry, 1).catch(() => {
      toast.show(t("common.saveFailed"));
    });
  };
}
