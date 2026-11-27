// src/app/launcher.ts
import { createContext, useContext } from "react";

export interface LauncherValue {
  open: () => void;
}

export const LauncherContext = createContext<LauncherValue>({
  open: () => undefined,
});

export function useLauncher(): LauncherValue {
  return useContext(LauncherContext);
}
