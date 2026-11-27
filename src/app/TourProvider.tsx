// src/app/TourProvider.tsx
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { TourContext } from "./tour.ts";

interface TourProviderProps {
  children: ReactNode;
}

export function TourProvider({ children }: TourProviderProps) {
  const [step, setStep] = useState<number | null>(null);

  const finish = useCallback(() => {
    setStep(null);
  }, []);

  const value = useMemo(
    () => ({ step, goTo: setStep, finish }),
    [step, finish],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}
