// tests/screens/today.test.tsx
import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getHistory, listMenus, loadDemo } from "../../src/db/repositories.ts";
import { weeklyMetrics } from "../../src/domain/metrics.ts";
import type { FoodooDb } from "../../src/db/schema.ts";
import { weeklyMoney } from "../../src/domain/money.ts";
import { formatRupiah } from "../../src/i18n/format.ts";
import { renderApp } from "../app/renderApp.tsx";
import { makeTestDb } from "../db/testDb.ts";
import { makeDay, makeMenuDay } from "../helpers.ts";

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

function currentStep(): string {
  return document.querySelector('[aria-current="step"]')?.textContent ?? "";
}

async function planToday(soldOut: number) {
  const ids = ["nasi-uduk", "ayam-goreng", "sayur-lodeh", "tempe-orek"];
  await db.menuDays.bulkPut(
    ids.map((menuId, index) =>
      makeMenuDay(TODAY, {
        menuId,
        cookedQty: 30,
        soldOutAt: index < soldOut ? "10:30" : null,
        leftover: null,
        estimatedDemand: null,
      }),
    ),
  );
}

describe("Today", () => {
  it("TD-1..3: trying the demo opens Today in the plan phase with the demo sticker", async () => {
    renderApp({ db });
    fireEvent.click(
      await screen.findByRole("button", { name: "Try demo stall" }),
    );
    fireEvent.click(
      within(await screen.findByRole("dialog")).getByRole("button", {
        name: "Open with the real clock",
      }),
    );
    expect(
      await screen.findByRole("heading", { level: 1, name: "Today" }),
    ).toBeTruthy();
    expect(await screen.findByText("Demo data")).toBeTruthy();
    expect(screen.getByText("Monday 2 March")).toBeTruthy();
    expect(currentStep()).toBe("Plan Now");
    const action = screen.getByRole("link", { name: "Plan today's portions" });
    expect(action.getAttribute("href")).toBe("/plan");
    const counts = screen.getByRole("region", { name: "Today so far" });
    expect(
      within(counts).getByText("Portions planned").nextSibling?.textContent,
    ).toBe("0");
    expect(
      within(counts).getByText("Day closed").nextSibling?.textContent,
    ).toBe("No");
  });

  it("TD-1: is in service after planning, before closing time", async () => {
    await loadDemo(db, TODAY);
    await planToday(1);
    renderApp({ db, path: "/today" });
    expect(
      await screen.findByRole("link", { name: "Open service" }),
    ).toBeTruthy();
    expect(currentStep()).toBe("Service Now");
    const counts = screen.getByRole("region", { name: "Today so far" });
    expect(
      within(counts).getByText("Portions planned").nextSibling?.textContent,
    ).toBe("120");
    expect(
      within(counts).getByText("Menus sold out").nextSibling?.textContent,
    ).toBe("1");
  });

  it("TD-1: moves to close at closing time or when every menu sold out", async () => {
    await loadDemo(db, TODAY);
    await planToday(0);
    const late = renderApp({
      db,
      path: "/today",
      at: new Date(2026, 2, 2, 14, 0),
    });
    expect(
      await screen.findByRole("link", { name: "Close the day" }),
    ).toBeTruthy();
    late.unmount();

    await planToday(4);
    renderApp({ db, path: "/today" });
    expect(
      await screen.findByRole("link", { name: "Close the day" }),
    ).toBeTruthy();
    expect(currentStep()).toBe("Close Now");
  });

  it("TD-1: shows every phase done once the day is closed", async () => {
    await loadDemo(db, TODAY);
    await planToday(2);
    await db.days.put(makeDay(TODAY, 1, { closed: true }));
    renderApp({ db, path: "/today" });
    const done = await screen.findByRole("button", {
      name: "See you tomorrow",
    });
    expect((done as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByText("Now")).toBeNull();
    const counts = screen.getByRole("region", { name: "Today so far" });
    expect(
      within(counts).getByText("Day closed").nextSibling?.textContent,
    ).toBe("Yes");
  });

  it("shows an empty state when every menu is archived", async () => {
    await loadDemo(db, TODAY);
    await db.menus.toCollection().modify({ archived: true });
    renderApp({ db, path: "/today" });
    expect(await screen.findByText("No active menus")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open Settings" })).toBeTruthy();
  });

  it("CL-6: lists past days that were planned but never closed", async () => {
    await loadDemo(db, TODAY);
    await db.days.update("2026-03-01", { closed: false });
    renderApp({ db, path: "/today" });
    const notice = await screen.findByRole("region", {
      name: "Days not closed",
    });
    const link = within(notice).getByRole("link", {
      name: "Close Sunday 1 March",
    });
    expect(link.getAttribute("href")).toBe("/close/2026-03-01");
  });

  it("has no unfinished loop screens left in the navigation", async () => {
    await loadDemo(db, TODAY);
    renderApp({ db, path: "/today" });
    await screen.findByRole("heading", { level: 1, name: "Today" });
    expect(screen.queryByText("Soon")).toBeNull();
    expect(screen.queryByText("Coming soon")).toBeNull();
  });

  it("WS-1: shows the last 7 days from stored data with lost sales labelled estimate", async () => {
    await loadDemo(db, TODAY);
    const history = await getHistory(db);
    const metrics = weeklyMetrics(history.menuDays, history.days, TODAY);
    renderApp({ db, path: "/today" });
    const week = await screen.findByRole("region", { name: "Last 7 days" });
    expect(
      within(week).getByText("Leftover portions").nextSibling?.textContent,
    ).toBe(String(metrics.leftoverPortions));
    expect(within(week).getByText("Sell-outs").nextSibling?.textContent).toBe(
      String(metrics.sellOutEvents),
    );
    const lost = within(week).getByText("Lost sales (portions)").nextSibling;
    expect(lost?.textContent).toBe(`≈ ${metrics.estimatedLostSales}estimate`);
    expect(within(week).getAllByText("estimate")).toHaveLength(2);
    const money = weeklyMoney(
      history.menuDays,
      history.days,
      await listMenus(db),
      TODAY,
    );
    expect(
      within(week).getByText("Margin missed by selling out").nextSibling
        ?.textContent,
    ).toBe(`≈ ${formatRupiah(money.missedEarnings)} estimate`);
    expect(
      within(week)
        .getByRole("link", { name: "See history" })
        .getAttribute("href"),
    ).toBe("/history");
  });

  it("WS-1: explains the empty week when no day was closed", async () => {
    await loadDemo(db, TODAY);
    await db.days.toCollection().modify({ closed: false });
    renderApp({ db, path: "/today" });
    const week = await screen.findByRole("region", { name: "Last 7 days" });
    expect(
      within(week).getByText(/No closed days in the last 7 days/),
    ).toBeTruthy();
  });

  it("sends a visitor with no data from an app route to Welcome", async () => {
    renderApp({ db, path: "/today" });
    expect(
      await screen.findByRole("button", { name: "Start setup" }),
    ).toBeTruthy();
  });
});
