// src/app/useScreenArrival.ts
import { useEffect } from "react";
import {
  NavigationType,
  useLocation,
  useNavigationType,
} from "react-router-dom";

let handledKey = "";

export function useScreenArrival(title: string, ready = true): void {
  const navigationType = useNavigationType();
  const location = useLocation();

  useEffect(() => {
    document.title = `${title} · FOODOO`;
  }, [title]);

  useEffect(() => {
    if (
      !ready ||
      navigationType !== NavigationType.Push ||
      handledKey === location.key
    ) {
      return;
    }
    handledKey = location.key;
    window.scrollTo({ top: 0, behavior: "instant" });
    document.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
  }, [ready, navigationType, location.key]);
}
