// tests/domain/plan.test.ts
import { describe, expect, it } from "vitest";
import {
  clampQty,
  isCooked,
  isPlanLocked,
  isPlanQty,
  suggestAll,
} from "../../src/domain/plan.ts";
import { suggestQty } from "../../src/domain/suggest.ts";
import { makeDay, makeMenu, makeMenuDay } from "../helpers.ts";

describe("isPlanQty", () => {
  it("accepts whole numbers from 0 to 999 only", () => {
    expect(isPlanQty(0)).toBe(true);
    expect(isPlanQty(999)).toBe(true);
    expect(isPlanQty(-1)).toBe(false);
    expect(isPlanQty(1000)).toBe(false);
    expect(isPlanQty(4.5)).toBe(false);
    expect(isPlanQty(Number.NaN)).toBe(false);
  });
});

describe("clampQty", () => {
  it("rounds and keeps the value inside the range", () => {
    expect(clampQty(-3, 0, 999)).toBe(0);
    expect(clampQty(1200, 0, 999)).toBe(999);
    expect(clampQty(41.6, 0, 999)).toBe(42);
  });
});

describe("suggestAll", () => {
  it("returns suggestQty for every active menu and skips archived ones", () => {
    const active = makeMenu();
    const archived = makeMenu({ id: "old", name: "Old", archived: true });
    const menuDays = [makeMenuDay("2026-02-23", { estimatedDemand: 50 })];
    const days = [makeDay("2026-02-23", 1)];
    expect(suggestAll([active, archived], 1, menuDays, days)).toEqual([
      suggestQty(active, 1, menuDays, days),
    ]);
  });
});

describe("plan state", () => {
  it("treats only rows with portions as cooked", () => {
    expect(isCooked(makeMenuDay("2026-03-02", { cookedQty: 1 }))).toBe(true);
    expect(isCooked(makeMenuDay("2026-03-02", { cookedQty: 0 }))).toBe(false);
  });

  it("locks the plan while any menu is marked sold out", () => {
    expect(isPlanLocked([])).toBe(false);
    expect(isPlanLocked([makeMenuDay("2026-03-02")])).toBe(false);
    expect(
      isPlanLocked([
        makeMenuDay("2026-03-02"),
        makeMenuDay("2026-03-02", { menuId: "b", soldOutAt: "10:30" }),
      ]),
    ).toBe(true);
  });
});
