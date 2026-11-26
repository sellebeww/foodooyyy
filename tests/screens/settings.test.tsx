// tests/screens/settings.test.tsx
import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadDemo, saveMenu, startSetup } from "../../src/db/repositories.ts";
import type { FoodooDb } from "../../src/db/schema.ts";
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

describe("Settings", () => {
  it("switches the language and keeps it after a restart", async () => {
    await loadDemo(db, TODAY);
    const storage = memoryStorage();
    const view = renderApp({ db, path: "/settings", storage });
    fireEvent.click(await screen.findByLabelText("Bahasa Indonesia"));
    expect(
      await screen.findByRole("heading", { level: 1, name: "Pengaturan" }),
    ).toBeTruthy();
    expect(document.documentElement.lang).toBe("id");
    expect(storage.getItem("foodoo.language")).toBe("id");

    view.unmount();
    renderApp({ db, path: "/today", storage });
    expect(
      await screen.findByRole("heading", { level: 1, name: "Hari ini" }),
    ).toBeTruthy();
    expect(await screen.findByText("Data demo")).toBeTruthy();
  });

  it("DM-1: delete all asks first, can be cancelled, then empties the device", async () => {
    await loadDemo(db, TODAY);
    renderApp({ db, path: "/settings" });
    fireEvent.click(
      await screen.findByRole("button", { name: "Delete all data" }),
    );
    let dialog = await screen.findByRole("dialog", {
      name: "Delete all data?",
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(await db.menus.count()).toBe(4);

    fireEvent.click(screen.getByRole("button", { name: "Delete all data" }));
    dialog = await screen.findByRole("dialog", { name: "Delete all data?" });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Delete everything" }),
    );
    expect(
      await screen.findByRole("button", { name: "Start setup" }),
    ).toBeTruthy();
    expect(await db.menus.count()).toBe(0);
    expect(await db.menuDays.count()).toBe(0);
  });

  it("DM-2: removes the demo stall after confirmation", async () => {
    await loadDemo(db, TODAY);
    renderApp({ db, path: "/settings" });
    fireEvent.click(
      await screen.findByRole("button", { name: "Remove demo stall" }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Remove the demo stall?",
    });
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Remove demo stall" }));
    fireEvent.click(
      within(
        await screen.findByRole("dialog", { name: "Remove the demo stall?" }),
      ).getByRole("button", { name: "Remove demo" }),
    );
    expect(
      await screen.findByRole("button", { name: "Start setup" }),
    ).toBeTruthy();
    expect(await db.stall.count()).toBe(0);
  });

  it("DM-2: does not offer the demo over the owner's own stall", async () => {
    await startSetup(db);
    await saveMenu(db, {
      name: "Soto",
      price: 10000,
      cost: 6000,
      salvage: 0,
      usualQty: 20,
    });
    renderApp({ db, path: "/settings" });
    const load = await screen.findByRole("button", { name: "Load demo stall" });
    expect((load as HTMLButtonElement).disabled).toBe(true);
    expect(
      screen.getByText("Delete your own data first to load the demo stall."),
    ).toBeTruthy();
    expect(screen.queryByText("Demo data")).toBeNull();
    expect(screen.getByRole("button", { name: "Export file" })).toBeTruthy();
  });

  it("edits the salvage value of a menu, which onboarding does not ask for", async () => {
    await loadDemo(db, TODAY);
    renderApp({ db, path: "/settings" });
    fireEvent.click(
      await screen.findByRole("button", { name: "Edit Nasi Uduk" }),
    );
    const dialog = await screen.findByRole("dialog", { name: "Edit menu" });
    const salvage = within(dialog).getByLabelText(
      "Value of a leftover portion (Rp)",
    );
    fireEvent.change(salvage, { target: { value: "9000" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));
    expect(
      await within(dialog).findByText(
        "Leftover value must be lower than price",
      ),
    ).toBeTruthy();
    fireEvent.change(salvage, { target: { value: "1000" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Menu saved")).toBeTruthy();
    expect((await db.menus.get("nasi-uduk"))?.salvage).toBe(1000);
  });

  it("saves new hours and confirms the save", async () => {
    await loadDemo(db, TODAY);
    renderApp({ db, path: "/settings" });
    fireEvent.change(await screen.findByLabelText("Closing time"), {
      target: { value: "13:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save hours" }));
    expect(await screen.findByText("Hours saved")).toBeTruthy();
    const stall = await db.stall.get("stall");
    expect(stall?.settings.closeAt).toBe("13:00");
    expect(Object.keys(stall?.settings.busyProfile ?? {})).toHaveLength(7);
  });
});

describe("Settings storage protection (DM-5)", () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, "storage");
  });

  function stubStorage(granted: boolean) {
    let persisted = false;
    const persist = vi.fn(() => {
      persisted = granted;
      return Promise.resolve(granted);
    });
    Object.defineProperty(navigator, "storage", {
      configurable: true,
      value: { persisted: () => Promise.resolve(persisted), persist },
    });
    return persist;
  }

  it("shows that data is not protected yet and asks the browser on request", async () => {
    const persist = stubStorage(true);
    await loadDemo(db, TODAY);
    renderApp({ db, path: "/settings" });
    expect(
      await screen.findByText(
        "Not protected yet: the browser may clear this data if the phone runs low on space.",
      ),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Keep my data" }));
    expect(
      await screen.findByText("The browser will keep your data"),
    ).toBeTruthy();
    expect(
      await screen.findByText(
        "Protected: the browser will not clear this data to free up space.",
      ),
    ).toBeTruthy();
    expect(persist).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "Keep my data" })).toBeNull();
  });

  it("says so honestly when the browser refuses", async () => {
    stubStorage(false);
    await loadDemo(db, TODAY);
    renderApp({ db, path: "/settings" });
    fireEvent.click(
      await screen.findByRole("button", { name: "Keep my data" }),
    );
    expect(
      await screen.findByText(
        "The browser said no for now. Adding FOODOO to the home screen often helps.",
      ),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Keep my data" })).toBeTruthy();
  });

  it("says when the browser does not report it", async () => {
    await loadDemo(db, TODAY);
    renderApp({ db, path: "/settings" });
    expect(
      await screen.findByText(
        "This browser does not say whether it protects the data.",
      ),
    ).toBeTruthy();
  });
});
