// tests/screens/closePos.test.tsx
import {
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { recordSale, setSoldOut } from "../../src/db/repositories.ts";
import type { FoodooDb } from "../../src/db/schema.ts";
import { renderApp } from "../app/renderApp.tsx";
import { freshStall, planDay } from "../db/pos.helpers.ts";
import { makeTestDb } from "../db/testDb.ts";

vi.mock("../../src/app/registerPwa.ts", () => ({
  registerPwa: () => undefined,
}));

const DAY = "2026-03-02";
const EVENING = new Date(2026, 2, 2, 20, 0);
let db: FoodooDb;
let ids: string[];

beforeEach(async () => {
  db = makeTestDb();
  ids = await freshStall(db, "pos");
  await planDay(db, DAY, ids, 10);
  await recordSale(db, DAY, "09:00", 1, [{ menuId: ids[0]!, qty: 6 }], "cash");
});

afterEach(async () => {
  cleanup();
  await db.delete();
});

async function saveAll() {
  fireEvent.click(screen.getByRole("button", { name: "Close day" }));
  const dialog = await screen.findByRole("dialog", { name: "Close today?" });
  fireEvent.click(within(dialog).getByRole("button", { name: "Save all" }));
  await waitFor(async () => {
    expect((await db.days.get(DAY))?.closed).toBe(true);
  });
}

describe("Close with the register", () => {
  it("CL-7: prefills leftover from the register and notes a difference neutrally", async () => {
    renderApp({ db, path: "/close", at: EVENING });
    const first = await screen.findByLabelText<HTMLInputElement>(
      "Leftover portions of Menu 1",
    );
    expect(first.value).toBe("4");
    expect(
      screen.getByLabelText<HTMLInputElement>("Leftover portions of Menu 2")
        .value,
    ).toBe("10");
    expect(screen.queryByText(/Register says/)).toBeNull();
    fireEvent.change(first, { target: { value: "3" } });
    expect(
      screen.getByText("Register says 4 left. You entered 3 (difference −1)."),
    ).toBeTruthy();
    await saveAll();
    expect(await db.menuDays.get([DAY, ids[0]!])).toMatchObject({
      leftover: 3,
      estimatedDemand: 7,
    });
  });

  it("CL-8: leftover 0 asks for the time and accepts Don't remember", async () => {
    renderApp({ db, path: "/close", at: EVENING });
    const second = await screen.findByLabelText("Leftover portions of Menu 2");
    fireEvent.change(second, { target: { value: "0" } });
    expect(
      screen.getByLabelText("About what time did Menu 2 run out?"),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Don't remember" }));
    expect(
      screen.getByText("Counted as sold out at closing time."),
    ).toBeTruthy();
    await saveAll();
    expect(await db.menuDays.get([DAY, ids[1]!])).toMatchObject({
      soldOutAt: "14:00",
      soldOutSource: "unknown_time",
      leftover: 0,
    });
  });

  it("CL-9: cancels an automatic sell-out when something is left", async () => {
    await recordSale(
      db,
      DAY,
      "10:30",
      2,
      [{ menuId: ids[0]!, qty: 4 }],
      "cash",
    );
    renderApp({ db, path: "/close", at: EVENING });
    expect(await screen.findByText("Sold out 10:30")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Some left over" }));
    expect(
      screen.getByText("Sell-out mark removed. Enter what is left."),
    ).toBeTruthy();
    expect(
      screen.getByLabelText<HTMLInputElement>("Leftover portions of Menu 1")
        .value,
    ).toBe("1");
    await saveAll();
    const row = await db.menuDays.get([DAY, ids[0]!]);
    expect(row).toMatchObject({ soldOutAt: null, leftover: 1 });
    expect(row?.soldOutSource).toBeUndefined();
    expect(row?.estimatedDemand).toBe(9);
  });

  it("shows revenue from the register in the summary", async () => {
    renderApp({ db, path: "/close", at: EVENING });
    await screen.findByLabelText("Leftover portions of Menu 1");
    fireEvent.click(screen.getByRole("button", { name: "Close day" }));
    const dialog = await screen.findByRole("dialog", { name: "Close today?" });
    expect(within(dialog).getByText("Revenue: Rp 48.000")).toBeTruthy();
  });

  it("CL-10: a closed day can be corrected for 7 days and demand is re-estimated", async () => {
    renderApp({ db, path: "/close", at: EVENING });
    await screen.findByLabelText("Leftover portions of Menu 1");
    await saveAll();
    expect(await screen.findByText("Day closed")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Correct this day" }));
    const field = await screen.findByLabelText<HTMLInputElement>(
      "Leftover portions of Menu 1",
    );
    expect(field.value).toBe("4");
    fireEvent.change(field, { target: { value: "2" } });
    await saveAll();
    await waitFor(async () => {
      expect((await db.menuDays.get([DAY, ids[0]!]))?.leftover).toBe(2);
    });
    expect((await db.menuDays.get([DAY, ids[0]!]))?.estimatedDemand).toBe(8);
  });

  it("offers no correction after 7 days", async () => {
    renderApp({ db, path: "/close", at: EVENING });
    await screen.findByLabelText("Leftover portions of Menu 1");
    await saveAll();
    cleanup();
    renderApp({
      db,
      path: `/close/${DAY}`,
      at: new Date(2026, 2, 10, 20, 0),
    });
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: "Correct this day" }),
      ).toBeNull();
    });
  });

  it("keeps simple mode working with no sales and a manual sell-out", async () => {
    const simple = makeTestDb();
    const simpleIds = await freshStall(simple, "simple");
    await planDay(simple, DAY, simpleIds, 10);
    await setSoldOut(simple, DAY, simpleIds[0]!, "10:00");
    renderApp({ db: simple, path: "/close", at: EVENING });
    const second = await screen.findByLabelText<HTMLInputElement>(
      "Leftover portions of Menu 2",
    );
    expect(second.value).toBe("");
    fireEvent.change(second, { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "Close day" }));
    const dialog = await screen.findByRole("dialog", { name: "Close today?" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save all" }));
    await waitFor(async () => {
      expect((await simple.days.get(DAY))?.closed).toBe(true);
    });
    expect(await simple.sales.count()).toBe(0);
    cleanup();
    await simple.delete();
  });
});
