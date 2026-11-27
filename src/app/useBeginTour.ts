// src/app/useBeginTour.ts
import { startTransition } from "react";
import type { DemoCatalogEntry } from "../demo/catalog.ts";
import { useTour } from "./tour.ts";
import { useOpenDemo } from "./useOpenDemo.ts";

// Loads the demo stall at the morning plan, then shows the tutorial at the
// given step (0 is the welcome card, 1 the first highlighted step). The
// tutorial always opens when it is asked for; nothing remembers an earlier
// dismissal.
export function useBeginTour(): (
  entry: DemoCatalogEntry,
  at: 0 | 1,
) => Promise<void> {
  const openDemo = useOpenDemo();
  const { goTo } = useTour();
  return async (entry, at) => {
    await openDemo(
      entry,
      "plan",
      at === 0 ? { quiet: true, to: "/today" } : { quiet: true },
    );
    startTransition(() => {
      goTo(at);
    });
  };
}
