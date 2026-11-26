// tests/screens/how.test.tsx
import { cleanup, fireEvent, screen } from "@testing-library/react";
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
