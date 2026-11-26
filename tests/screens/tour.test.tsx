// tests/screens/tour.test.tsx
import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TOUR_STORAGE_KEY } from "../../src/app/tour.ts";
import { loadDemo } from "../../src/db/repositories.ts";
import type { FoodooDb } from "../../src/db/schema.ts";
import { memoryStorage, renderApp } from "../app/renderApp.tsx";
import { makeTestDb } from "../db/testDb.ts";

const TODAY = "2026-03-02";

let db: FoodooDb;

beforeEach(() => {
  db = makeTestDb();
});

afterEach(async () => {
  cleanup();
  await db.delete();
});

const tour = () => screen.findByRole("region", { name: "Tutorial" });

describe("first-run tutorial", () => {
  it("starts on first open, follows the demo into the plan, and stays closed once ended", async () => {
    const storage = memoryStorage();
    renderApp({ db, storage, tour: true });
    expect((await tour()).textContent).toContain("Start with the demo");
    fireEvent.click(
      await screen.findByRole("button", { name: "Try demo stall" }),
    );
    expect((await tour()).textContent).toContain("Pick the morning");
    const dialog = screen.getByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: /^Morning plan/ }),
    );
    await screen.findByRole("heading", { level: 1, name: "Plan" });
    expect((await tour()).textContent).toContain("A suggestion with a reason");
    fireEvent.click(within(await tour()).getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Accept all" }));
    await screen.findByRole("heading", { level: 1, name: "Today" });
    expect((await tour()).textContent).toContain("Open selling");
    fireEvent.click(
      within(await tour()).getByRole("button", { name: "End tutorial" }),
    );
    expect(screen.queryByRole("region", { name: "Tutorial" })).toBeNull();
    expect(storage.getItem(TOUR_STORAGE_KEY)).toBe("done");
  });

  it("can be replayed from Settings", async () => {
    await loadDemo(db, TODAY);
    renderApp({ db, path: "/settings" });
    fireEvent.click(
      await screen.findByRole("button", { name: "Replay tutorial" }),
    );
    await screen.findByRole("heading", { level: 1, name: "Plan" });
    expect((await tour()).textContent).toContain("A suggestion with a reason");
  });
});

describe("simulation screen", () => {
  it("shows hourly activity and updates the analysis without saving anything", async () => {
    await loadDemo(db, TODAY);
    const saved = await db.menuDays.count();
    renderApp({ db, path: "/simulate" });
    fireEvent.click(await screen.findByRole("button", { name: "Next hour" }));
    expect(
      screen.getByRole("heading", { name: "Activity 06:00 to 07:00" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Finish day" }));
    expect(screen.getByText(/Day closed/)).toBeTruthy();
    expect(screen.getByText(/^Busiest hour starts at/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next day" }));
    expect(screen.getByRole("heading", { name: /^Day 2:/ })).toBeTruthy();
    expect(await db.menuDays.count()).toBe(saved);
  });
});
