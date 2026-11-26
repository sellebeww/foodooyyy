// tests/screens/regressions.test.tsx
import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadDemo, savePlan } from "../../src/db/repositories.ts";
import type { FoodooDb } from "../../src/db/schema.ts";
import { renderApp } from "../app/renderApp.tsx";
import { makeTestDb } from "../db/testDb.ts";

vi.mock("../../src/app/registerPwa.ts", () => ({
  registerPwa: () => undefined,
}));

const TODAY = "2026-03-02";
const YESTERDAY = "2026-03-01";
let db: FoodooDb;

beforeEach(async () => {
  db = makeTestDb();
  await loadDemo(db, TODAY);
});

afterEach(async () => {
  cleanup();
  await db.delete();
});

async function field(label: string): Promise<HTMLInputElement> {
  return screen.findByLabelText(label);
}

describe("regressions", () => {
  it("does not carry leftovers typed for a past day over to today", async () => {
    await db.days.update(YESTERDAY, { closed: false });
    await savePlan(db, TODAY, [
      {
        menuId: "ayam-goreng",
        suggestedQty: 30,
        reason: null,
        cookedQty: 30,
      },
    ]);
    renderApp({ db, path: `/close/${YESTERDAY}` });
    fireEvent.change(await field("Leftover portions of Ayam Goreng"), {
      target: { value: "7" },
    });
    fireEvent.click(screen.getAllByRole("link", { name: "Close" })[0]!);
    await screen.findByText("Cooked 30");
    expect((await field("Leftover portions of Ayam Goreng")).value).toBe("");
  });

  it("picks up the new date as soon as the phone wakes", async () => {
    let at = new Date(2026, 2, 2, 20, 0);
    renderApp({ db, path: "/today", now: () => at });
    await screen.findByText("Monday 2 March");
    at = new Date(2026, 2, 3, 7, 0);
    fireEvent(document, new Event("visibilitychange"));
    expect(await screen.findByText("Tuesday 3 March")).toBeTruthy();
  });

  it("does not change a quantity when a touch turns into a scroll", async () => {
    renderApp({ db, path: "/plan" });
    const input = await field("Portions of Ayam Goreng");
    const start = input.value;
    const more = screen.getByRole("button", { name: "One more Ayam Goreng" });
    fireEvent.pointerDown(more, { button: 0, pointerType: "touch" });
    fireEvent.pointerCancel(more, { pointerType: "touch" });
    expect(input.value).toBe(start);
    fireEvent.pointerDown(more, { button: 0, pointerType: "touch" });
    fireEvent.pointerUp(more, { pointerType: "touch" });
    fireEvent.click(more, { detail: 1 });
    expect(input.value).toBe(String(Number(start) + 1));
    fireEvent.pointerDown(more, { button: 0, pointerType: "mouse" });
    fireEvent.pointerUp(more, { pointerType: "mouse" });
    fireEvent.click(more, { detail: 1 });
    expect(input.value).toBe(String(Number(start) + 2));
  });

  it("keeps the hidden file input out of the tab order", async () => {
    renderApp({ db, path: "/settings" });
    expect((await field("File to import")).hidden).toBe(true);
  });
});
