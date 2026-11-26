// tests/domain/pos.test.ts
import { describe, expect, it } from "vitest";
import {
  cartTotal,
  changeDue,
  dayRevenue,
  engineSold,
  groupSales,
  isValidLine,
  leftoverGap,
  markSoldOut,
  modeOf,
  overPlanQty,
  remainingQty,
  salesRevenue,
  soldQty,
} from "../../src/domain/pos.ts";
import type { Sale } from "../../src/domain/types.ts";
import { makeMenu, makeMenuDay, referenceSettings } from "../helpers.ts";

function sale(overrides: Partial<Sale>): Sale {
  return {
    id: crypto.randomUUID(),
    date: "2026-03-02",
    time: "08:00",
    createdAt: 1,
    groupId: "g1",
    menuId: "nasi-uduk",
    qty: 1,
    unitPrice: 8000,
    method: "cash",
    ...overrides,
  };
}

describe("pos domain", () => {
  const row = makeMenuDay("2026-03-02", { cookedQty: 10 });

  it("defaults to simple mode", () => {
    expect(modeOf(referenceSettings)).toBe("simple");
    expect(modeOf({ mode: "pos" })).toBe("pos");
  });

  it("computes remaining and over-plan quantities", () => {
    const sales = [sale({ qty: 4 }), sale({ qty: 9, groupId: "g2" })];
    expect(soldQty(sales, "nasi-uduk")).toBe(13);
    expect(remainingQty(row, sales)).toBe(0);
    expect(overPlanQty(row, sales)).toBe(3);
    expect(remainingQty(row, [sale({ qty: 4 })])).toBe(6);
    expect(overPlanQty(row, [sale({ qty: 4 })])).toBe(0);
  });

  it("totals a cart and the change due", () => {
    const menus = [makeMenu(), makeMenu({ id: "b", price: 5000 })];
    const total = cartTotal(
      [
        { menuId: "nasi-uduk", qty: 2 },
        { menuId: "b", qty: 3 },
        { menuId: "gone", qty: 5 },
      ],
      menus,
    );
    expect(total).toBe(31_000);
    expect(changeDue(total, 50_000)).toBe(19_000);
    expect(changeDue(total, 20_000)).toBe(-11_000);
  });

  it("validates cart lines", () => {
    expect(isValidLine({ menuId: "a", qty: 1 })).toBe(true);
    expect(isValidLine({ menuId: "a", qty: 0 })).toBe(false);
    expect(isValidLine({ menuId: "a", qty: 1.5 })).toBe(false);
    expect(isValidLine({ menuId: "a", qty: 1000 })).toBe(false);
  });

  it("groups sales newest first with totals", () => {
    const groups = groupSales([
      sale({ groupId: "old", createdAt: 1, qty: 1 }),
      sale({ groupId: "new", createdAt: 5, qty: 2 }),
      sale({
        groupId: "new",
        createdAt: 5,
        menuId: "b",
        qty: 1,
        unitPrice: 5000,
      }),
    ]);
    expect(groups.map((group) => group.groupId)).toEqual(["new", "old"]);
    expect(groups[0]?.total).toBe(21_000);
    expect(groups[0]?.lines).toHaveLength(2);
  });

  it("takes revenue from sales in pos mode and from sold x price in simple mode", () => {
    const closed = makeMenuDay("2026-03-02", { cookedQty: 10, leftover: 4 });
    const menus = [makeMenu()];
    expect(engineSold(closed)).toBe(6);
    expect(dayRevenue("simple", [closed], menus, [])).toBe(48_000);
    expect(dayRevenue("pos", [closed], menus, [sale({ qty: 3 })])).toBe(24_000);
    expect(
      salesRevenue([sale({ qty: 2 }), sale({ qty: 1, unitPrice: 100 })]),
    ).toBe(16_100);
  });

  it("treats a missing leftover and an unknown menu as zero", () => {
    const open = makeMenuDay("2026-03-02", { cookedQty: 10, leftover: null });
    expect(engineSold(open)).toBe(10);
    expect(dayRevenue("simple", [open], [], [])).toBe(0);
  });

  it("marks and clears a sell-out with its source", () => {
    const marked = markSoldOut(row, "10:30", "auto_pos");
    expect(marked).toMatchObject({
      soldOutAt: "10:30",
      soldOutSource: "auto_pos",
    });
    const cleared = markSoldOut(marked, null, "manual");
    expect(cleared.soldOutAt).toBeNull();
    expect("soldOutSource" in cleared).toBe(false);
  });

  it("reports the neutral gap between entered and remaining", () => {
    expect(leftoverGap(3, 5)).toBe(-2);
    expect(leftoverGap(5, 5)).toBe(0);
  });
});
