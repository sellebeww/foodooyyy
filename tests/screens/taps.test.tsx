// tests/screens/taps.test.tsx
import {
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { recordSale } from "../../src/db/repositories.ts";
import type { FoodooDb } from "../../src/db/schema.ts";
import type { SalesMode } from "../../src/domain/types.ts";
import { renderApp } from "../app/renderApp.tsx";
import { freshStall } from "../db/pos.helpers.ts";
import { makeTestDb } from "../db/testDb.ts";

vi.mock("../../src/app/registerPwa.ts", () => ({
  registerPwa: () => undefined,
}));

const DAY = "2026-03-02";
const MENUS = 5;
const MAX_TAPS = 20;
let db: FoodooDb | undefined;

afterEach(async () => {
  cleanup();
  await db?.delete();
});

function counter() {
  let taps = 0;
  return {
    tap(element: HTMLElement) {
      taps += 1;
      fireEvent.click(element);
    },
    get count() {
      return taps;
    },
  };
}

async function morning(taps: ReturnType<typeof counter>) {
  renderApp({ db: db as FoodooDb, path: "/plan", at: new Date(2026, 2, 2, 7) });
  taps.tap(await screen.findByRole("button", { name: "Accept all" }));
  await waitFor(async () => {
    expect(await (db as FoodooDb).menuDays.count()).toBe(MENUS);
  });
  cleanup();
}

async function night(taps: ReturnType<typeof counter>, menuIds: string[]) {
  renderApp({
    db: db as FoodooDb,
    path: "/close",
    at: new Date(2026, 2, 2, 20),
  });
  await screen.findByLabelText("Leftover portions of Menu 1");
  for (const [index] of [...menuIds, ...menuIds].entries()) {
    const more = screen.queryByRole("button", {
      name: `One more Menu ${(index % menuIds.length) + 1}`,
    });
    if (more !== null && !(more as HTMLButtonElement).disabled) {
      taps.tap(more);
    }
  }
  taps.tap(screen.getByRole("button", { name: "Close day" }));
  const dialog = await screen.findByRole("dialog", { name: "Close today?" });
  taps.tap(within(dialog).getByRole("button", { name: "Save all" }));
  await waitFor(async () => {
    expect(
      ((await (db as FoodooDb).days.get(DAY)) ?? { closed: false }).closed,
    ).toBe(true);
  });
}

describe("TP-1: tap count for 5 menus", () => {
  it.each<SalesMode>(["simple", "pos"])(
    "needs at most 20 taps for plan and close in %s mode",
    async (mode) => {
      db = makeTestDb();
      const ids = await freshStall(db, mode, MENUS);
      const taps = counter();
      await morning(taps);
      if (mode === "pos") {
        for (const [index, menuId] of ids.entries()) {
          await recordSale(
            db,
            DAY,
            "10:00",
            index + 1,
            [{ menuId, qty: 30 + index }],
            "cash",
          );
        }
      }
      await night(taps, ids);
      expect(taps.count).toBeLessThanOrEqual(MAX_TAPS);
      expect(taps.count).toBeGreaterThanOrEqual(3);
    },
  );
});
