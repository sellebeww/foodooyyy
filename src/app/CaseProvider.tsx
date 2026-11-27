// src/app/CaseProvider.tsx
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { CASE_ON, CASE_STORAGE_KEY, CaseGuideContext } from "./caseGuide.ts";

interface CaseProviderProps {
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

function readActive(storage: Storage | undefined): boolean {
  try {
    return storage?.getItem(CASE_STORAGE_KEY) === CASE_ON;
  } catch {
    return false;
  }
}

export function CaseProvider({
  storage = defaultStorage(),
  children,
}: CaseProviderProps) {
  const [active, setActive] = useState(() => readActive(storage));

  const start = useCallback(() => {
    try {
      storage?.setItem(CASE_STORAGE_KEY, CASE_ON);
    } catch {
      // The guide still works for this visit when storage is blocked.
    }
    setActive(true);
  }, [storage]);

  const stop = useCallback(() => {
    try {
      storage?.removeItem(CASE_STORAGE_KEY);
    } catch {
      // Nothing to undo when storage is blocked.
    }
    setActive(false);
  }, [storage]);

  const value = useMemo(() => ({ active, start, stop }), [active, start, stop]);

  return (
    <CaseGuideContext.Provider value={value}>
      {children}
    </CaseGuideContext.Provider>
  );
}
