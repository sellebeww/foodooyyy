// tests/screens/tour.test.tsx
import {
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TOUR_STORAGE_KEY } from "../../src/app/tour.ts";
import { getStall, loadDemo } from "../../src/db/repositories.ts";
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
const noTour = () => screen.queryByRole("region", { name: "Tutorial" });

async function atStep(title: string, progress?: string) {
  await waitFor(() => {
    const region = screen.getByRole("region", { name: "Tutorial" });
    expect(within(region).getByRole("heading", { name: title })).toBeTruthy();
    if (progress !== undefined) {
      expect(region.textContent).toContain(progress);
    }
  });
}

async function press(name: string) {
  fireEvent.click(within(await tour()).getByRole("button", { name }));
}

function followLink(name: string) {
  fireEvent.click(screen.getAllByRole("link", { name })[0] as HTMLElement);
}

describe("tutorial", () => {
  it("opens inside the demo and restarts it at the morning plan", async () => {
    await loadDemo(db, TODAY, 1, "close");
    renderApp({ db, path: "/close", tour: true });
    await atStep("One day in 7 steps");
    await press("Start tutorial");
    await screen.findByRole("heading", { level: 1, name: "Plan" });
    await atStep("A suggestion with a reason", "Step 1 of 7");
    expect((await getStall(db))?.demo?.moment).toBe("plan");
  });

  it("walks all seven steps, hides behind dialogs and ends with two extras", async () => {
    const storage = memoryStorage();
    await loadDemo(db, TODAY);
    renderApp({ db, path: "/today", storage, tour: true });
    await atStep("One day in 7 steps");
    await press("Start tutorial");
    await atStep("A suggestion with a reason", "Step 1 of 7");
    await press("Next");
    await atStep("Save the plan", "Step 2 of 7");
    fireEvent.click(screen.getByRole("button", { name: "Accept all" }));
    await screen.findByRole("heading", { level: 1, name: "Today" });
    await atStep("Open selling", "Step 3 of 7");
    followLink("Sales");
    await atStep("A menu runs out", "Step 4 of 7");
    await screen.findByText("Tap a menu the moment it sells out.");
    fireEvent.click(
      document.querySelector(".service-grid .service-tile") as HTMLElement,
    );
    await atStep("Close the day", "Step 5 of 7");
    followLink("Close");
    await atStep("Count what is left", "Step 6 of 7");
    await screen.findByText("Count what is left of each menu.");
    for (const input of document.querySelectorAll(".stepper__input")) {
      fireEvent.change(input, { target: { value: "1" } });
    }
    fireEvent.click(screen.getByRole("button", { name: "Close day" }));
    const dialog = await screen.findByRole("dialog");
    await waitFor(() => {
      expect(noTour()).toBeNull();
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save all" }));
    await atStep("See the result", "Step 7 of 7");
    followLink("History");
    await atStep("That is the daily loop");
    await press("Try the simulation");
    await screen.findByRole("heading", { level: 1, name: "Hourly simulation" });
    expect(noTour()).toBeNull();
    expect(storage.getItem(TOUR_STORAGE_KEY)).toBe("done");
  }, 30_000);

  it("moves to the next screen when a step is skipped", async () => {
    await loadDemo(db, TODAY);
    renderApp({ db, path: "/today", tour: true });
    await atStep("One day in 7 steps");
    await press("Start tutorial");
    await atStep("A suggestion with a reason");
    await press("Next");
    await atStep("Save the plan");
    await press("Skip step");
    await screen.findByRole("heading", { level: 1, name: "Today" });
    await atStep("Open selling");
    await press("Skip step");
    await screen.findByRole("heading", { level: 1, name: "Service" });
    await atStep("A menu runs out");
  });

  it("stays closed after Not now", async () => {
    const storage = memoryStorage();
    await loadDemo(db, TODAY);
    renderApp({ db, path: "/today", storage, tour: true });
    await atStep("One day in 7 steps");
    await press("Not now");
    expect(noTour()).toBeNull();
    expect(storage.getItem(TOUR_STORAGE_KEY)).toBe("done");
  });

  it.each(["/", "/how"])("never shows on the public page %s", async (path) => {
    await loadDemo(db, TODAY);
    renderApp({ db, path, tour: true });
    await screen.findByRole("heading", { level: 1 });
    expect(noTour()).toBeNull();
  });

  it("replays from Settings even after the demo day was closed", async () => {
    await loadDemo(db, TODAY, 1, "summary");
    renderApp({ db, path: "/settings" });
    fireEvent.click(
      await screen.findByRole("button", { name: "Replay tutorial" }),
    );
    await screen.findByRole("heading", { level: 1, name: "Plan" });
    await atStep("A suggestion with a reason", "Step 1 of 7");
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
