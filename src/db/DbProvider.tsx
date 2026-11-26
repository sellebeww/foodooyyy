// src/db/DbProvider.tsx
import type { ReactNode } from "react";
import { DbContext } from "./hooks.ts";
import type { FoodooDb } from "./schema.ts";

interface DbProviderProps {
  db: FoodooDb;
  children: ReactNode;
}

export function DbProvider({ db, children }: DbProviderProps) {
  return <DbContext.Provider value={db}>{children}</DbContext.Provider>;
}
