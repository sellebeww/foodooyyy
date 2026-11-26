// tests/screens/register.test.tsx
import {
  act,
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UNDO_MS } from "../../src/app/toast.ts";
import { CLOCK_TICK_MS } from "../../src/app/clock.ts";
import { recordSale } from "../../src/db/repositories.ts";
import type { FoodooDb } from "../../src/db/schema.ts";
import { renderApp } from "../app/renderApp.tsx";
import { freshStall, planDay } from "../db/pos.helpers.ts";
import { makeTestDb } from "../db/testDb.ts";

vi.mock("../../src/app/registerPwa.ts", () => ({
  registerPwa: () => undefined,
}));

const DAY = "2026-03-02";
const AT_9 = new Date(2026, 2, 2, 9, 0);
let db: FoodooDb;
let ids: string[];

beforeEach(async () => {
  db = makeTestDb();
  ids = await freshStall(db, "pos");
  await planDay(db, DAY, ids, 10);
});

afterEach(async () => {
  cleanup();
  vi.useRealTimers();
  await db.delete();
});

function tile(name: string): HTMLElement {
  const button = screen.getByText(name).closest("button");
  if (button === null) {
    throw new Error(`No tile for ${name}`);
  }
  return button;
}

describe("Register", () => {
  it("RG-1: shows a tile per planned menu with remaining stock and a stock bar", async () => {
    renderApp({ db, path: "/service", at: AT_9 });
    expect(await screen.findByText("Menu 1")).toBeTruthy();
    expect(within(tile("Menu 1")).getByText("10 left")).toBeTruthy();
    expect(
      screen.getByRole("img", { name: "Stock of Menu 1: 10 of 10 left" }),
    ).toBeTruthy();
    expect(
      screen.getAllByRole("link", { name: "Sales" }).length,
    ).toBeGreaterThan(0);
  });

  it("RG-2, RG-3: builds a cart, shows change from a cash chip and saves one transaction", async () => {
    renderApp({ db, path: "/service", at: AT_9 });
    await screen.findByText("Menu 1");
    fireEvent.click(tile("Menu 1"));
    fireEvent.click(tile("Menu 1"));
    fireEvent.click(tile("Menu 2"));
    fireEvent.click(
      screen.getByRole("button", { name: "Cart: 3 items, Rp 25.000" }),
    );
    const dialog = await screen.findByRole("dialog", { name: "Cart" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Rp 50.000" }));
    expect(within(dialog).getByText("Change: Rp 25.000")).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Rp 20.000" }));
    expect(within(dialog).getByText("Short by Rp 5.000")).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Exact" }));
    expect(within(dialog).getByText("Change: Rp 0")).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "QRIS" }));
    expect(within(dialog).queryByLabelText("Cash received")).toBeNull();
    fireEvent.click(within(dialog).getByRole("button", { name: "Save sale" }));
    expect(await screen.findByText("Sale saved: Rp 25.000")).toBeTruthy();
    const rows = await db.sales.toArray();
    expect(rows).toHaveLength(2);
    expect(new Set(rows.map((row) => row.groupId)).size).toBe(1);
    expect(rows.every((row) => row.method === "qris")).toBe(true);
    await waitFor(() => {
      expect(within(tile("Menu 1")).getByText("8 left")).toBeTruthy();
    });
    expect(
      await screen.findByText("Rp 25.000", { selector: "dd" }),
    ).toBeTruthy();
  });

  it("SO-1, SO-2: sells out automatically with a toast, and voiding cancels the mark", async () => {
    renderApp({ db, path: "/service", at: AT_9 });
    await screen.findByText("Menu 1");
    fireEvent.click(tile("Menu 1"));
    fireEvent.click(
      screen.getByRole("button", { name: "Cart: 1 items, Rp 8.000" }),
    );
    const dialog = await screen.findByRole("dialog", { name: "Cart" });
    fireEvent.change(within(dialog).getByLabelText("Menu 1"), {
      target: { value: "10" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save sale" }));
    expect(await screen.findByText("Menu 1 sold out at 09:00")).toBeTruthy();
    expect(await screen.findByText("Sold out 09:00")).toBeTruthy();
    expect((await db.menuDays.get([DAY, ids[0]!]))?.soldOutSource).toBe(
      "auto_pos",
    );

    fireEvent.click(screen.getByRole("button", { name: "Void last sale" }));
    const confirm = await screen.findByRole("dialog", {
      name: "Void the last sale?",
    });
    fireEvent.click(within(confirm).getByRole("button", { name: "Void sale" }));
    expect(
      await screen.findByText("Sale voided. Menu 1 is available again."),
    ).toBeTruthy();
    await waitFor(async () => {
      expect((await db.menuDays.get([DAY, ids[0]!]))?.soldOutAt).toBeNull();
    });
    expect(await db.sales.count()).toBe(0);
    expect(await screen.findByText("No sales yet today.")).toBeTruthy();
  });

  it("SO-3: the Sold out button marks manually and Undo lasts 10 seconds", async () => {
    renderApp({ db, path: "/service", at: AT_9 });
    await screen.findByText("Menu 2");
    fireEvent.click(
      screen.getByRole("button", { name: "Mark Menu 2 as sold out" }),
    );
    expect(await screen.findByText("Menu 2 sold out at 09:00")).toBeTruthy();
    expect((await db.menuDays.get([DAY, ids[1]!]))?.soldOutSource).toBe(
      "manual",
    );
    expect(UNDO_MS).toBe(10_000);
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    await waitFor(async () => {
      expect((await db.menuDays.get([DAY, ids[1]!]))?.soldOutAt).toBeNull();
    });
  });

  it("RG-5: shows sales beyond the plan as over plan", async () => {
    await recordSale(
      db,
      DAY,
      "10:30",
      1,
      [{ menuId: ids[0]!, qty: 10 }],
      "cash",
    );
    await recordSale(
      db,
      DAY,
      "11:00",
      2,
      [{ menuId: ids[0]!, qty: 3 }],
      "cash",
    );
    renderApp({ db, path: "/service", at: AT_9 });
    expect(await screen.findByText("3 over plan")).toBeTruthy();
    expect(within(tile("Menu 1")).getByText("Sold out 10:30")).toBeTruthy();
    expect(screen.getByText("2", { selector: "dd" })).toBeTruthy();
  });

  it("clears the cart when the day changes mid-session", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    let current = new Date(2026, 2, 2, 23, 58);
    renderApp({ db, path: "/service", now: () => new Date(current.getTime()) });
    await screen.findByText("Menu 1");
    fireEvent.click(tile("Menu 1"));
    expect(
      screen.getByRole("button", { name: "Cart: 1 items, Rp 8.000" }),
    ).toBeTruthy();
    current = new Date(2026, 2, 3, 0, 1);
    act(() => {
      vi.advanceTimersByTime(CLOCK_TICK_MS);
    });
    expect(
      await screen.findByText("The day changed. The cart was cleared."),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^Cart:/ })).toBeNull();
    expect(await screen.findByText("Plan today first")).toBeTruthy();
    expect(await db.sales.count()).toBe(0);
  });

  it("records nothing when the date rolls over between opening the cart and paying", async () => {
    let current = new Date(2026, 2, 2, 23, 59);
    renderApp({ db, path: "/service", now: () => new Date(current.getTime()) });
    await screen.findByText("Menu 1");
    fireEvent.click(tile("Menu 1"));
    fireEvent.click(
      screen.getByRole("button", { name: "Cart: 1 items, Rp 8.000" }),
    );
    const dialog = await screen.findByRole("dialog", { name: "Cart" });
    current = new Date(2026, 2, 3, 0, 1);
    fireEvent.click(within(dialog).getByRole("button", { name: "Save sale" }));
    expect(
      await screen.findByText("The sale was not saved. Nothing was recorded."),
    ).toBeTruthy();
    expect(await db.sales.count()).toBe(0);
  });

  it("simple mode keeps the one-tap service screen and needs no sale rows", async () => {
    const simple = makeTestDb();
    const simpleIds = await freshStall(simple, "simple");
    await planDay(simple, DAY, simpleIds, 10);
    renderApp({ db: simple, path: "/service", at: AT_9 });
    expect(await screen.findAllByText("Tap when sold out")).toHaveLength(2);
    expect(screen.queryByRole("button", { name: /^Cart:/ })).toBeNull();
    expect(await simple.sales.count()).toBe(0);
    cleanup();
    await simple.delete();
  });
});
