// src/app/viewTransition.ts
import { flushSync } from "react-dom";

type TransitionDocument = Document & {
  startViewTransition?: (update: () => void) => unknown;
};

export function runWithViewTransition(update: () => void): void {
  const doc: TransitionDocument = document;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (typeof doc.startViewTransition !== "function" || reduced) {
    update();
    return;
  }
  doc.startViewTransition(() => {
    flushSync(update);
  });
}
