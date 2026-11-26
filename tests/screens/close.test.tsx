// tests/screens/close.test.tsx
import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getHistory,
  listMenus,
  loadDemo,
  savePlan,
  setSoldOut,
} from "../../src/db/repositories.ts";
import type { FoodooDb } from "../../src/db/schema.ts";
import { DEMO_MENUS } from "../../src/demo/generator.ts";
import { tomorrowPlan } from "../../src/domain/close.ts";
import { LANGUAGE_STORAGE_KEY } from "../../src/i18n/index.ts";
import { memoryStorage, renderApp } from "../app/renderApp.tsx";
import { makeTestDb } from "../db/testDb.ts";

vi.mock("../../src/app/registerPwa.ts", () => ({
  registerPwa: () => undefined,
}));

const TODAY = "2026-03-02";
const EVENING = new Date(2026, 2, 2, 20, 0);
let db: FoodooDb;

beforeEach(async () => {
  db = makeTestDb();
  await loadDemo(db, TODAY);
  await savePlan(
    db,
    TODAY,
    DEMO_MENUS.map((menu) => ({
      menuId: menu.id,
      suggestedQty: 40,
      reason: null,
      cookedQty:
        { "nasi-uduk": 42, "ayam-goreng": 31, "sayur-lodeh": 0 }[menu.id] ?? 24,
    })),
  );
  await setSoldOut(db, TODAY, "nasi-uduk", "10:30");
});

afterEach(async () => {
  cleanup();
  await db.delete();
});

function rowOf(region: HTMLElement, name: string): HTMLElement {
  const row = within(region).getByText(name).closest<HTMLElement>("li");
  if (row === null) {
    throw new Error(`No row for ${name}`);
  }
  return row;
}

async function fillAndOpenSheet() {
  fireEvent.change(
    await screen.findByLabelText("Leftover portions of Ayam Goreng"),
    { target: { value: "3" } },
  );
  fireEvent.change(screen.getByLabelText("Leftover portions of Tempe Orek"), {
    target: { value: "0" },
  });
  fireEvent.change(
    screen.getByLabelText("About what time did Tempe Orek run out?"),
    { target: { value: "12:15" } },
  );
  fireEvent.click(screen.getByRole("button", { name: "Close day" }));
  return screen.findByRole("dialog", { name: "Close today?" });
}

async function fillAndOpenSheetPast() {
  fireEvent.change(
    await screen.findByLabelText("Leftover portions of Ayam Goreng"),
    { target: { value: "3" } },
  );
  fireEvent.change(screen.getByLabelText("Leftover portions of Tempe Orek"), {
    target: { value: "2" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Close day" }));
  return screen.findByRole("dialog", { name: "Close Monday 2 March?" });
}

describe("Close", () => {
  it("CL-1, CL-2, CL-3: shows sell-out times, leftover steppers and the missed sell-out prompt", async () => {
    renderApp({ db, path: "/close", at: EVENING });
    expect(await screen.findByText("Sold out 10:30")).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: "Edit the sold-out time of Nasi Uduk",
      }),
    ).toBeTruthy();
    expect(
      screen.queryByLabelText("Leftover portions of Nasi Uduk"),
    ).toBeNull();
    expect(screen.queryByText("Sayur Lodeh")).toBeNull();

    const ayam = screen.getByLabelText<HTMLInputElement>(
      "Leftover portions of Ayam Goreng",
    );
    expect(ayam.value).toBe("");
    expect(
      screen.queryByLabelText("About what time did Ayam Goreng run out?"),
    ).toBeNull();
    fireEvent.change(ayam, { target: { value: "0" } });
    const missed = screen.getByLabelText<HTMLInputElement>(
      "About what time did Ayam Goreng run out?",
    );
    expect(missed.value).toBe("14:00");

    fireEvent.change(ayam, { target: { value: "40" } });
    fireEvent.blur(ayam);
    expect(ayam.value).toBe("31");
    fireEvent.change(ayam, { target: { value: "3" } });
    expect(
      screen.queryByLabelText("About what time did Ayam Goreng run out?"),
    ).toBeNull();
  });

  it("blocks closing until every leftover is entered", async () => {
    renderApp({ db, path: "/close", at: EVENING });
    fireEvent.change(
      await screen.findByLabelText("Leftover portions of Ayam Goreng"),
      { target: { value: "3" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Close day" }));
    expect(
      await screen.findByText(
        "Enter the leftover portions, or 0 if none are left",
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "Enter the leftover portions for 1 menu(s) before closing.",
      ),
    ).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect((await db.days.get(TODAY))?.closed).toBe(false);

    fireEvent.click(
      screen.getByRole("button", { name: "One less Tempe Orek" }),
    );
    expect(
      screen.getByLabelText<HTMLInputElement>("Leftover portions of Tempe Orek")
        .value,
    ).toBe("0");
    fireEvent.click(screen.getByRole("button", { name: "Close day" }));
    expect(
      await screen.findByRole("dialog", { name: "Close today?" }),
    ).toBeTruthy();
  });

  it("CL-3: blocks closing when the missed sell-out time is outside opening hours", async () => {
    renderApp({ db, path: "/close", at: EVENING });
    fireEvent.change(
      await screen.findByLabelText("Leftover portions of Tempe Orek"),
      { target: { value: "0" } },
    );
    fireEvent.change(
      await screen.findByLabelText("About what time did Tempe Orek run out?"),
      { target: { value: "15:30" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Close day" }));
    expect(
      await screen.findAllByText("Enter a time between 06:00 and 14:00"),
    ).toHaveLength(1);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("CL-5 acceptance: the sheet shows 28 for Ayam Goreng and ≈ 81 (estimate) for Nasi Uduk, then closes the day", async () => {
    renderApp({ db, path: "/close", at: EVENING });
    const dialog = await fillAndOpenSheet();
    const wanted = within(dialog).getByRole("region", {
      name: "How many wanted each menu today",
    });
    expect(
      within(rowOf(wanted, "Nasi Uduk")).getByText("≈ 81 (estimate)"),
    ).toBeTruthy();
    const ayam = rowOf(wanted, "Ayam Goreng");
    expect(within(ayam).getByText("28")).toBeTruthy();
    expect(ayam.textContent).not.toMatch(/estimate/);
    expect(
      within(rowOf(wanted, "Tempe Orek")).getByText("≈ 31 (estimate)"),
    ).toBeTruthy();
    expect(within(wanted).queryByText("Sayur Lodeh")).toBeNull();

    const tomorrow = within(dialog).getByRole("region", {
      name: "Tomorrow's suggestions, Tuesday 3 March",
    });
    expect(within(tomorrow).getAllByRole("listitem")).toHaveLength(4);
    expect(within(tomorrow).getAllByText("suggested portions")).toHaveLength(4);

    fireEvent.click(within(dialog).getByRole("button", { name: "Save all" }));
    expect(
      await screen.findByRole("heading", { name: "Today is closed" }),
    ).toBeTruthy();
    expect(await db.menuDays.get([TODAY, "nasi-uduk"])).toMatchObject({
      estimatedDemand: 81,
      demandIsEstimate: true,
    });
    expect(await db.menuDays.get([TODAY, "ayam-goreng"])).toMatchObject({
      leftover: 3,
      estimatedDemand: 28,
      demandIsEstimate: false,
    });
    expect(await db.menuDays.get([TODAY, "tempe-orek"])).toMatchObject({
      soldOutAt: "12:15",
      leftover: 0,
      estimatedDemand: 31,
    });
    expect(await db.days.get(TODAY)).toMatchObject({
      closed: true,
      unusual: false,
    });

    const [menus, history] = await Promise.all([listMenus(db), getHistory(db)]);
    const plan = tomorrowPlan(TODAY, menus, history.menuDays, history.days);
    const stored = screen.getByRole("region", {
      name: "Tomorrow's suggestions, Tuesday 3 March",
    });
    for (const suggestion of plan.suggestions) {
      const name = menus.find((menu) => menu.id === suggestion.menuId)?.name;
      expect(
        within(rowOf(stored, name ?? "")).getByText(String(suggestion.qty)),
      ).toBeTruthy();
    }
  });

  it("CL-4: an unusual day is kept, flagged and explained", async () => {
    renderApp({ db, path: "/close", at: EVENING });
    fireEvent.click(await screen.findByLabelText("Unusual day"));
    const dialog = await fillAndOpenSheet();
    expect(
      within(dialog).getByText(
        "Marked as an unusual day: kept, but not used for suggestions.",
      ),
    ).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Save all" }));
    expect(
      await screen.findByRole("heading", { name: "Today is closed" }),
    ).toBeTruthy();
    expect(await db.days.get(TODAY)).toMatchObject({
      closed: true,
      unusual: true,
    });
  });

  it("cancelling the sheet writes nothing", async () => {
    renderApp({ db, path: "/close", at: EVENING });
    const dialog = await fillAndOpenSheet();
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect((await db.days.get(TODAY))?.closed).toBe(false);
    expect(
      (await db.menuDays.get([TODAY, "ayam-goreng"]))?.leftover,
    ).toBeNull();
  });

  it("CL-1: the sell-out time can be edited at night", async () => {
    renderApp({ db, path: "/close", at: EVENING });
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Edit the sold-out time of Nasi Uduk",
      }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Sold-out time: Nasi Uduk",
    });
    fireEvent.change(within(dialog).getByLabelText("Time it sold out"), {
      target: { value: "11:00" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Sold out 11:00")).toBeTruthy();
    expect((await db.menuDays.get([TODAY, "nasi-uduk"]))?.soldOutAt).toBe(
      "11:00",
    );
  });

  it("labels estimates in Bahasa Indonesia too", async () => {
    const storage = memoryStorage();
    storage.setItem(LANGUAGE_STORAGE_KEY, "id");
    renderApp({ db, path: "/close", at: EVENING, storage });
    fireEvent.change(await screen.findByLabelText("Sisa porsi Ayam Goreng"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("Sisa porsi Tempe Orek"), {
      target: { value: "2" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Tutup hari" }));
    const dialog = await screen.findByRole("dialog", {
      name: "Tutup hari ini?",
    });
    expect(within(dialog).getByText("≈ 81 (perkiraan)")).toBeTruthy();
  });

  it("CL-6: a past day that was never closed can be closed from Today", async () => {
    const stall = await db.stall.get("stall");
    if (!stall) throw new Error("stall missing");
    const ownStall = {
      ...stall,
      settings: { ...stall.settings, isDemo: false },
    };
    delete ownStall.demo;
    await db.stall.put(ownStall);
    const NEXT_MORNING = new Date(2026, 2, 3, 9, 0);
    renderApp({ db, path: "/today", at: NEXT_MORNING });
    const notice = await screen.findByRole("region", {
      name: "Days not closed",
    });
    fireEvent.click(
      within(notice).getByRole("link", { name: "Close Monday 2 March" }),
    );
    expect(
      await screen.findByText("You are closing a past day: Monday 2 March."),
    ).toBeTruthy();
    const dialog = await fillAndOpenSheetPast();
    expect(
      within(dialog).queryByRole("region", {
        name: /Tomorrow's suggestions/,
      }),
    ).toBeNull();
    fireEvent.click(within(dialog).getByRole("button", { name: "Save all" }));
    expect(
      await screen.findByRole("heading", { level: 1, name: "Today" }),
    ).toBeTruthy();
    expect(await db.days.get(TODAY)).toMatchObject({ closed: true });
    expect(await db.menuDays.get([TODAY, "ayam-goreng"])).toMatchObject({
      leftover: 3,
      estimatedDemand: 28,
    });
    expect(
      screen.queryByRole("region", { name: "Days not closed" }),
    ).toBeNull();
  });

  it("sends an unknown or already closed past date back to Today", async () => {
    renderApp({ db, path: "/close/2026-02-20", at: EVENING });
    expect(
      await screen.findByRole("heading", { level: 1, name: "Today" }),
    ).toBeTruthy();
  });

  it("asks to plan first when nothing is planned", async () => {
    await db.menuDays.where("date").equals(TODAY).delete();
    renderApp({ db, path: "/close", at: EVENING });
    expect(await screen.findByText("Nothing to close yet")).toBeTruthy();
  });
});
