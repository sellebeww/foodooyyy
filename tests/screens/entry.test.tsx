// tests/screens/entry.test.tsx
import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadDemo, startSetup } from "../../src/db/repositories.ts";
import type { FoodooDb } from "../../src/db/schema.ts";
import { renderApp } from "../app/renderApp.tsx";
import { freshStall } from "../db/pos.helpers.ts";
import { makeTestDb } from "../db/testDb.ts";

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

const headline = () =>
  screen.findByRole("heading", { level: 1, name: /Cook the right amount/ });

const noTour = () => screen.queryByRole("region", { name: "Tutorial" });

async function openChooser() {
  const buttons = await screen.findAllByRole("button", {
    name: "Launch Demo App",
  });
  fireEvent.click(buttons[0] as HTMLElement);
  return screen.findByRole("dialog", { name: "Choose a demo stall" });
}

describe("company page", () => {
  it("opens first and offers the demo launch and an own setup", async () => {
    renderApp({ db, entered: false });
    await headline();
    expect(noTour()).toBeNull();
    expect(
      (await screen.findAllByRole("button", { name: "Launch Demo App" }))
        .length,
    ).toBeGreaterThan(0);
    const setup = await screen.findAllByRole("button", {
      name: "Set up my own stall",
    });
    fireEvent.click(setup[0] as HTMLElement);
    expect(
      await screen.findByRole("button", { name: "Try demo stall" }),
    ).toBeTruthy();
  });

  it.each(["/today", "/plan", "/start", "/settings", "/setup/menus"])(
    "sends a visitor who has not entered the app from %s to the company page",
    async (path) => {
      renderApp({ db, path, entered: false });
      await headline();
    },
  );

  it("the launch button opens a chooser first and loads nothing until a choice is made", async () => {
    renderApp({ db, entered: false });
    await headline();
    const dialog = await openChooser();
    expect(await db.stall.count()).toBe(0);
    expect(
      within(dialog).getAllByRole("button", { name: /^(Demo |Warung Demo)/ }),
    ).toHaveLength(4);
    for (const name of [/^Warung Demo/, /^Morning plan/, /^Selling/]) {
      expect(within(dialog).getByRole("button", { name })).toBeTruthy();
    }
    expect(
      within(dialog).queryByRole("button", {
        name: "Continue the demo I already have",
      }),
    ).toBeNull();
    expect(noTour()).toBeNull();
  });

  it("loads the chosen stall and offers the tutorial", async () => {
    renderApp({ db, entered: false });
    await headline();
    const dialog = await openChooser();
    fireEvent.click(
      within(dialog).getByRole("button", { name: /^Demo Warung Makan Kantor/ }),
    );

    expect(
      await screen.findByRole("heading", { level: 1, name: "Today" }),
    ).toBeTruthy();
    const region = await screen.findByRole("region", { name: "Tutorial" });
    expect(within(region).getByRole("heading").textContent).toBe(
      "One day in 7 steps",
    );
    const stall = (await db.stall.toArray())[0];
    expect(stall?.settings.isDemo).toBe(true);
    expect(stall?.demo?.scenario).toBe(2);
  });

  it("opens a stall at a moment without starting the tutorial", async () => {
    renderApp({ db, entered: false });
    await headline();
    const dialog = await openChooser();
    fireEvent.change(within(dialog).getByRole("combobox"), {
      target: { value: "3" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: /^Closing time/ }),
    );
    expect(
      await screen.findByRole("heading", { level: 1, name: "Close" }),
    ).toBeTruthy();
    expect(noTour()).toBeNull();
    expect((await db.stall.toArray())[0]?.demo?.scenario).toBe(3);
  });

  it("can continue a demo stall that already exists, or start over", async () => {
    await loadDemo(db, TODAY, 3);
    renderApp({ db, entered: false });
    await headline();
    const dialog = await openChooser();
    fireEvent.click(
      within(dialog).getByRole("button", {
        name: "Continue the demo I already have",
      }),
    );
    expect(
      await screen.findByRole("heading", { level: 1, name: "Today" }),
    ).toBeTruthy();
    expect((await db.stall.toArray())[0]?.demo?.scenario).toBe(3);
    expect(noTour()).toBeNull();
  });

  it("offers a way back, not the demo, when the stall is the owner's own", async () => {
    await freshStall(db, "simple");
    renderApp({ db, entered: false });
    await headline();
    expect(
      screen.queryByRole("button", { name: "Launch Demo App" }),
    ).toBeNull();
    const back = await screen.findAllByRole("button", {
      name: "Continue to the app",
    });
    fireEvent.click(back[0] as HTMLElement);
    expect(
      await screen.findByRole("heading", { level: 1, name: "Today" }),
    ).toBeTruthy();
    expect(noTour()).toBeNull();
  });
});

describe("app entry", () => {
  it("offers setup, the demo and import, and links to the company page", async () => {
    renderApp({ db, path: "/start" });
    await screen.findByRole("button", { name: "Start setup" });
    const main = screen.getByRole("main");
    for (const name of ["Start setup", "Try demo stall", "Import a file"]) {
      expect(within(main).getByRole("button", { name })).toBeTruthy();
    }
    expect(
      screen.getByRole("link", { name: "About FOODOO" }).getAttribute("href"),
    ).toBe("/");
  });

  it("goes straight to Today when a stall is ready", async () => {
    await loadDemo(db, TODAY);
    renderApp({ db, path: "/start" });
    expect(
      await screen.findByRole("heading", { level: 1, name: "Today" }),
    ).toBeTruthy();
  });

  it("continues an unfinished setup and blocks the demo", async () => {
    await startSetup(db);
    renderApp({ db, path: "/start" });
    expect(
      await screen.findByRole("button", { name: "Continue setup" }),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Try demo stall" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });
});
