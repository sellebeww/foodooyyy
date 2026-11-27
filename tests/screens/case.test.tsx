// tests/screens/case.test.tsx
import {
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CASE_ON, CASE_STORAGE_KEY } from "../../src/app/caseGuide.ts";
import { getStall, loadDemo } from "../../src/db/repositories.ts";
import type { FoodooDb } from "../../src/db/schema.ts";
import { LANGUAGE_STORAGE_KEY } from "../../src/i18n/index.ts";
import { freshStall } from "../db/pos.helpers.ts";
import { memoryStorage, renderApp } from "../app/renderApp.tsx";
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

async function startGuidedCase(stall: RegExp, storage = memoryStorage()) {
  renderApp({ db, path: "/start", storage });
  fireEvent.click(
    await screen.findByRole("button", { name: "Try demo stall" }),
  );
  const dialog = await screen.findByRole("dialog", {
    name: "Choose a demo stall",
  });
  fireEvent.click(within(dialog).getByRole("button", { name: stall }));
  fireEvent.click(
    await screen.findByRole("button", {
      name: /^(Track a sold-out dish|Compare weekday demand|Follow the overnight shift|Plan the first week)$/,
    }),
  );
  await screen.findByRole("heading", { level: 1, name: "Case guide" });
  await screen.findByRole("heading", { level: 2, name: /Morning plan/ });
  return storage;
}

function chapter(title: RegExp) {
  return screen.getByRole("heading", { level: 2, name: title }).closest("li");
}

describe("case guide", () => {
  it("starts from the demo picker, loads the chosen stall and explains its case with its own numbers", async () => {
    const storage = await startGuidedCase(/^Demo Warung Baru Buka/);
    expect((await getStall(db))?.demo?.scenario).toBe(4);
    expect(storage.getItem(CASE_STORAGE_KEY)).toBe(CASE_ON);
    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: "A new stall with little history",
      }),
    ).toBeTruthy();
    const plan = chapter(/Morning plan/);
    expect(plan?.textContent).toContain("Lontong Sayur");
    expect(plan?.textContent).toContain("Nasi Campur");
    expect(plan?.textContent).toContain("Not enough history yet");
    const close = chapter(/Closing time/);
    expect(close?.textContent).toContain("Bakwan");
    expect(close?.textContent).toContain("Rp 500");
    expect(close?.textContent).toContain("80%");
    expect(document.querySelectorAll(".case__steps > li")).toHaveLength(4);
  });

  it("shows the same suggested number as the plan screen", async () => {
    await startGuidedCase(/^Warung Demo/);
    const text = chapter(/Morning plan/)?.textContent ?? "";
    const match =
      /Nasi Uduk.*?suggests (\d+) portions instead of the usual (\d+)/.exec(
        text,
      );
    expect(match).not.toBeNull();
    const suggested = match?.[1] ?? "";
    fireEvent.click(
      within(chapter(/Morning plan/) as HTMLElement).getByRole("button", {
        name: "Open the morning plan",
      }),
    );
    await screen.findByRole("heading", { level: 1, name: "Plan" });
    const card = (await screen.findByText("Nasi Uduk")).closest("li");
    expect(card?.querySelector("input")?.value).toBe(suggested);
  });

  it("follows the guide onto each screen as a note, and stops when asked", async () => {
    await startGuidedCase(/^Demo Angkringan Malam/);
    fireEvent.click(
      within(chapter(/Selling/) as HTMLElement).getByRole("button", {
        name: "Open sales",
      }),
    );
    await screen.findByRole("heading", { level: 1, name: "Service" });
    const note = await screen.findByText(
      /Guided case: A stall that closes after midnight/,
    );
    expect(note).toBeTruthy();
    expect(screen.getByRole("note").textContent).toContain(
      "after midnight counts as later than 23:00",
    );
    fireEvent.click(
      screen.getByRole("link", { name: "Back to the case guide" }),
    );
    await screen.findByRole("heading", { level: 2, name: /Morning plan/ });
    fireEvent.click(
      screen.getAllByRole("button", {
        name: "Stop the guide",
      })[0] as HTMLElement,
    );
    fireEvent.click(
      within(chapter(/Closing time/) as HTMLElement).getByRole("button", {
        name: "Open closing time",
      }),
    );
    await screen.findByRole("heading", { level: 1, name: "Close" });
    expect(await screen.findByRole("note")).toBeTruthy();
  });

  it("shows no note on the loop screens unless the guide was started", async () => {
    await loadDemo(db, TODAY, 1, "service");
    renderApp({ db, path: "/service" });
    await screen.findByText("Tap a menu the moment it sells out.");
    expect(screen.queryByRole("note")).toBeNull();
  });

  it("stops for good: the note is gone after Stop the guide", async () => {
    await loadDemo(db, TODAY, 1, "service");
    const storage = memoryStorage();
    storage.setItem(CASE_STORAGE_KEY, CASE_ON);
    renderApp({ db, path: "/service", storage });
    await screen.findByRole("note");
    await waitFor(() => {
      const stop = screen.queryByRole("button", { name: "Stop the guide" });
      if (stop !== null) {
        fireEvent.click(stop);
      }
      expect(storage.getItem(CASE_STORAGE_KEY)).toBeNull();
    });
    expect(screen.queryByRole("note")).toBeNull();
  });

  it("is also reachable from the Today card", async () => {
    await loadDemo(db, TODAY, 2);
    renderApp({ db, path: "/today" });
    fireEvent.click(
      await screen.findByRole("link", { name: "Open the case guide" }),
    );
    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: "One weekday is not another",
      }),
    ).toBeTruthy();
  });

  it("never touches an owner's own stall", async () => {
    await freshStall(db, "simple");
    const before = await getStall(db);
    renderApp({ db, path: "/case" });
    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: "The case guide needs a demo stall",
      }),
    ).toBeTruthy();
    expect(await getStall(db)).toEqual(before);
  });

  it("reads in Bahasa Indonesia", async () => {
    await loadDemo(db, TODAY, 3);
    const storage = memoryStorage();
    storage.setItem(LANGUAGE_STORAGE_KEY, "id");
    renderApp({ db, path: "/case", storage });
    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: "Warung yang tutup lewat tengah malam",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Buka rencana pagi" }),
    ).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/\{\w+\}/);
  });
});
