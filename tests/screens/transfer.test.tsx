// tests/screens/transfer.test.tsx
import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exportData } from "../../src/db/exportImport.ts";
import { deleteAll, loadDemo } from "../../src/db/repositories.ts";
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
  vi.restoreAllMocks();
  await db.delete();
});

function stubDownloads() {
  const saved: { name: string; blob: Blob }[] = [];
  let last: Blob | null = null;
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: (blob: Blob) => {
      last = blob;
      return "blob:test";
    },
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: () => undefined,
  });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    if (last !== null) {
      saved.push({ name: this.download, blob: last });
    }
  });
  return saved;
}

function fileOf(data: Uint8Array, name: string): File {
  return new File([new Uint8Array(data)], name);
}

function chooseFile(file: File) {
  fireEvent.change(screen.getByLabelText("File to import"), {
    target: { files: [file] },
  });
}

describe("Export and import screens", () => {
  it("DM-3: exports the chosen format from Settings", async () => {
    await loadDemo(db, TODAY);
    const saved = stubDownloads();
    renderApp({ db, path: "/settings" });
    fireEvent.click(await screen.findByLabelText("CSV"));
    expect(screen.getByText(/Daily records per menu/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Export file" }));
    expect(await screen.findByText("File saved")).toBeTruthy();
    expect(saved.map((item) => item.name)).toEqual(["foodoo-2026-03-02.csv"]);
    expect(saved[0]?.blob.type).toBe("text/csv;charset=utf-8");

    fireEvent.click(screen.getByLabelText("XLSX"));
    fireEvent.click(screen.getByRole("button", { name: "Export file" }));
    await vi.waitFor(() => {
      expect(saved.length).toBe(2);
    });
    expect(saved[1]?.name).toBe("foodoo-2026-03-02.xlsx");
  });

  it("DM-4: restores a full backup from Welcome after delete all", async () => {
    await loadDemo(db, TODAY);
    const file = await exportData(db, "json", TODAY, `${TODAY}T08:00`);
    const before = await db.menuDays.count();
    await deleteAll(db);

    renderApp({ db, path: "/welcome" });
    expect(
      screen.queryByRole("button", { name: "Choose a file to import" }),
    ).toBeNull();
    fireEvent.click(
      await screen.findByRole("button", { name: "Import a file" }),
    );
    const info = await screen.findByRole("dialog", { name: "Import a file" });
    expect(
      within(info).getByText(/JSON or XLSX restores a full backup/),
    ).toBeTruthy();
    within(info).getByRole("button", { name: "Choose a file to import" });
    expect(screen.queryByRole("button", { name: "Export file" })).toBeNull();
    chooseFile(fileOf(file.data, "backup.json"));
    const dialog = await screen.findByRole(
      "dialog",
      { name: "Import this file?" },
      { timeout: 8000 },
    );
    expect(
      within(dialog).getByText(/replaces all data on this device/),
    ).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Import" }));
    expect(
      await screen.findByRole(
        "heading",
        { level: 1, name: "Today" },
        { timeout: 8000 },
      ),
    ).toBeTruthy();
    expect(await db.menuDays.count()).toBe(before);
  });

  it("DM-4: merges a CSV file into the stall after confirmation", async () => {
    await loadDemo(db, TODAY);
    const file = await exportData(db, "csv", TODAY, `${TODAY}T08:00`);
    const before = await db.menuDays.count();
    await db.menuDays.clear();
    renderApp({ db, path: "/settings" });
    await screen.findByRole("button", { name: "Choose a file to import" });
    chooseFile(fileOf(file.data, "history.csv"));
    const dialog = await screen.findByRole(
      "dialog",
      { name: "Import this file?" },
      { timeout: 8000 },
    );
    expect(within(dialog).getByText(/adds or updates/)).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Import" }));
    expect(
      await screen.findByText("Data imported", {}, { timeout: 8000 }),
    ).toBeTruthy();
    expect(await db.menuDays.count()).toBe(before);
  });

  it("DM-4: shows every problem and imports nothing from a bad file", async () => {
    await loadDemo(db, TODAY);
    const before = await db.menus.count();
    renderApp({ db, path: "/settings" });
    await screen.findByRole("button", { name: "Choose a file to import" });
    chooseFile(
      fileOf(new TextEncoder().encode('{"hello": true}'), "other.json"),
    );
    const alert = await screen.findByRole("alert", {}, { timeout: 8000 });
    expect(within(alert).getByText(/Nothing was imported/)).toBeTruthy();
    expect(within(alert).getByText("This is not a FOODOO file.")).toBeTruthy();
    expect(await db.menus.count()).toBe(before);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("cancelling the confirmation keeps the data", async () => {
    await loadDemo(db, TODAY);
    const file = await exportData(db, "json", TODAY, `${TODAY}T08:00`);
    await db.menus.clear();
    renderApp({ db, path: "/settings" });
    await screen.findByRole("button", { name: "Choose a file to import" });
    chooseFile(fileOf(file.data, "backup.json"));
    const dialog = await screen.findByRole(
      "dialog",
      { name: "Import this file?" },
      { timeout: 8000 },
    );
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(await db.menus.count()).toBe(0);
  });
});
