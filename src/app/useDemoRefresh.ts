// src/app/useDemoRefresh.ts
import { useEffect } from "react";
import { useDb, useStall } from "../db/hooks.ts";
import { refreshDemo } from "../db/repositories.ts";
import { useT } from "../i18n/index.ts";
import { DEMO_ENABLED } from "./demoConfig.ts";
import { useToast } from "./toast.ts";
import { useStallStamp } from "./useStallStamp.ts";

export function useDemoRefresh(): void {
  const db = useDb();
  const stall = useStall();
  const { date } = useStallStamp();
  const toast = useToast();
  const t = useT();
  const generatedFor = stall?.settings.isDemo
    ? stall.demo?.generatedFor
    : undefined;

  useEffect(() => {
    if (!DEMO_ENABLED || generatedFor === undefined || generatedFor === date) {
      return undefined;
    }
    let active = true;
    refreshDemo(db, date).then(
      (changed) => {
        if (changed && active) {
          toast.show(t("demo.refreshed"));
        }
      },
      () => undefined,
    );
    return () => {
      active = false;
    };
  }, [db, date, generatedFor, toast, t]);
}
