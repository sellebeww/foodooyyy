// src/app/useCaseView.ts
import { useMemo } from "react";
import { useHistory, useMenus, useStall } from "../db/hooks.ts";
import { DEMO_CASES, caseFacts, type CaseFacts } from "../demo/cases.ts";
import {
  DEFAULT_DEMO_SCENARIO,
  DEMO_CATALOG,
  type DemoCatalogEntry,
} from "../demo/catalog.ts";
import { caseParams } from "../i18n/caseText.ts";
import { useT, type MessageParams } from "../i18n/index.ts";
import { useStallStamp } from "./useStallStamp.ts";

export interface CaseView {
  entry: DemoCatalogEntry;
  stallName: string;
  facts: CaseFacts | null;
  params: MessageParams;
}

// undefined while the stall is loading, null when the stored stall is not a
// demo stall (the guide never touches an owner's own stall).
export function useCaseView(): CaseView | null | undefined {
  const t = useT();
  const stall = useStall();
  const menus = useMenus();
  const history = useHistory();
  const { weekday } = useStallStamp();

  return useMemo(() => {
    if (stall === undefined || menus === undefined || history === undefined) {
      return undefined;
    }
    if (stall === null || !stall.settings.isDemo) {
      return null;
    }
    const scenario = stall.demo?.scenario ?? DEFAULT_DEMO_SCENARIO;
    const entry = DEMO_CATALOG.find((item) => item.id === scenario);
    if (entry === undefined) {
      return null;
    }
    const facts = caseFacts(DEMO_CASES[scenario], menus, history, weekday);
    return {
      entry,
      stallName: stall.name,
      facts,
      params:
        facts === null ? {} : caseParams(t, facts, stall.settings, weekday),
    };
  }, [t, stall, menus, history, weekday]);
}
