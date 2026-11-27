// tests/screens/tour.test.tsx
import {
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
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

// The tutorial starts listening for a tap on its next poll (150 ms) after the
// target is on screen. A person cannot tap faster than that; a test can.
async function highlighted() {
  await screen.findByText("Press the highlighted item to continue.");
  await new Promise((resolve) => setTimeout(resolve, 350));
}

function followLink(name: string) {
  fireEvent.click(screen.getAllByRole("link", { name })[0] as HTMLElement);
}

async function launchFromLanding(stall: RegExp = /^Warung Demo/) {
  renderApp({ db, entered: false });
  const buttons = await screen.findAllByRole("button", {
    name: "Launch Demo App",
  });
  fireEvent.click(buttons[0] as HTMLElement);
  const dialog = await screen.findByRole("dialog", {
    name: "Choose a demo stall",
  });
  fireEvent.click(within(dialog).getByRole("button", { name: stall }));

  await atStep("One day in 7 steps");
}

async function startFromToday() {
  fireEvent.click(
    await screen.findByRole("button", { name: "Start tutorial" }),
  );
  await atStep("A suggestion with a reason", "Step 1 of 7");
}

describe("tutorial", () => {
  it("never opens by itself inside the app", async () => {
    await loadDemo(db, TODAY);
    renderApp({ db, path: "/today" });
    await screen.findByRole("heading", { level: 1, name: "Today" });
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(noTour()).toBeNull();
  });

  it("is offered after the demo is launched and restarts it at the morning plan", async () => {
    await loadDemo(db, TODAY, 1, "close");
    await launchFromLanding();
    await press("Start tutorial");
    await screen.findByRole("heading", { level: 1, name: "Plan" });
    await atStep("A suggestion with a reason", "Step 1 of 7");
    expect((await getStall(db))?.demo?.moment).toBe("plan");
  });

  it("walks all seven steps, hides behind dialogs and ends with two extras", async () => {
    const storage = memoryStorage();
    await loadDemo(db, TODAY);
    renderApp({ db, path: "/today", storage });
    await startFromToday();
    await press("Next");
    await atStep("Save the plan", "Step 2 of 7");
    fireEvent.click(screen.getByRole("button", { name: "Accept all" }));
    await screen.findByRole("heading", { level: 1, name: "Today" });
    await atStep("Open selling", "Step 3 of 7");
    followLink("Sales");
    await atStep("A menu runs out", "Step 4 of 7");
    await screen.findByText("Tap a menu the moment it sells out.");
    await highlighted();
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
  }, 30_000);

  it("moves forward with Next and back again with Back", async () => {
    await loadDemo(db, TODAY);
    renderApp({ db, path: "/today" });
    await startFromToday();
    expect(
      within(await tour()).queryByRole("button", { name: "Back" }),
    ).toBeNull();
    await press("Next");
    await atStep("Save the plan");
    await press("Next");
    await screen.findByRole("heading", { level: 1, name: "Today" });
    await atStep("Open selling");
    await press("Next");
    await screen.findByRole("heading", { level: 1, name: "Service" });
    await atStep("A menu runs out");
    await press("Back");
    await screen.findByRole("heading", { level: 1, name: "Today" });
    await atStep("Open selling");
    await press("Back");
    await screen.findByRole("heading", { level: 1, name: "Plan" });
    await atStep("Save the plan", "Step 2 of 7");
  });

  it("does not jump forward again when Back lands on a finished step", async () => {
    await loadDemo(db, TODAY);
    renderApp({ db, path: "/today" });
    await startFromToday();
    await press("Next");
    await atStep("Save the plan");
    fireEvent.click(screen.getByRole("button", { name: "Accept all" }));
    await screen.findByRole("heading", { level: 1, name: "Today" });
    await atStep("Open selling");
    await press("Next");
    await atStep("A menu runs out");
    await screen.findByText("Tap a menu the moment it sells out.");
    await highlighted();
    fireEvent.click(
      document.querySelector(".service-grid .service-tile") as HTMLElement,
    );
    await atStep("Close the day");
    await press("Back");
    await atStep("A menu runs out");
    await new Promise((resolve) => setTimeout(resolve, 400));
    await atStep("A menu runs out");
  });

  it("closes with the close button, Skip tutorial and Escape, and leaves the app usable", async () => {
    const storage = memoryStorage();
    await loadDemo(db, TODAY);
    renderApp({ db, path: "/today", storage });
    await startFromToday();
    await press("Close tutorial");
    expect(noTour()).toBeNull();

    await screen.findByRole("heading", { level: 1, name: "Plan" });
    followLink("Today");
    await startFromToday();
    await press("Skip tutorial");
    expect(noTour()).toBeNull();

    await screen.findByRole("heading", { level: 1, name: "Plan" });
    followLink("Today");
    await startFromToday();
    fireEvent.keyDown(document.body, { key: "Escape" });
    await waitFor(() => {
      expect(noTour()).toBeNull();
    });
    expect(
      await screen.findByRole("button", { name: "Accept all" }),
    ).toBeTruthy();
  });

  it("closes after Not now and can be started again from Today", async () => {
    await loadDemo(db, TODAY);
    await launchFromLanding();
    await press("Not now");
    expect(noTour()).toBeNull();
    await startFromToday();
  });

  it("is offered again at the next launch after it was dismissed", async () => {
    await launchFromLanding();
    await press("Not now");
    expect(noTour()).toBeNull();
    cleanup();
    await launchFromLanding();
  });

  it("explains what happens in the chosen stall at each step, with that stall's own numbers", async () => {
    await launchFromLanding(/^Demo Warung Baru Buka/);
    await waitFor(() => {
      expect(
        screen.getByRole("region", { name: "Tutorial" }).textContent,
      ).toContain("This stall opened only 4 days ago");
    });
    await press("Start tutorial");
    await screen.findByRole("heading", { level: 1, name: "Plan" });
    await atStep("A suggestion with a reason", "Step 1 of 7");
    const card = (await tour()).textContent ?? "";
    expect(card).toContain("What happens in this stall");
    expect(card).toContain("Lontong Sayur");
    expect(card).toContain("Not enough history yet");
    expect(card).not.toMatch(/\{\w+\}/);
    const target = document.querySelector(
      '.card-grid > li[data-menu-id="lontong-sayur"]',
    );
    expect(target?.querySelector("input")?.value).toMatch(/^\d+$/);
  });

  it("uses a different explanation for a different stall", async () => {
    await launchFromLanding(/^Demo Angkringan Malam/);
    await waitFor(() => {
      expect(
        screen.getByRole("region", { name: "Tutorial" }).textContent,
      ).toContain("A night stall open 18:00 to 02:00");
    });
  });

  it("starts on the stall that was chosen in the launch chooser", async () => {
    await launchFromLanding(/^Demo Angkringan Malam/);
    expect((await getStall(db))?.demo?.scenario).toBe(3);
    await press("Start tutorial");
    await screen.findByRole("heading", { level: 1, name: "Plan" });
    await atStep("A suggestion with a reason", "Step 1 of 7");
    expect((await getStall(db))?.demo?.scenario).toBe(3);
  });

  it.each(["/", "/how"])("never shows on the public page %s", async (path) => {
    await loadDemo(db, TODAY);
    renderApp({ db, path });
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
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    fireEvent.click(screen.getByRole("button", { name: "Finish day" }));
    expect(screen.getByRole("button", { name: "Play" })).toBeTruthy();
    expect(screen.getByText(/Day closed/)).toBeTruthy();
    expect(screen.getByText(/^Busiest hour starts at/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next day" }));
    expect(screen.getByRole("heading", { name: /^Day 2:/ })).toBeTruthy();
    expect(await db.menuDays.count()).toBe(saved);
  });
});
