// src/app/useStartCase.ts
import type { DemoCatalogEntry } from "../demo/catalog.ts";
import { useCaseGuide } from "./caseGuide.ts";
import { useOpenDemo } from "./useOpenDemo.ts";

export function useStartCase(): (entry: DemoCatalogEntry) => Promise<void> {
  const openDemo = useOpenDemo();
  const { start } = useCaseGuide();
  return async (entry) => {
    await openDemo(entry, "plan", { quiet: true, to: "/case" });
    start();
  };
}
