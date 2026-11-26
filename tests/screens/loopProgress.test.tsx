// tests/screens/loopProgress.test.tsx
import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadDemo } from "../../src/db/repositories.ts";
import { renderApp } from "../app/renderApp.tsx";
import { makeTestDb } from "../db/testDb.ts";

vi.mock("../../src/app/registerPwa.ts", () => ({
  registerPwa: () => undefined,
}));

afterEach(() => {
  cleanup();
});

describe("Today loop graphic", () => {
  it("fills the segment of the current phase and outlines the rest", async () => {
    const db = makeTestDb();
    await loadDemo(db, "2026-03-02");
    const view = renderApp({ db, path: "/today" });
    await screen.findByText("Plan today's portions");
    const arcs = [...view.container.querySelectorAll(".loop__arc")].map((arc) =>
      arc.getAttribute("class"),
    );
    expect(arcs).toEqual([
      "loop__arc loop__arc--current",
      "loop__arc loop__arc--next",
      "loop__arc loop__arc--next",
    ]);
    view.unmount();
    await db.delete();
  });
});
