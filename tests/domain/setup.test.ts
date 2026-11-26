// tests/domain/setup.test.ts
import { describe, expect, it } from "vitest";
import {
  nextBusyLevel,
  profileHours,
  resizeProfile,
  validateHours,
  validateMenu,
  type MenuInput,
} from "../../src/domain/setup.ts";

function menu(overrides: Partial<MenuInput> = {}): MenuInput {
  return {
    name: "Nasi Uduk",
    price: 8000,
    cost: 4500,
    salvage: 0,
    usualQty: 40,
    ...overrides,
  };
}

describe("validateMenu", () => {
  it("accepts a valid menu", () => {
    expect(validateMenu(menu())).toEqual({});
  });

  it("requires a name of 1 to 40 characters after trimming", () => {
    expect(validateMenu(menu({ name: "   " })).name).toBe("nameLength");
    expect(validateMenu(menu({ name: "x".repeat(41) })).name).toBe(
      "nameLength",
    );
    expect(validateMenu(menu({ name: "x".repeat(40) })).name).toBeUndefined();
  });

  it("requires a whole price above zero", () => {
    expect(validateMenu(menu({ price: 0 })).price).toBe("priceInvalid");
    expect(validateMenu(menu({ price: 10.5 })).price).toBe("priceInvalid");
    expect(validateMenu(menu({ price: Number.NaN })).price).toBe(
      "priceInvalid",
    );
  });

  it("blocks a cost that is not lower than the price", () => {
    expect(validateMenu(menu({ cost: 8000 })).cost).toBe("costNotBelowPrice");
    expect(validateMenu(menu({ cost: 9000 })).cost).toBe("costNotBelowPrice");
    expect(validateMenu(menu({ cost: 0 })).cost).toBeUndefined();
  });

  it("rejects a negative or fractional cost", () => {
    expect(validateMenu(menu({ cost: -1 })).cost).toBe("costInvalid");
    expect(validateMenu(menu({ cost: 1.5 })).cost).toBe("costInvalid");
  });

  it("skips the price comparison when the price itself is invalid", () => {
    const errors = validateMenu(menu({ price: 0, cost: 10, salvage: 10 }));
    expect(errors.cost).toBeUndefined();
    expect(errors.salvage).toBeUndefined();
  });

  it("requires a salvage value from zero to below the price", () => {
    expect(validateMenu(menu({ salvage: -1 })).salvage).toBe("salvageInvalid");
    expect(validateMenu(menu({ salvage: 8000 })).salvage).toBe(
      "salvageNotBelowPrice",
    );
    expect(validateMenu(menu({ salvage: 1000 })).salvage).toBeUndefined();
  });

  it("requires usual portions from 1 to 999", () => {
    expect(validateMenu(menu({ usualQty: 0 })).usualQty).toBe("usualInvalid");
    expect(validateMenu(menu({ usualQty: 1000 })).usualQty).toBe(
      "usualInvalid",
    );
    expect(validateMenu(menu({ usualQty: 999 })).usualQty).toBeUndefined();
  });
});

describe("validateHours", () => {
  it("accepts closing after opening on the same day", () => {
    expect(validateHours("06:00", "14:00")).toEqual({});
  });

  it("accepts closing after midnight", () => {
    expect(validateHours("18:00", "02:00")).toEqual({});
  });

  it("blocks closing at the opening time", () => {
    expect(validateHours("06:00", "06:00")).toEqual({
      closeAt: "closeSameAsOpen",
    });
  });

  it("flags times that are not HH:MM", () => {
    expect(validateHours("", "25:00")).toEqual({
      openAt: "timeInvalid",
      closeAt: "timeInvalid",
    });
    expect(validateHours("", "10:00")).toEqual({ openAt: "timeInvalid" });
  });
});

describe("profileHours and resizeProfile", () => {
  it("lists one hour slot per opening hour", () => {
    expect(profileHours("06:00", "14:00")).toEqual([
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
      "13",
    ]);
    expect(profileHours("06:30", "08:15")).toEqual(["06", "07", "08"]);
  });

  it("lists the hours across midnight in opening order", () => {
    expect(profileHours("18:00", "02:00")).toEqual([
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
      "00",
      "01",
    ]);
    expect(profileHours("06:30", "06:15")).toHaveLength(24);
  });

  it("returns no slots for invalid hours", () => {
    expect(profileHours("10:00", "10:00")).toEqual([]);
    expect(profileHours("x", "09:00")).toEqual([]);
  });

  it("keeps existing levels, defaults new hours to normal and drops the rest", () => {
    expect(
      resizeProfile({ "06": 1, "07": 4, "15": 4 }, "07:00", "10:00"),
    ).toEqual({ "07": 4, "08": 2, "09": 2 });
  });
});

describe("nextBusyLevel", () => {
  it("cycles quiet, normal, busy", () => {
    expect(nextBusyLevel(1)).toBe(2);
    expect(nextBusyLevel(2)).toBe(4);
    expect(nextBusyLevel(4)).toBe(1);
  });
});
