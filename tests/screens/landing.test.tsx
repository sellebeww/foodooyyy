// tests/screens/landing.test.tsx
import { cleanup, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FoodooDb } from "../../src/db/schema.ts";
import { LANGUAGE_STORAGE_KEY } from "../../src/i18n/index.ts";
import { memoryStorage, renderApp } from "../app/renderApp.tsx";
import { makeTestDb } from "../db/testDb.ts";

vi.mock("../../src/app/registerPwa.ts", () => ({
  registerPwa: () => undefined,
}));

let db: FoodooDb;

beforeEach(() => {
  db = makeTestDb();
});

afterEach(async () => {
  cleanup();
  await db.delete();
});

describe("company page: ecosystem and trust", () => {
  it("explains how the five parts feed each other and where the limits are", async () => {
    renderApp({ db, path: "/", entered: false });
    const eco = await screen.findByRole("region", {
      name: "One loop, five connected parts",
    });
    expect(within(eco).getAllByRole("listitem")).toHaveLength(5);
    expect(within(eco).getAllByText(/Passes on:/)).toHaveLength(5);
    const trust = screen.getByRole("region", {
      name: "What FOODOO claims, and what it does not",
    });
    expect(
      within(trust).getByText(/states no accuracy percentage/),
    ).toBeTruthy();
    expect(
      within(trust).getByRole("link", { name: "How FOODOO calculates" }),
    ).toBeTruthy();
  });

  it("links the new sections from the header navigation", async () => {
    renderApp({ db, path: "/", entered: false });
    const nav = await screen.findByRole("navigation", {
      name: "Page sections",
    });
    for (const [name, id] of [
      ["Ecosystem", "ecosystem"],
      ["Trust", "trust"],
    ] as const) {
      const link = within(nav).getByRole("link", { name });
      expect(link.getAttribute("href")).toBe(`#${id}`);
      expect(document.getElementById(id)).not.toBeNull();
    }
  });

  it("is in Bahasa Indonesia when that language is chosen", async () => {
    const storage = memoryStorage();
    storage.setItem(LANGUAGE_STORAGE_KEY, "id");
    renderApp({ db, path: "/", entered: false, storage });
    expect(
      await screen.findByRole("region", {
        name: "Satu putaran, lima bagian yang saling terhubung",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("region", {
        name: "Yang diklaim FOODOO, dan yang tidak",
      }),
    ).toBeTruthy();
  });
});
