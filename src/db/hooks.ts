// src/db/hooks.ts
import { useLiveQuery } from "dexie-react-hooks";
import { createContext, useContext } from "react";
import type { ISODate, Menu, Sale } from "../domain/types.ts";
import {
  getHistory,
  getStall,
  getTodayState,
  listMenus,
  listSales,
  type History,
  type TodayState,
} from "./repositories.ts";
import type { FoodooDb, StallRow } from "./schema.ts";

export const DbContext = createContext<FoodooDb | null>(null);

export function useDb(): FoodooDb {
  const db = useContext(DbContext);
  if (db === null) {
    throw new Error("useDb must be used inside DbProvider");
  }
  return db;
}

export function useStall(): StallRow | null | undefined {
  const db = useDb();
  return useLiveQuery(() => getStall(db), [db]);
}

export function useMenus(): Menu[] | undefined {
  const db = useDb();
  return useLiveQuery(() => listMenus(db), [db]);
}

export function useHistory(): History | undefined {
  const db = useDb();
  return useLiveQuery(() => getHistory(db), [db]);
}

export function useTodayState(date: ISODate): TodayState | undefined {
  const db = useDb();
  return useLiveQuery(() => getTodayState(db, date), [db, date]);
}

export function useSales(date: ISODate): Sale[] | undefined {
  const db = useDb();
  return useLiveQuery(() => listSales(db, date), [db, date]);
}
