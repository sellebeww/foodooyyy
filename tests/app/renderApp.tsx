// tests/app/renderApp.tsx
import { render, type RenderResult } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { App } from "../../src/app/App.tsx";
import { AppProviders } from "../../src/app/AppProviders.tsx";
import { ENTRY_KEY } from "../../src/app/entry.ts";
import type { FoodooDb } from "../../src/db/schema.ts";

export const MONDAY_9AM = new Date(2026, 2, 2, 9, 0);

export function memoryStorage(): Storage {
  const items = new Map<string, string>();
  return {
    get length() {
      return items.size;
    },
    clear: () => {
      items.clear();
    },
    getItem: (key) => items.get(key) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    removeItem: (key) => {
      items.delete(key);
    },
    setItem: (key, value) => {
      items.set(key, value);
    },
  };
}

interface RenderOptions {
  db: FoodooDb;
  path?: string;
  at?: Date;
  now?: () => Date;
  storage?: Storage;
  entered?: boolean;
}

export function renderApp({
  db,
  path = "/",
  at = MONDAY_9AM,
  now: clock,
  storage = memoryStorage(),
  entered = true,
}: RenderOptions): RenderResult {
  if (entered) {
    window.sessionStorage.setItem(ENTRY_KEY, "1");
  } else {
    window.sessionStorage.removeItem(ENTRY_KEY);
  }
  const now = clock ?? (() => new Date(at.getTime()));
  return render(
    <MemoryRouter
      initialEntries={[path]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AppProviders db={db} now={now} storage={storage}>
        <App />
      </AppProviders>
    </MemoryRouter>,
  );
}
