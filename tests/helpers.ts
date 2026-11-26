// tests/helpers.ts
import type {
  DayRecord,
  Menu,
  MenuDay,
  StallSettings,
} from "../src/domain/types.ts";

export const referenceSettings: StallSettings = {
  openAt: "06:00",
  closeAt: "14:00",
  busyProfile: {
    "06": 1,
    "07": 4,
    "08": 4,
    "09": 2,
    "10": 2,
    "11": 4,
    "12": 4,
    "13": 2,
  },
  isDemo: false,
};

export function makeMenu(overrides: Partial<Menu> = {}): Menu {
  return {
    id: "nasi-uduk",
    name: "Nasi Uduk",
    price: 8000,
    cost: 4500,
    salvage: 0,
    usualQty: 40,
    archived: false,
    ...overrides,
  };
}

export function makeDay(
  date: string,
  weekday: number,
  overrides: Partial<DayRecord> = {},
): DayRecord {
  return { date, weekday, unusual: false, closed: true, ...overrides };
}

export function makeMenuDay(
  date: string,
  overrides: Partial<MenuDay> = {},
): MenuDay {
  return {
    date,
    menuId: "nasi-uduk",
    suggestedQty: null,
    reason: null,
    cookedQty: 40,
    soldOutAt: null,
    leftover: 0,
    estimatedDemand: 40,
    demandIsEstimate: false,
    ...overrides,
  };
}

export function dateOf(index: number): string {
  const day = String(index + 1).padStart(2, "0");
  return `2026-02-${day}`;
}
