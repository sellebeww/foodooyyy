// src/db/schema.ts
import Dexie, { type EntityTable, type Table, type Transaction } from "dexie";
import type { DemoMoment, DemoScenarioId } from "../demo/catalog.ts";
import type {
  DayRecord,
  ISODate,
  Menu,
  MenuDay,
  Sale,
  StallSettings,
} from "../domain/types.ts";

export const DB_NAME = "foodoo";
export const STALL_ID = "stall";

export interface DemoMeta {
  scenario: DemoScenarioId;
  generatedFor: ISODate;
  moment?: DemoMoment;
}

export interface StallRow {
  id: typeof STALL_ID;
  name: string;
  settings: StallSettings;
  setupComplete: boolean;
  demo?: DemoMeta;
}

export type MenuDayKey = [string, string];

export type FoodooDb = Dexie & {
  stall: EntityTable<StallRow, "id">;
  menus: EntityTable<Menu, "id">;
  days: EntityTable<DayRecord, "date">;
  menuDays: Table<MenuDay, MenuDayKey>;
  sales: EntityTable<Sale, "id">;
};

export interface SchemaVersion {
  version: number;
  stores: Record<string, string | null>;
  upgrade?: (transaction: Transaction) => Promise<void> | void;
}

export const SCHEMA_VERSIONS: readonly SchemaVersion[] = [
  {
    version: 1,
    stores: {
      stall: "id",
      menus: "id",
      days: "date",
      menuDays: "[date+menuId], date, menuId",
    },
  },
  {
    version: 2,
    stores: {
      stall: "id",
      menus: "id",
      days: "date",
      menuDays: "[date+menuId], date, menuId",
      sales: "id, date, groupId",
    },
  },
];

export function createDb(
  name: string = DB_NAME,
  versions: readonly SchemaVersion[] = SCHEMA_VERSIONS,
): FoodooDb {
  const db = new Dexie(name) as FoodooDb;
  for (const entry of versions) {
    const version = db.version(entry.version).stores(entry.stores);
    if (entry.upgrade !== undefined) {
      version.upgrade(entry.upgrade);
    }
  }
  return db;
}
