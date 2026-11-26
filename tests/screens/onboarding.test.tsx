// tests/screens/onboarding.test.tsx
import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getStall } from "../../src/db/repositories.ts";
import type { FoodooDb } from "../../src/db/schema.ts";
import { renderApp } from "../app/renderApp.tsx";
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

function field(label: string): HTMLElement {
  return screen.getByLabelText(label);
}

async function addMenu(values: {
  name: string;
  price: string;
  cost: string;
  usual: string;
}) {
  fireEvent.click(await screen.findByRole("button", { name: "Add menu" }));
  const dialog = await screen.findByRole("dialog", { name: "Add menu" });
  fireEvent.change(within(dialog).getByLabelText("Menu name"), {
    target: { value: values.name },
  });
  fireEvent.change(within(dialog).getByLabelText("Selling price (Rp)"), {
    target: { value: values.price },
  });
  fireEvent.change(within(dialog).getByLabelText("Cost per portion (Rp)"), {
    target: { value: values.cost },
  });
  fireEvent.change(within(dialog).getByLabelText("Usual portions per day"), {
    target: { value: values.usual },
  });
  fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));
  return dialog;
}

describe("onboarding", () => {
  it("ON-1: with no data the app opens on Welcome with both options", async () => {
    renderApp({ db });
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /Cook the right amount/,
      }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Start setup" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Try demo stall" })).toBeTruthy();
  });

  it("ON-2: a cost at or above the price shows an inline error and blocks saving", async () => {
    renderApp({ db });
    fireEvent.click(await screen.findByRole("button", { name: "Start setup" }));
    expect(await screen.findByText("Step 1 of 2")).toBeTruthy();

    const dialog = await addMenu({
      name: "Nasi Uduk",
      price: "8000",
      cost: "8000",
      usual: "40",
    });
    expect(
      await within(dialog).findByText("Cost must be lower than price"),
    ).toBeTruthy();
    expect(
      within(dialog)
        .getByLabelText("Cost per portion (Rp)")
        .getAttribute("aria-invalid"),
    ).toBe("true");
    expect(await db.menus.count()).toBe(0);

    fireEvent.change(within(dialog).getByLabelText("Cost per portion (Rp)"), {
      target: { value: "4.500" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Nasi Uduk")).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect((await db.menus.toArray())[0]).toMatchObject({
      name: "Nasi Uduk",
      price: 8000,
      cost: 4500,
      usualQty: 40,
    });
    expect(
      screen.getByText("Rp 8.000 · cost Rp 4.500 · usual 40 portions"),
    ).toBeTruthy();
  });

  it("asks for at least one menu before step 2", async () => {
    renderApp({ db });
    fireEvent.click(await screen.findByRole("button", { name: "Start setup" }));
    fireEvent.click(await screen.findByRole("button", { name: "Next" }));
    expect((await screen.findByRole("alert")).textContent).toBe(
      "Add at least one menu to continue.",
    );
  });

  it("ON-3, ON-4: validates hours, cycles busy levels, finishes and reopens on Today", async () => {
    const view = renderApp({ db });
    fireEvent.click(await screen.findByRole("button", { name: "Start setup" }));
    await addMenu({
      name: "Tempe Orek",
      price: "4000",
      cost: "1500",
      usual: "28",
    });
    await screen.findByText("Tempe Orek");
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText("Step 2 of 2")).toBeTruthy();

    const cell = await screen.findByRole("button", { name: "06:00 Normal" });
    fireEvent.click(cell);
    expect(screen.getByRole("button", { name: "06:00 Busy" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "06:00 Busy" }));
    expect(screen.getByRole("button", { name: "06:00 Quiet" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /Normal$/ })).toHaveLength(7);

    fireEvent.change(field("Closing time"), { target: { value: "06:00" } });
    fireEvent.click(screen.getByRole("button", { name: "Finish setup" }));
    expect(
      await screen.findByText(
        "Closing time must be different from opening time",
      ),
    ).toBeTruthy();
    expect((await getStall(db))?.setupComplete).toBe(false);

    fireEvent.change(field("Closing time"), { target: { value: "12:00" } });
    expect(screen.getAllByRole("button", { name: /^\d\d:00 / })).toHaveLength(
      6,
    );
    fireEvent.click(screen.getByRole("button", { name: "Finish setup" }));
    expect(
      await screen.findByRole("heading", { level: 1, name: "Today" }),
    ).toBeTruthy();
    const stall = await getStall(db);
    expect(stall?.setupComplete).toBe(true);
    expect(stall?.settings).toMatchObject({
      openAt: "06:00",
      closeAt: "12:00",
      busyProfile: { "06": 1, "07": 2, "11": 2 },
      isDemo: false,
    });

    view.unmount();
    renderApp({ db });
    expect(
      await screen.findByRole("heading", { level: 1, name: "Today" }),
    ).toBeTruthy();
  });
});
