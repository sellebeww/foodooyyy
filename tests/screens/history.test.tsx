// tests/screens/history.test.tsx
import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getHistory, loadDemo } from "../../src/db/repositories.ts";
import type { FoodooDb } from "../../src/db/schema.ts";
import { menuSeries, menuTotals, pastDays } from "../../src/domain/metrics.ts";
import { renderApp } from "../app/renderApp.tsx";
import { makeTestDb } from "../db/testDb.ts";
import { makeDay, makeMenu, makeMenuDay } from "../helpers.ts";

vi.mock("../../src/app/registerPwa.ts", () => ({
  registerPwa: () => undefined,
}));

const TODAY = "2026-03-02";
let db: FoodooDb;

beforeEach(() => {
  db = makeTestDb();
});

afterEach(async () => {
  cleanup();
  await db.delete();
});

describe("History", () => {
  it("is reachable from Today and the navigation", async () => {
    await loadDemo(db, TODAY);
    renderApp({ db, path: "/today" });
    fireEvent.click(
      await screen.findByRole("link", {
        name: "See history",
      }),
    );
    expect(
      await screen.findByRole("heading", { level: 1, name: "History" }),
    ).toBeTruthy();
    expect(screen.getAllByRole("link", { name: "History" }).length).toBe(2);
  });

  it("WS-2: shows a per-menu table from stored data with demand labelled estimate", async () => {
    await loadDemo(db, TODAY);
    const history = await getHistory(db);
    const totals = menuTotals(history.menuDays, history.days, TODAY);
    renderApp({ db, path: "/history" });
    const table = await screen.findByRole("region", {
      name: "Per menu, last 7 days",
    });
    const nasi = totals["nasi-uduk"];
    expect(nasi).toBeDefined();
    const row = within(table).getByRole("row", { name: /Nasi Uduk/ });
    const cells = within(row).getAllByRole("cell");
    expect(cells.map((cell) => cell.textContent)).toEqual([
      String(nasi?.cooked),
      String(nasi?.sold),
      String(nasi?.leftover),
      nasi?.demandHasEstimate === true
        ? `≈ ${nasi.demand}estimate`
        : String(nasi?.demand),
    ]);
    expect(
      within(table).getByText(/Demand on sold-out days is an estimate/),
    ).toBeTruthy();
  });

  it("WS-3: draws cooked and demand bars for the selected menu", async () => {
    await loadDemo(db, TODAY);
    const history = await getHistory(db);
    renderApp({ db, path: "/history" });
    const chart = await screen.findByRole("region", {
      name: "Cooked vs demand",
    });
    fireEvent.click(within(chart).getByLabelText("Ayam Goreng"));
    const series = menuSeries(
      history.menuDays,
      history.days,
      "ayam-goreng",
      TODAY,
    );
    expect(series.length).toBeGreaterThan(0);
    expect(
      within(chart).getByRole("img", {
        name: "Cooked and demand per day for Ayam Goreng, last 7 days",
      }),
    ).toBeTruthy();
    expect(chart.querySelectorAll(".bars__bar--cooked").length).toBe(
      series.length,
    );
    const first = series[0];
    expect(
      chart.querySelector(".bars__bar--cooked .bars__value")?.textContent,
    ).toBe(String(first?.cooked));
    expect(
      within(chart).getByText("Cooked", { selector: "span" }),
    ).toBeTruthy();
    expect(
      within(chart).getByText("Demand (estimate, sold-out day)"),
    ).toBeTruthy();
  });

  it("lists past days newest first, pages them, and opens a day", async () => {
    await loadDemo(db, TODAY);
    const history = await getHistory(db);
    const total = pastDays(history.days, history.menuDays, TODAY).length;
    renderApp({ db, path: "/history" });
    const list = await screen.findByRole("region", { name: "Past days" });
    expect(within(list).getAllByRole("listitem").length).toBe(
      Math.min(14, total),
    );
    fireEvent.click(
      within(list).getByRole("button", { name: "Show more days" }),
    );
    expect(within(list).getAllByRole("listitem").length).toBe(
      Math.min(28, total),
    );
    fireEvent.click(within(list).getByRole("link", { name: /Sunday 1 March/ }));
    expect(
      await screen.findByRole("heading", { level: 2, name: "Sunday 1 March" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { level: 1, name: "Day details" }),
    ).toBeTruthy();
  });

  it("shows empty states when nothing is closed", async () => {
    await loadDemo(db, TODAY);
    await db.days.clear();
    await db.menuDays.clear();
    renderApp({ db, path: "/history" });
    expect(await screen.findByText("No days recorded yet.")).toBeTruthy();
    expect(
      screen.queryByRole("region", { name: "Cooked vs demand" }),
    ).toBeNull();
  });
});

describe("DayDetail", () => {
  async function seedOwnDay() {
    await loadDemo(db, TODAY);
    await db.days.clear();
    await db.menuDays.clear();
    await db.menus.put(makeMenu({ id: "nasi-uduk", name: "Nasi Uduk" }));
  }

  it("shows a closed sold-out day read-only with the estimate label and reason", async () => {
    await seedOwnDay();
    await db.days.put(makeDay("2026-02-27", 5));
    await db.menuDays.put(
      makeMenuDay("2026-02-27", {
        suggestedQty: 40,
        reason: {
          code: "cold-start",
          scope: "recent",
          observations: 0,
          soldOutDays: 0,
          leftoverDays: 0,
          delta: 0,
        },
        cookedQty: 42,
        soldOutAt: "10:30",
        leftover: 0,
        estimatedDemand: 81,
        demandIsEstimate: true,
      }),
    );
    renderApp({ db, path: "/day/2026-02-27" });
    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: "Friday 27 February",
      }),
    ).toBeTruthy();
    expect(await screen.findByText("Closed")).toBeTruthy();
    expect(screen.getByText("Sold out 10:30")).toBeTruthy();
    expect(screen.getByText("≈ 81")).toBeTruthy();
    expect(screen.getByText("estimate")).toBeTruthy();
    expect(
      screen.getByText(/Suggested 40 · .*Starting from your usual 40/),
    ).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Close this day" })).toBeNull();
  });

  it("links an unclosed past day to the close screen", async () => {
    await seedOwnDay();
    await db.days.put(makeDay("2026-02-27", 5, { closed: false }));
    await db.menuDays.put(
      makeMenuDay("2026-02-27", { leftover: null, estimatedDemand: null }),
    );
    renderApp({ db, path: "/day/2026-02-27" });
    const link = await screen.findByRole("link", { name: "Close this day" });
    expect(link.getAttribute("href")).toBe("/close/2026-02-27");
    expect(await screen.findByText("Not closed")).toBeTruthy();
    expect(screen.getAllByText("Not recorded").length).toBeGreaterThan(0);
  });

  it("explains an empty or invalid date", async () => {
    await seedOwnDay();
    const view = renderApp({ db, path: "/day/2026-01-01" });
    expect(
      await screen.findByText("Nothing was recorded on this day."),
    ).toBeTruthy();
    view.unmount();
    renderApp({ db, path: "/day/not-a-date" });
    expect(
      await screen.findByText("Nothing was recorded on this day."),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "Back to history" })
        .getAttribute("href"),
    ).toBe("/history");
  });
});
