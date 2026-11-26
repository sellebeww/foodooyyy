// tests/screens/features.test.tsx
import {
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  listMenus,
  loadDemo,
  savePlan,
  setSoldOut,
} from "../../src/db/repositories.ts";
import type { FoodooDb } from "../../src/db/schema.ts";
import { planMoney } from "../../src/domain/money.ts";
import { formatRupiah } from "../../src/i18n/format.ts";
import { renderApp } from "../app/renderApp.tsx";
import { makeTestDb } from "../db/testDb.ts";

vi.mock("../../src/app/registerPwa.ts", () => ({
  registerPwa: () => undefined,
}));

const TODAY = "2026-03-02";
const LIST =
  "Warung Demo · Monday 2 March\nAyam Goreng: 28\nNasi Uduk: 42\nTotal 70 portions";
let db: FoodooDb;

beforeEach(async () => {
  db = makeTestDb();
  await loadDemo(db, TODAY);
});

afterEach(async () => {
  cleanup();
  Reflect.deleteProperty(navigator, "share");
  Reflect.deleteProperty(navigator, "clipboard");
  await db.delete();
});

async function plan() {
  await savePlan(db, TODAY, [
    { menuId: "nasi-uduk", suggestedQty: 42, reason: null, cookedQty: 42 },
    { menuId: "ayam-goreng", suggestedQty: 28, reason: null, cookedQty: 28 },
  ]);
}

function stub(name: "share" | "clipboard", value: unknown) {
  Object.defineProperty(navigator, name, { configurable: true, value });
}

async function pressShare() {
  fireEvent.click(await screen.findByRole("button", { name: "Share list" }));
}

describe("MN-1 plan money", () => {
  it("shows cooking cost and possible sales for the numbers on screen", async () => {
    renderApp({ db, path: "/plan" });
    const input = await screen.findByLabelText("Portions of Nasi Uduk");
    fireEvent.change(input, { target: { value: "10" } });
    const menus = await listMenus(db);
    const money = planMoney(
      menus.map((menu) => ({
        menu,
        qty: Number(
          screen.getByLabelText<HTMLInputElement>(`Portions of ${menu.name}`)
            .value,
        ),
      })),
    );
    expect(
      screen.getByText(`Cooking cost ${formatRupiah(money.cost)}`),
    ).toBeTruthy();
    expect(
      screen.getByText(`If all sell ${formatRupiah(money.revenue)}`),
    ).toBeTruthy();
  });
});

describe("SH-1 share the cooking list", () => {
  it("lists today's menus with their state", async () => {
    await plan();
    await setSoldOut(db, TODAY, "nasi-uduk", "10:30");
    renderApp({ db, path: "/today" });
    const list = await screen.findByRole("region", { name: "Today's menus" });
    expect(within(list).getByText("Sold out 10:30")).toBeTruthy();
    expect(within(list).getByText("Available")).toBeTruthy();
  });

  it("hands the list to the share sheet", async () => {
    await plan();
    const share = vi.fn().mockResolvedValue(undefined);
    stub("share", share);
    renderApp({ db, path: "/today" });
    await pressShare();
    expect(share).toHaveBeenCalledWith({ text: LIST });
  });

  it("copies the list when there is no share sheet", async () => {
    await plan();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stub("clipboard", { writeText });
    renderApp({ db, path: "/today" });
    await pressShare();
    expect(await screen.findByText("Cooking list copied")).toBeTruthy();
    expect(writeText).toHaveBeenCalledWith(LIST);
  });

  it("says so when sharing fails, and stays quiet when cancelled", async () => {
    await plan();
    const cancelled = Object.assign(new Error("no"), { name: "AbortError" });
    const share = vi
      .fn()
      .mockRejectedValueOnce(cancelled)
      .mockRejectedValueOnce(new Error("boom"));
    stub("share", share);
    renderApp({ db, path: "/today" });
    await pressShare();
    await Promise.resolve();
    const failure = "Could not share the list. Please try again.";
    expect(screen.queryByText(failure)).toBeNull();
    await pressShare();
    expect(await screen.findByText(failure)).toBeTruthy();
  });
});

describe("NV progress and navigation", () => {
  it("marks the current step in the navigation", async () => {
    renderApp({ db, path: "/today" });
    await screen.findByRole("heading", { level: 1, name: "Today" });
    await waitFor(() => {
      expect(
        screen.getAllByRole("link", {
          name: "Plan",
          description: "Current step of the day",
        }),
      ).toHaveLength(2);
    });
    expect(
      screen.queryAllByRole("link", {
        name: "Close",
        description: "Current step of the day",
      }),
    ).toHaveLength(0);
  });

  it("counts sold-out menus during service and ready menus at close", async () => {
    await plan();
    await setSoldOut(db, TODAY, "nasi-uduk", "10:30");
    renderApp({ db, path: "/service" });
    expect(await screen.findByText("1 of 2 menus sold out")).toBeTruthy();
    cleanup();
    renderApp({ db, path: "/close" });
    expect(await screen.findByText("1 of 2 menus ready")).toBeTruthy();
    fireEvent.change(
      screen.getByLabelText("Leftover portions of Ayam Goreng"),
      { target: { value: "3" } },
    );
    expect(screen.getByText("2 of 2 menus ready")).toBeTruthy();
  });

  it("links to every settings section", async () => {
    renderApp({ db, path: "/settings" });
    const nav = await screen.findByRole("navigation", {
      name: "Settings sections",
    });
    for (const link of within(nav).getAllByRole("link")) {
      const id = link.getAttribute("href")?.slice(1) ?? "";
      expect(document.getElementById(id)).not.toBeNull();
    }
  });
});
