// tests/screens/entry.test.tsx
import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadDemo, startSetup } from "../../src/db/repositories.ts";
import type { FoodooDb } from "../../src/db/schema.ts";
import { renderApp } from "../app/renderApp.tsx";
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

function expectNoDemoControls() {
  expect(screen.queryByRole("button", { name: /demo/i })).toBeNull();
  expect(screen.queryByRole("link", { name: /demo/i })).toBeNull();
  expect(screen.queryByRole("radio", { name: /Demo|Warung/ })).toBeNull();
  expect(screen.queryByRole("button", { name: "Start setup" })).toBeNull();
}

describe("company page", () => {
  it("opens first, without any demo, and leads to the app entry", async () => {
    renderApp({ db, tour: true });
    await headline();
    expectNoDemoControls();
    expect(screen.queryByRole("region", { name: "Tutorial" })).toBeNull();
    const open = screen.getAllByRole("link", { name: "Open the app" });
    expect(open.every((link) => link.getAttribute("href") === "/start")).toBe(
      true,
    );
    fireEvent.click(open[0] as HTMLElement);
    expect(
      await screen.findByRole("button", { name: "Try demo stall" }),
    ).toBeTruthy();
  });

  it("stays the first page when a stall exists and offers the way back", async () => {
    await loadDemo(db, TODAY);
    renderApp({ db, tour: true });
    await headline();
    expect(
      (await screen.findAllByRole("link", { name: "Back to the app" })).length,
    ).toBeGreaterThan(0);
    expectNoDemoControls();
    expect(screen.queryByRole("region", { name: "Tutorial" })).toBeNull();
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
