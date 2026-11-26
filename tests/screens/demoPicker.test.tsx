// tests/screens/demoPicker.test.tsx
import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getStall, loadDemo } from "../../src/db/repositories.ts";
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

async function openPicker(trigger: string) {
  fireEvent.click(await screen.findByRole("button", { name: trigger }));
  return screen.findByRole("dialog", { name: "Choose a demo stall" });
}

describe("demo stall picker", () => {
  it("offers four demo stalls, each with hours, history and a short description", async () => {
    renderApp({ db });
    const dialog = await openPicker("Try demo stall");
    const options = within(dialog).getAllByRole("button", { name: /Open / });
    expect(options).toHaveLength(4);
    expect(options.map((option) => option.textContent)).toEqual([
      expect.stringContaining("Warung Demo"),
      expect.stringContaining("Demo Warung Makan Kantor"),
      expect.stringContaining("Demo Angkringan Malam"),
      expect.stringContaining("Demo Warung Baru Buka"),
    ]);
    expect(options[2]?.textContent).toContain("Open 18:00–02:00");
    expect(options[2]?.textContent).toContain("Night stall open past midnight");
    expect(options[3]?.textContent).toContain("4 days of history");
  });

  it("loads the chosen stall; a night stall picked at 09:00 belongs to the night before", async () => {
    renderApp({ db });
    const dialog = await openPicker("Try demo stall");
    fireEvent.click(
      within(dialog).getByRole("button", { name: /^Demo Angkringan Malam/ }),
    );
    expect(
      await screen.findByRole("heading", { level: 1, name: "Today" }),
    ).toBeTruthy();
    expect(await screen.findByText("Demo data")).toBeTruthy();
    const stall = await getStall(db);
    expect(stall?.name).toBe("Demo Angkringan Malam");
    expect(stall?.demo).toEqual({ scenario: 3, generatedFor: "2026-03-01" });
  });

  it("closes without loading anything", async () => {
    renderApp({ db });
    const dialog = await openPicker("Try demo stall");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Close dialog" }),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(await getStall(db)).toBeNull();
  });

  it("Settings resets the same stall and can switch to another one", async () => {
    await loadDemo(db, TODAY, 2);
    renderApp({ db, path: "/settings" });
    fireEvent.click(
      await screen.findByRole("button", { name: "Reset demo data" }),
    );
    await screen.findByText("Demo stall loaded");
    expect((await getStall(db))?.demo?.scenario).toBe(2);

    const dialog = await openPicker("Choose another demo stall");
    fireEvent.click(
      within(dialog).getByRole("button", { name: /^Demo Warung Baru Buka/ }),
    );
    await vi.waitFor(async () => {
      expect((await getStall(db))?.name).toBe("Demo Warung Baru Buka");
    });
    expect(await db.days.count()).toBe(4);
  });

  it("moves an old demo up to today when the app is opened on a later day", async () => {
    await loadDemo(db, "2026-02-25", 2);
    renderApp({ db, path: "/today" });
    expect(
      await screen.findByText("Demo dates moved up to today"),
    ).toBeTruthy();
    const stall = await getStall(db);
    expect(stall?.demo).toEqual({ scenario: 2, generatedFor: TODAY });
    const days = await db.days.orderBy("date").toArray();
    expect(days.at(-1)?.date).toBe("2026-03-01");
  });
});
