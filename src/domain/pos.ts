// src/domain/pos.ts
import type {
  HHMM,
  Menu,
  MenuDay,
  PayMethod,
  Sale,
  SalesMode,
  SoldOutSource,
} from "./types.ts";

export const CASH_CHIPS: readonly number[] = [20_000, 50_000, 100_000];
export const SALE_QTY_MAX = 999;
export const CORRECTION_DAYS = 7;

export interface CartLine {
  menuId: string;
  qty: number;
}

export interface SaleGroup {
  groupId: string;
  time: string;
  createdAt: number;
  method: PayMethod;
  lines: { menuId: string; qty: number; unitPrice: number }[];
  total: number;
}

export function modeOf(settings: { mode?: SalesMode }): SalesMode {
  return settings.mode ?? "simple";
}

export function soldQty(sales: readonly Sale[], menuId: string): number {
  return sales
    .filter((sale) => sale.menuId === menuId)
    .reduce((sum, sale) => sum + sale.qty, 0);
}

export function remainingQty(row: MenuDay, sales: readonly Sale[]): number {
  return Math.max(0, row.cookedQty - soldQty(sales, row.menuId));
}

export function overPlanQty(row: MenuDay, sales: readonly Sale[]): number {
  return Math.max(0, soldQty(sales, row.menuId) - row.cookedQty);
}

export function cartTotal(
  lines: readonly CartLine[],
  menus: readonly Menu[],
): number {
  const prices = new Map(menus.map((menu) => [menu.id, menu.price]));
  return lines.reduce(
    (sum, line) => sum + line.qty * (prices.get(line.menuId) ?? 0),
    0,
  );
}

export function changeDue(total: number, tendered: number): number {
  return tendered - total;
}

export function isValidLine(line: CartLine): boolean {
  return (
    Number.isSafeInteger(line.qty) && line.qty >= 1 && line.qty <= SALE_QTY_MAX
  );
}

export function groupSales(sales: readonly Sale[]): SaleGroup[] {
  const groups = new Map<string, SaleGroup>();
  for (const sale of sales) {
    const group = groups.get(sale.groupId) ?? {
      groupId: sale.groupId,
      time: sale.time,
      createdAt: sale.createdAt,
      method: sale.method,
      lines: [],
      total: 0,
    };
    group.lines.push({
      menuId: sale.menuId,
      qty: sale.qty,
      unitPrice: sale.unitPrice,
    });
    group.total += sale.qty * sale.unitPrice;
    groups.set(sale.groupId, group);
  }
  return [...groups.values()].sort((a, b) => b.createdAt - a.createdAt);
}

export function salesRevenue(sales: readonly Sale[]): number {
  return sales.reduce((sum, sale) => sum + sale.qty * sale.unitPrice, 0);
}

export function engineSold(row: MenuDay): number {
  return row.cookedQty - (row.leftover ?? 0);
}

export function dayRevenue(
  mode: SalesMode,
  rows: readonly MenuDay[],
  menus: readonly Menu[],
  sales: readonly Sale[],
): number {
  if (mode === "pos") {
    return salesRevenue(sales);
  }
  const prices = new Map(menus.map((menu) => [menu.id, menu.price]));
  return rows.reduce(
    (sum, row) => sum + engineSold(row) * (prices.get(row.menuId) ?? 0),
    0,
  );
}

export function markSoldOut(
  row: MenuDay,
  time: HHMM | null,
  source: SoldOutSource,
): MenuDay {
  const next: MenuDay = { ...row, soldOutAt: time };
  if (time === null) {
    delete next.soldOutSource;
  } else {
    next.soldOutSource = source;
  }
  return next;
}

export function leftoverGap(entered: number, remaining: number): number {
  return entered - remaining;
}
