// tests/screens/demoOff.test.tsx
import { cleanup, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getStall, loadDemo, startSetup } from "../../src/db/repositories.ts";
import type { FoodooDb } from "../../src/db/schema.ts";
import { renderApp } from "../app/renderApp.tsx";
import { makeTestDb } from "../db/testDb.ts";

vi.mock("../../src/app/registerPwa.ts", () => ({
  registerPwa: () => undefined,
}));

vi.mock("../../src/app/demoConfig.ts", () => ({
  DEMO_ENABLED: false,
}));

let db: FoodooDb;

beforeEach(() => {
  db = makeTestDb();
});

afterEach(async () => {
  cleanup();
  await db.delete();
});

describe("demo turned off (VITE_DEMO=off)", () => {
  it("the app entry offers no demo", async () => {
    renderApp({ db, path: "/start" });
    expect(
      await screen.findByRole("button", { name: "Start setup" }),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Try demo stall" })).toBeNull();
  });

  it("Settings does not offer to load the demo stall", async () => {
    await startSetup(db);
    renderApp({ db, path: "/settings" });
    expect(
      await screen.findByRole("button", { name: "Delete all data" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Load demo stall" }),
    ).toBeNull();
  });

  it("a demo stored earlier can be removed but not reset, switched or moved", async () => {
    await loadDemo(db, "2026-02-25");
    renderApp({ db, path: "/settings" });
    expect(
      await screen.findByRole("button", { name: "Remove demo stall" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Reset demo data" }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Choose another demo stall" }),
    ).toBeNull();
    expect((await getStall(db))?.demo?.generatedFor).toBe("2026-02-25");
  });
});
