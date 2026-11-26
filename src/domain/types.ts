// src/domain/types.ts
export type HHMM = string;
export type ISODate = string;
export type BusyLevel = 1 | 2 | 4;

export interface Menu {
  id: string;
  name: string;
  price: number;
  cost: number;
  salvage: number;
  usualQty: number;
  archived: boolean;
}

export type SalesMode = "simple" | "pos";
export type SoldOutSource = "manual" | "auto_pos" | "unknown_time";
export type PayMethod = "cash" | "qris";

export interface StallSettings {
  openAt: HHMM;
  closeAt: HHMM;
  busyProfile: Record<string, BusyLevel>;
  isDemo: boolean;
  mode?: SalesMode;
}

export interface Sale {
  id: string;
  date: ISODate;
  time: HHMM;
  createdAt: number;
  groupId: string;
  menuId: string;
  qty: number;
  unitPrice: number;
  method: PayMethod;
}

export interface DayRecord {
  date: ISODate;
  weekday: number;
  unusual: boolean;
  closed: boolean;
}

export type ReasonCode =
  "cold-start" | "cold-start-up" | "cold-start-down" | "history";

export type ReasonScope = "weekday" | "recent";

export interface Reason {
  code: ReasonCode;
  scope: ReasonScope;
  observations: number;
  soldOutDays: number;
  leftoverDays: number;
  delta: number;
}

export interface MenuDay {
  date: ISODate;
  menuId: string;
  suggestedQty: number | null;
  reason: Reason | null;
  cookedQty: number;
  soldOutAt: HHMM | null;
  soldOutSource?: SoldOutSource;
  leftover: number | null;
  estimatedDemand: number | null;
  demandIsEstimate: boolean;
}

export interface Suggestion {
  menuId: string;
  qty: number;
  reason: Reason;
}

export interface DemandEstimate {
  demand: number;
  isEstimate: boolean;
}
