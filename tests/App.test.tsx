// tests/App.test.tsx
import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderApp } from "./app/renderApp.tsx";
import { makeTestDb } from "./db/testDb.ts";

vi.mock("../src/app/registerPwa.ts", () => ({
  registerPwa: (onOfflineReady: () => void) => {
    onOfflineReady();
  },
}));

afterEach(() => {
  cleanup();
});

describe("App shell", () => {
  it("offers a skip link and announces when it is ready offline", async () => {
    const db = makeTestDb();
    renderApp({ db });
    expect(
      screen
        .getByRole("link", { name: "Skip to content" })
        .getAttribute("href"),
    ).toBe("#main");
    expect(await screen.findByText("Ready to work offline.")).toBeTruthy();
    expect(
      screen
        .getByText("Ready to work offline.")
        .closest('[aria-live="polite"]'),
    ).toBeTruthy();
    await db.delete();
  });

  it("sends an unknown path to the start", async () => {
    const db = makeTestDb();
    renderApp({ db, path: "/nowhere" });
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /Cook the right amount/,
      }),
    ).toBeTruthy();
    await db.delete();
  });
});
