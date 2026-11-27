// src/app/useStartTour.ts
import { startTransition } from "react";
import { useStall } from "../db/hooks.ts";
import { DEFAULT_DEMO_SCENARIO, DEMO_CATALOG } from "../demo/catalog.ts";
import { useT } from "../i18n/index.ts";
import { useToast } from "./toast.ts";
import { useTour } from "./tour.ts";
import { useOpenDemo } from "./useOpenDemo.ts";

export function useStartTour(): () => void {
  const t = useT();
  const stall = useStall();
  const toast = useToast();
  const openDemo = useOpenDemo();
  const { goTo } = useTour();
  return () => {
    const scenario = stall?.demo?.scenario ?? DEFAULT_DEMO_SCENARIO;
    const entry = DEMO_CATALOG.find((item) => item.id === scenario);
    if (entry === undefined) {
      return;
    }
    openDemo(entry, "plan").then(
      () => {
        startTransition(() => {
          goTo(1);
        });
      },
      () => {
        toast.show(t("common.saveFailed"));
      },
    );
  };
}
