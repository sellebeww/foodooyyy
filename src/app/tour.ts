// src/app/tour.ts
import { createContext, useContext } from "react";

export interface TourValue {
  step: number | null;
  goTo: (step: number) => void;
  finish: () => void;
}

export const TourContext = createContext<TourValue>({
  step: null,
  goTo: () => undefined,
  finish: () => undefined,
});

export function useTour(): TourValue {
  return useContext(TourContext);
}
