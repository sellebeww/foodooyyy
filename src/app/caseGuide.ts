// src/app/caseGuide.ts
import { createContext, useContext } from "react";

export const CASE_STORAGE_KEY = "foodoo.case";
export const CASE_ON = "on";

export interface CaseGuideValue {
  active: boolean;
  start: () => void;
  stop: () => void;
}

export const CaseGuideContext = createContext<CaseGuideValue>({
  active: false,
  start: () => undefined,
  stop: () => undefined,
});

export function useCaseGuide(): CaseGuideValue {
  return useContext(CaseGuideContext);
}
