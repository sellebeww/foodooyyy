// src/app/tour.ts
import { createContext, useContext } from "react";

export const TOUR_STORAGE_KEY = "foodoo.tour";
export const TOUR_DONE = "done";

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
