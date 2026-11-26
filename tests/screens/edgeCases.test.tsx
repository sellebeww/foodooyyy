// tests/screens/edgeCases.test.tsx
import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  closeDay,
  loadDemo,
  savePlan,
  setMenuArchived,
} from "../../src/db/repositories.ts";
import { STALL_ID, type FoodooDb } from "../../src/db/schema.ts";
import { DEMO_MENUS } from "../../src/demo/generator.ts";
import { renderApp } from "../app/renderApp.tsx";
import { makeTestDb } from "../db/testDb.ts";
import { referenceSettings } from "../helpers.ts";

vi.mock("../../src/app/registerPwa.ts", () => ({
  registerPwa: () => undefined,
}));

const TODAY = "2026-03-02";
const YESTERDAY = "2026-03-01";
const AFTER_CLOSING = new Date(2026, 2, 2, 15, 0);
const EVENING = new Date(2026, 2, 2, 20, 0);
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

async function plan(date: string, cooked = 30) {
  await savePlan(
    db,
    date,
    DEMO_MENUS.map((menu) => ({
      menuId: menu.id,
      suggestedQty: cooked,
      reason: null,
      cookedQty: cooked,
    })),
  );
}

async function archiveAll() {
  for (const menu of DEMO_MENUS) {
    await setMenuArchived(db, menu.id, true);
  }
}

describe("edge case: no menus", () => {
  beforeEach(async () => {
    await db.stall.put({
      id: STALL_ID,
      name: "",
      settings: referenceSettings,
      setupComplete: true,
    });
  });

  it("Today and Plan point to Settings instead of an empty plan", async () => {
    renderApp({ db, path: "/today" });
    expect(await screen.findByText("No active menus")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open Settings" })).toBeTruthy();
    cleanup();
    renderApp({ db, path: "/plan" });
    expect(await screen.findByText("No active menus")).toBeTruthy();
  });

  it("Service and Close ask to plan first", async () => {
    renderApp({ db, path: "/service" });
    expect(await screen.findByText("Plan today first")).toBeTruthy();
    cleanup();
    renderApp({ db, path: "/close", at: EVENING });
    expect(await screen.findByText("Nothing to close yet")).toBeTruthy();
  });
});

describe("edge case: all menus archived", () => {
  beforeEach(async () => {
    await loadDemo(db, TODAY);
  });

  it("before today's plan, Today and Plan show the no-menus state", async () => {
    await archiveAll();
    renderApp({ db, path: "/today" });
    expect(await screen.findByText("No active menus")).toBeTruthy();
    cleanup();
    renderApp({ db, path: "/plan" });
    expect(await screen.findByText("No active menus")).toBeTruthy();
  });

  it("after today's plan, the day can still be served and closed", async () => {
    await plan(TODAY);
    await archiveAll();
    renderApp({ db, path: "/today", at: EVENING });
    expect(
      await screen.findByRole("link", { name: "Close the day" }),
    ).toBeTruthy();
    cleanup();
    renderApp({ db, path: "/service" });
    expect(
      await screen.findByRole("button", {
        name: "Nasi Uduk Cooked 30 Tap when sold out",
      }),
    ).toBeTruthy();
    cleanup();
    renderApp({ db, path: "/close", at: EVENING });
    for (const menu of DEMO_MENUS) {
      fireEvent.change(
        await screen.findByLabelText(`Leftover portions of ${menu.name}`),
        { target: { value: "2" } },
      );
    }
    fireEvent.click(screen.getByRole("button", { name: "Close day" }));
    const dialog = await screen.findByRole("dialog");
    const tomorrow = within(dialog).getByRole("region", {
      name: "Tomorrow's suggestions, Tuesday 3 March",
    });
    expect(
      within(tomorrow).getByText(
        "No active menus. Add or restore a menu in Settings.",
      ),
    ).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Save all" }));
    expect(
      await screen.findByRole("heading", { name: "Today is closed" }),
    ).toBeTruthy();
    expect((await db.days.get(TODAY))?.closed).toBe(true);
  });
});

describe("edge case: a day left unclosed", () => {
  beforeEach(async () => {
    await loadDemo(db, TODAY);
    await db.days.delete(YESTERDAY);
    await db.menuDays.where("date").equals(YESTERDAY).delete();
    await plan(YESTERDAY, 99);
  });

  it("CL-6: Today lists it and today can still be planned", async () => {
    renderApp({ db, path: "/today" });
    const notice = await screen.findByRole("region", {
      name: "Days not closed",
    });
    expect(
      within(notice).getByRole("link", { name: "Close Sunday 1 March" }),
    ).toBeTruthy();
    expect(currentStep()).toBe("Plan Now");
    cleanup();
    renderApp({ db, path: "/plan" });
    fireEvent.click(await screen.findByRole("button", { name: "Accept all" }));
    expect(
      await screen.findByRole("heading", { level: 1, name: "Today" }),
    ).toBeTruthy();
    const saved = await db.menuDays.where("date").equals(TODAY).toArray();
    expect(saved).toHaveLength(DEMO_MENUS.length);
    expect(saved.every((row) => row.cookedQty !== 99)).toBe(true);
  });
});

describe("edge case: the clock is past closing time", () => {
  beforeEach(async () => {
    await loadDemo(db, TODAY);
  });

  it("with no plan, Today still offers the plan so a forgotten morning can be recorded", async () => {
    renderApp({ db, path: "/today", at: AFTER_CLOSING });
    expect(
      await screen.findByRole("link", { name: "Plan today's portions" }),
    ).toBeTruthy();
    expect(currentStep()).toBe("Plan Now");
  });

  it("with a plan, Today moves to Close, a late tap is still stored, and the missed time defaults to closing", async () => {
    await plan(TODAY);
    renderApp({ db, path: "/today", at: AFTER_CLOSING });
    expect(
      await screen.findByRole("link", { name: "Close the day" }),
    ).toBeTruthy();
    expect(currentStep()).toBe("Close Now");
    cleanup();

    renderApp({ db, path: "/service", at: AFTER_CLOSING });
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Nasi Uduk Cooked 30 Tap when sold out",
      }),
    );
    await screen.findByText("Sold out 15:00");
    expect((await db.menuDays.get([TODAY, "nasi-uduk"]))?.soldOutAt).toBe(
      "15:00",
    );
    cleanup();

    renderApp({ db, path: "/close", at: AFTER_CLOSING });
    fireEvent.change(
      await screen.findByLabelText("Leftover portions of Ayam Goreng"),
      { target: { value: "0" } },
    );
    const missed = await screen.findByLabelText(
      "About what time did Ayam Goreng run out?",
    );
    expect((missed as HTMLInputElement).value).toBe(referenceSettings.closeAt);
    await closeDay(db, TODAY, {
      unusual: false,
      entries: DEMO_MENUS.map((menu) => ({
        menuId: menu.id,
        leftover: menu.id === "nasi-uduk" ? 0 : 2,
        soldOutAt: menu.id === "nasi-uduk" ? "15:00" : null,
      })),
    });
    expect(await db.menuDays.get([TODAY, "nasi-uduk"])).toMatchObject({
      estimatedDemand: 30,
      demandIsEstimate: true,
    });
  });
});
