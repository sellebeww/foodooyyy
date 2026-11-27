// tests/screens/how.test.tsx
import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadDemo } from "../../src/db/repositories.ts";
import type { FoodooDb } from "../../src/db/schema.ts";
import { LANGUAGE_STORAGE_KEY } from "../../src/i18n/index.ts";
import { memoryStorage, renderApp } from "../app/renderApp.tsx";
import { makeTestDb } from "../db/testDb.ts";

vi.mock("../../src/app/registerPwa.ts", () => ({
  registerPwa: () => undefined,
}));

let db: FoodooDb;

beforeEach(() => {
  db = makeTestDb();
});

afterEach(async () => {
  cleanup();
  await db.delete();
});

describe("How FOODOO calculates", () => {
  it("DESIGN 5.8: shows the worked example from the domain code, before any setup", async () => {
    renderApp({ db, path: "/how" });
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "How FOODOO calculates",
      }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "Example stall. These numbers are an example, not your data.",
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "From the busy hours, about 52% of a normal day's customers had arrived by 10:30.",
      ),
    ).toBeTruthy();
    expect(screen.getByText("≈ 81 (estimate)")).toBeTruthy();
    expect(
      screen.getByText(
        "The guess is never more than 3 times what was cooked (126 here).",
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "Each extra portion sold earns Rp 3.500. Each portion left over loses Rp 4.500, what it cost to cook.",
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "On the last 5 Mondays, people wanted: 30, 32, 35, 40, 41.",
      ),
    ).toBeTruthy();
    expect(screen.getByText("34")).toBeTruthy();
    expect(
      screen.getByText("Leftovers on 5 of the last 5 days → −11"),
    ).toBeTruthy();
    expect(
      screen.getAllByText("(before 10:30)", { exact: false }),
    ).toHaveLength(5);
    expect(screen.queryByRole("link", { name: "Settings" })).toBeNull();
  });

  it("is in Bahasa Indonesia when that language is chosen", async () => {
    const storage = memoryStorage();
    storage.setItem(LANGUAGE_STORAGE_KEY, "id");
    renderApp({ db, path: "/how", storage });
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Cara FOODOO menghitung",
      }),
    ).toBeTruthy();
    expect(screen.getByText("≈ 81 (perkiraan)")).toBeTruthy();
  });

  it("opens from Settings > About", async () => {
    await loadDemo(db, "2026-03-02");
    renderApp({ db, path: "/settings" });
    fireEvent.click(
      await screen.findByRole("link", { name: "How FOODOO calculates" }),
    );
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "How FOODOO calculates",
      }),
    ).toBeTruthy();
  });
});

describe("How FOODOO calculates: interactive steps", () => {
  it("lists the six steps and links each one to its section", async () => {
    renderApp({ db, path: "/how" });
    const nav = await screen.findByRole("navigation", {
      name: "Steps on this page",
    });
    const links = within(nav).getAllByRole("link");
    expect(links).toHaveLength(6);
    for (const link of links) {
      const target = link.getAttribute("href")?.slice(1) ?? "";
      expect(document.getElementById(target), target).not.toBeNull();
    }
  });

  it("re-estimates the demand when the sold-out time moves", async () => {
    renderApp({ db, path: "/how" });
    const slider = await screen.findByRole("slider", { name: /Sold out at/ });
    fireEvent.change(slider, { target: { value: String(6 * 60 + 30) } });
    expect(screen.getByText("≈ 126 (estimate)")).toBeTruthy();
    expect(screen.getByText(/Rule in use: the cap/)).toBeTruthy();
    fireEvent.change(slider, { target: { value: String(14 * 60) } });
    expect(screen.getByText("≈ 42 (estimate)")).toBeTruthy();
    expect(screen.getByText(/sold out at closing time/)).toBeTruthy();
    fireEvent.change(slider, { target: { value: String(10 * 60 + 30) } });
    expect(screen.getByText("≈ 81 (estimate)")).toBeTruthy();
    expect(screen.getByText(/the busy hours scale/)).toBeTruthy();
  });

  it("suggests a different amount when the cost of a portion changes", async () => {
    renderApp({ db, path: "/how" });
    const slider = await screen.findByRole("slider", {
      name: /Cost to cook one portion/,
    });
    fireEvent.change(slider, { target: { value: "1500" } });
    expect(
      screen.getByText(
        "Each extra portion sold earns Rp 6.500. Each portion left over loses Rp 1.500, what it cost to cook.",
      ),
    ).toBeTruthy();
    expect(screen.queryByText("34")).toBeNull();
  });

  it("states that no accuracy percentage is claimed", async () => {
    renderApp({ db, path: "/how" });
    expect(
      await screen.findByText(/FOODOO states no accuracy percentage/),
    ).toBeTruthy();
    expect(screen.queryByText(/\d+% accurate/)).toBeNull();
  });

  it("asks for more days before it compares suggestions with what happened", async () => {
    renderApp({ db, path: "/how" });
    expect(
      await screen.findByText(/Not enough days yet: 0 of 5 days checked/),
    ).toBeTruthy();
  });

  it("compares suggestions with what happened once the history is long enough", async () => {
    await loadDemo(db, "2026-03-02");
    await db.menuDays.toCollection().modify((item) => {
      item.suggestedQty = item.cookedQty;
      item.reason = {
        code: "history",
        scope: "weekday",
        observations: 6,
        soldOutDays: 0,
        leftoverDays: 1,
        delta: 0,
      };
    });
    renderApp({ db, path: "/how" });
    const panel = await screen.findByRole("region", {
      name: "Suggestions against what happened",
    });
    expect(await within(panel).findByText("Average miss")).toBeTruthy();
    expect(within(panel).getByText(/Aim: \d+% of days/)).toBeTruthy();
    expect(within(panel).queryByText(/Not enough days yet/)).toBeNull();
  });
});
