// src/app/useEnterApp.ts
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { markEntered } from "./entry.ts";
import { preloadApp } from "./preloadApp.ts";

const EXIT_MS = 220;
const LEAVING = "is-leaving";
const PUBLIC_PAGE = ".site, .start";

function reducedMotion(): boolean {
  return (
    typeof window.matchMedia !== "function" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function useEnterApp(): (
  path: string,
  state?: { demoRun?: number },
) => Promise<void> {
  const navigate = useNavigate();
  return useCallback(
    async (path, state) => {
      markEntered();
      await preloadApp().catch(() => undefined);
      const root = document.documentElement;
      const fade =
        !reducedMotion() && document.querySelector(PUBLIC_PAGE) !== null;
      if (fade) {
        root.classList.add(LEAVING);
        await pause(EXIT_MS);
      }
      void navigate(path, state === undefined ? undefined : { state });
      if (fade) {
        window.requestAnimationFrame(() => {
          root.classList.remove(LEAVING);
        });
      }
    },
    [navigate],
  );
}
