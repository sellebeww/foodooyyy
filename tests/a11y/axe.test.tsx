// tests/a11y/axe.test.tsx
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FoodooDb } from "../../src/db/schema.ts";
import { renderApp } from "../app/renderApp.tsx";
import { freshStall, planDay } from "../db/pos.helpers.ts";
import { makeTestDb } from "../db/testDb.ts";

expect.extend(toHaveNoViolations);

vi.mock("../../src/app/registerPwa.ts", () => ({
  registerPwa: () => undefined,
}));

const DAY = "2026-03-02";
const AT_9 = new Date(2026, 2, 2, 9, 0);
let db: FoodooDb;

beforeEach(() => {
  db = makeTestDb();
});

afterEach(async () => {
  cleanup();
  await db.delete();
});

async function settled() {
  await screen.findByRole("heading", { level: 1 });
  await waitFor(() => {
    expect(screen.queryByText("Loading…")).toBeNull();
  });
}

async function violations(container: HTMLElement) {
  const result = await axe(container, {
    rules: { "color-contrast": { enabled: false } },
  });
  return result.violations.filter(
    (item) => item.impact === "serious" || item.impact === "critical",
  );
}

describe("axe: no serious or critical violations", () => {
  it.each(["/", "/start"])("public page %s", async (path) => {
    const { container } = renderApp({ db, path, at: AT_9 });
    await settled();
    expect(await violations(container)).toEqual([]);
  });

  it("how it works", async () => {
    const { container } = renderApp({ db, path: "/how", at: AT_9 });
    await settled();
    expect(await violations(container)).toEqual([]);
  });

  describe("with a planned simple-mode day", () => {
    beforeEach(async () => {
      const ids = await freshStall(db, "simple");
      await planDay(db, DAY, ids, 10);
    });

    it.each(["/today", "/plan", "/service", "/close", "/history", "/settings"])(
      "%s",
      async (path) => {
        const { container } = renderApp({ db, path, at: AT_9 });
        await settled();
        expect(await violations(container)).toEqual([]);
      },
    );
  });

  it("control: the checker does flag a known violation", async () => {
    const holder = document.createElement("div");
    holder.innerHTML = '<button type="button"></button>';
    document.body.append(holder);
    const found = await violations(holder);
    holder.remove();
    expect(found.map((item) => item.id)).toContain("button-name");
  });

  describe("register mode", () => {
    beforeEach(async () => {
      const ids = await freshStall(db, "pos");
      await planDay(db, DAY, ids, 10);
    });

    it("register screen and the open cart sheet", async () => {
      const { container } = renderApp({ db, path: "/service", at: AT_9 });
      await screen.findByText("Menu 1");
      expect(await violations(container)).toEqual([]);
      const tile = screen.getByText("Menu 1").closest("button");
      if (tile === null) {
        throw new Error("No tile");
      }
      fireEvent.click(tile);
      fireEvent.click(screen.getByRole("button", { name: /^Cart: 1 item/ }));
      await screen.findByRole("dialog", { name: "Cart" });
      expect(await violations(container)).toEqual([]);
    });
  });
});
