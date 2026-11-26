// src/app/TourProvider.tsx
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { TOUR_DONE, TOUR_STORAGE_KEY, TourContext } from "./tour.ts";

interface TourProviderProps {
  storage?: Storage | undefined;
  children: ReactNode;
}

function defaultStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function isDone(storage: Storage | undefined): boolean {
  try {
    return storage?.getItem(TOUR_STORAGE_KEY) === TOUR_DONE;
  } catch {
    return false;
  }
}

export function TourProvider({
  storage = defaultStorage(),
  children,
}: TourProviderProps) {
  const [step, setStep] = useState<number | null>(() =>
    isDone(storage) ? null : 0,
  );

  const finish = useCallback(() => {
    try {
      storage?.setItem(TOUR_STORAGE_KEY, TOUR_DONE);
    } finally {
      setStep(null);
    }
  }, [storage]);

  const value = useMemo(
    () => ({ step, goTo: setStep, finish }),
    [step, finish],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}
