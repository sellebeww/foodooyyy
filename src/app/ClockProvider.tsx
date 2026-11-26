// src/app/ClockProvider.tsx
import { useMemo, type ReactNode } from "react";
import { ClockContext } from "./clock.ts";

interface ClockProviderProps {
  now?: () => Date;
  children: ReactNode;
}

function systemNow(): Date {
  return new Date();
}

export function ClockProvider({
  now = systemNow,
  children,
}: ClockProviderProps) {
  const value = useMemo(() => ({ now }), [now]);
  return (
    <ClockContext.Provider value={value}>{children}</ClockContext.Provider>
  );
}
