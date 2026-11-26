// src/app/viewTransition.ts
import { flushSync } from "react-dom";

type TransitionDocument = Document & {
  startViewTransition?: (update: () => void) => unknown;
};

export function runWithViewTransition(update: () => void): void {
  const doc: TransitionDocument = document;
  if (
    typeof doc.startViewTransition !== "function" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    update();
    return;
  }
  doc.startViewTransition(() => {
    flushSync(update);
  });
}
