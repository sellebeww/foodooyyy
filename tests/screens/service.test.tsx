// tests/screens/service.test.tsx
import {
  act,
  cleanup,
  fireEvent,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UNDO_MS } from "../../src/app/toast.ts";
import { LONG_PRESS_MS } from "../../src/components/ServiceTile.tsx";
import { loadDemo, savePlan, setSoldOut } from "../../src/db/repositories.ts";
import type { FoodooDb } from "../../src/db/schema.ts";
import { DEMO_MENUS } from "../../src/demo/generator.ts";
import { renderApp } from "../app/renderApp.tsx";
import { makeTestDb } from "../db/testDb.ts";

vi.mock("../../src/app/registerPwa.ts", () => ({
  registerPwa: () => undefined,
}));

const TODAY = "2026-03-02";
const AT_10_32 = new Date(2026, 2, 2, 10, 32);
let db: FoodooDb;

beforeEach(async () => {
  db = makeTestDb();
  await loadDemo(db, TODAY);
});

afterEach(async () => {
  cleanup();
  await db.delete();
});

async function plan(cooked: Record<string, number> = {}) {
  await savePlan(
    db,
    TODAY,
    DEMO_MENUS.map((menu) => ({
      menuId: menu.id,
      suggestedQty: 40,
      reason: null,
      cookedQty: cooked[menu.id] ?? 40,
    })),
  );
}

async function soldOutAt(menuId: string) {
  return (await db.menuDays.get([TODAY, menuId]))?.soldOutAt;
}

function wait(ms: number) {
  return act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)));
}

describe("Service", () => {
  it("asks to plan first when nothing is planned", async () => {
    renderApp({ db, path: "/service" });
    expect(await screen.findByText("Plan today first")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Plan today's portions" }),
    ).toBeTruthy();
  });

  it("SV-1: shows one large tile per menu cooked today", async () => {
    await plan({ "nasi-uduk": 42, "tempe-orek": 0 });
    renderApp({ db, path: "/service", at: AT_10_32 });
    expect(
      await screen.findByRole("button", {
        name: "Nasi Uduk Cooked 42 Tap when sold out",
      }),
    ).toBeTruthy();
    expect(screen.queryByText("Tempe Orek")).toBeNull();
    expect(screen.getAllByText("Tap when sold out")).toHaveLength(3);
  });

  it("SV-2, SV-3: a tap stores the time, Undo clears it, and the toast lasts 10 seconds", async () => {
    await plan({ "nasi-uduk": 42 });
    renderApp({ db, path: "/service", at: AT_10_32 });
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Nasi Uduk Cooked 42 Tap when sold out",
      }),
    );
    expect(await screen.findByText("Sold out 10:32")).toBeTruthy();
    expect(await soldOutAt("nasi-uduk")).toBe("10:32");
    const toast = screen
      .getByText("Nasi Uduk sold out at 10:32")
      .closest<HTMLElement>(".toast");
    if (toast === null) {
      throw new Error("Toast not found");
    }
    expect(UNDO_MS).toBe(10_000);

    fireEvent.click(within(toast).getByRole("button", { name: "Undo" }));
    expect(await screen.findByText("Sell-out undone")).toBeTruthy();
    expect(await soldOutAt("nasi-uduk")).toBeNull();
    expect(
      await screen.findByRole("button", {
        name: "Nasi Uduk Cooked 42 Tap when sold out",
      }),
    ).toBeTruthy();
  });

  it("asks before storing a sell-out in the first 30 minutes after opening", async () => {
    await plan({ "nasi-uduk": 42 });
    renderApp({ db, path: "/service", at: new Date(2026, 2, 2, 6, 10) });
    const tile = await screen.findByRole("button", {
      name: "Nasi Uduk Cooked 42 Tap when sold out",
    });
    fireEvent.click(tile);
    let dialog = await screen.findByRole("dialog", {
      name: "Nasi Uduk sold out already?",
    });
    expect(
      within(dialog).getByText(/It is 06:10 and you opened at 06:00/),
    ).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(await soldOutAt("nasi-uduk")).toBeNull();

    fireEvent.click(tile);
    dialog = await screen.findByRole("dialog", {
      name: "Nasi Uduk sold out already?",
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Yes, it sold out" }),
    );
    expect(await screen.findByText("Sold out 06:10")).toBeTruthy();
    expect(await soldOutAt("nasi-uduk")).toBe("06:10");
  });

  it("SV-4: a long press or the Edit time button changes the time, within opening hours", async () => {
    await plan();
    await setSoldOut(db, TODAY, "nasi-uduk", "10:32");
    renderApp({ db, path: "/service", at: AT_10_32 });
    const tile = await screen.findByRole("button", {
      name: "Nasi Uduk Sold out 10:32",
    });
    fireEvent.pointerDown(tile, { button: 0 });
    await wait(LONG_PRESS_MS + 100);
    fireEvent.pointerUp(tile);
    fireEvent.click(tile);
    let dialog = await screen.findByRole("dialog", {
      name: "Sold-out time: Nasi Uduk",
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Close dialog" }),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(await soldOutAt("nasi-uduk")).toBe("10:32");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Edit the sold-out time of Nasi Uduk",
      }),
    );
    dialog = await screen.findByRole("dialog", {
      name: "Sold-out time: Nasi Uduk",
    });
    const input = within(dialog).getByLabelText("Time it sold out");
    fireEvent.change(input, { target: { value: "15:00" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));
    expect(
      within(dialog).getByText("Enter a time between 06:00 and 14:00"),
    ).toBeTruthy();
    fireEvent.change(input, { target: { value: "10:15" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Sold out 10:15")).toBeTruthy();
    expect(await soldOutAt("nasi-uduk")).toBe("10:15");
  });

  it("SV-4: Not sold out in the time sheet clears the sell-out", async () => {
    await plan();
    await setSoldOut(db, TODAY, "nasi-uduk", "10:32");
    renderApp({ db, path: "/service", at: AT_10_32 });
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Edit the sold-out time of Nasi Uduk",
      }),
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Not sold out" }),
    );
    expect(await screen.findByText("Marked as not sold out")).toBeTruthy();
    expect(await soldOutAt("nasi-uduk")).toBeNull();
  });

  it("a short tap on a sold-out tile changes nothing, and a closed day is read-only", async () => {
    await plan();
    await setSoldOut(db, TODAY, "nasi-uduk", "10:30");
    const view = renderApp({ db, path: "/service", at: AT_10_32 });
    fireEvent.click(
      await screen.findByRole("button", { name: "Nasi Uduk Sold out 10:30" }),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(await soldOutAt("nasi-uduk")).toBe("10:30");
    view.unmount();

    await db.days.update(TODAY, { closed: true });
    renderApp({ db, path: "/service", at: AT_10_32 });
    expect(
      await screen.findByText(
        "Today is closed. Sell-outs can no longer be changed.",
      ),
    ).toBeTruthy();
    const tile = screen.getByRole("button", {
      name: "Ayam Goreng Cooked 40 Tap when sold out",
    });
    expect((tile as HTMLButtonElement).disabled).toBe(true);
    expect(
      screen.queryByRole("button", {
        name: "Edit the sold-out time of Nasi Uduk",
      }),
    ).toBeNull();
  });
});
