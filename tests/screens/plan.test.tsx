// tests/screens/plan.test.tsx
import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getHistory,
  listMenus,
  loadDemo,
  savePlan,
  setSoldOut,
} from "../../src/db/repositories.ts";
import type { FoodooDb } from "../../src/db/schema.ts";
import { suggestQty } from "../../src/domain/suggest.ts";
import { t } from "../../src/i18n/index.ts";
import { renderReason } from "../../src/i18n/reason.ts";
import { renderApp } from "../app/renderApp.tsx";
import { makeTestDb } from "../db/testDb.ts";

vi.mock("../../src/app/registerPwa.ts", () => ({
  registerPwa: () => undefined,
}));

const TODAY = "2026-03-02";
const MONDAY = 1;
let db: FoodooDb;

beforeEach(async () => {
  db = makeTestDb();
  await loadDemo(db, TODAY);
});

afterEach(async () => {
  cleanup();
  await db.delete();
});

async function expectedSuggestions() {
  const [menus, history] = await Promise.all([listMenus(db), getHistory(db)]);
  return menus.map((menu) => ({
    menu,
    suggestion: suggestQty(menu, MONDAY, history.menuDays, history.days),
  }));
}

function portionsInput(name: string): HTMLInputElement {
  return screen.getByLabelText(`Portions of ${name}`);
}

describe("Plan", () => {
  it("PL-1: shows one card per active menu with the number and reason from suggestQty", async () => {
    renderApp({ db, path: "/plan" });
    await screen.findByLabelText("Portions of Nasi Uduk");
    const expected = await expectedSuggestions();
    expect(expected).toHaveLength(4);
    for (const { menu, suggestion } of expected) {
      expect(portionsInput(menu.name).value).toBe(String(suggestion.qty));
      expect(
        screen.getByText(
          renderReason(t, suggestion.reason, {
            weekday: MONDAY,
            usualQty: menu.usualQty,
          }),
        ),
      ).toBeTruthy();
    }
    expect(screen.getByText("Demo data")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Accept all" })).toBeTruthy();
  });

  it("PL-2: steppers change the quantity by one and stay within 0 to 999", async () => {
    renderApp({ db, path: "/plan" });
    const input = await screen.findByLabelText("Portions of Ayam Goreng");
    const start = Number((input as HTMLInputElement).value);
    fireEvent.click(
      screen.getByRole("button", { name: "One more Ayam Goreng" }),
    );
    expect(portionsInput("Ayam Goreng").value).toBe(String(start + 1));
    fireEvent.click(
      screen.getByRole("button", { name: "One less Ayam Goreng" }),
    );
    expect(portionsInput("Ayam Goreng").value).toBe(String(start));
    fireEvent.change(input, { target: { value: "5000" } });
    expect(portionsInput("Ayam Goreng").value).toBe("5000");
    fireEvent.blur(input);
    expect(portionsInput("Ayam Goreng").value).toBe("999");
    const more = screen.getByRole("button", { name: "One more Ayam Goreng" });
    expect((more as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(input, { target: { value: "0" } });
    const less = screen.getByRole("button", { name: "One less Ayam Goreng" });
    expect((less as HTMLButtonElement).disabled).toBe(true);
  });

  it("PL-3: Accept all saves every suggestion with one tap", async () => {
    renderApp({ db, path: "/plan" });
    fireEvent.click(await screen.findByRole("button", { name: "Accept all" }));
    expect(await screen.findByText("Plan saved")).toBeTruthy();
    const rows = await db.menuDays.where("date").equals(TODAY).toArray();
    expect(rows).toHaveLength(4);
    for (const row of rows) {
      expect(row.cookedQty).toBe(row.suggestedQty);
      expect(row.reason).not.toBeNull();
    }
    expect(
      await screen.findByRole("heading", { level: 1, name: "Today" }),
    ).toBeTruthy();
  });

  it("PL-4: an edited card is marked and both quantities are stored", async () => {
    renderApp({ db, path: "/plan" });
    const input = await screen.findByLabelText("Portions of Nasi Uduk");
    const suggested = Number((input as HTMLInputElement).value);
    fireEvent.change(input, { target: { value: String(suggested + 3) } });
    expect(screen.getByText("Edited")).toBeTruthy();
    expect(screen.getByText(`Suggested ${suggested}`)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Save plan" }));
    expect(await screen.findByText("Plan saved")).toBeTruthy();
    expect(await db.menuDays.get([TODAY, "nasi-uduk"])).toMatchObject({
      suggestedQty: suggested,
      cookedQty: suggested + 3,
    });
  });

  it("PL-5: the saved plan can be edited until the first sell-out, then it is locked", async () => {
    const expected = await expectedSuggestions();
    await savePlan(
      db,
      TODAY,
      expected.map(({ menu, suggestion }) => ({
        menuId: menu.id,
        suggestedQty: suggestion.qty,
        reason: suggestion.reason,
        cookedQty: suggestion.qty,
      })),
    );
    const view = renderApp({ db, path: "/plan" });
    expect(
      await screen.findByText(
        "Plan saved. You can still change it until the first menu sells out.",
      ),
    ).toBeTruthy();
    expect(portionsInput("Nasi Uduk")).toBeTruthy();
    view.unmount();

    await setSoldOut(db, TODAY, "nasi-uduk", "10:30");
    renderApp({ db, path: "/plan" });
    expect(
      await screen.findByText(/The plan is locked because a menu has sold out/),
    ).toBeTruthy();
    expect(screen.queryByLabelText("Portions of Nasi Uduk")).toBeNull();
    expect(screen.queryByRole("button", { name: "Accept all" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Save plan" })).toBeNull();
  });
});
