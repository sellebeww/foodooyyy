// tests/app/toast.test.tsx
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UNDO_MS, useToast } from "../../src/app/toast.ts";
import { ToastProvider } from "../../src/app/ToastProvider.tsx";

function Trigger({ onUndo }: { onUndo: () => void }) {
  const toast = useToast();
  return (
    <button
      type="button"
      onClick={() => {
        toast.show("Nasi Uduk sold out at 10:32", {
          actionLabel: "Undo",
          onAction: onUndo,
          durationMs: UNDO_MS,
        });
      }}
    >
      Mark
    </button>
  );
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("ToastProvider", () => {
  it("SV-3: keeps the Undo toast for exactly 10 seconds", () => {
    render(
      <ToastProvider>
        <Trigger onUndo={() => undefined} />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Mark" }));
    act(() => {
      vi.advanceTimersByTime(UNDO_MS - 1);
    });
    expect(screen.getByRole("button", { name: "Undo" })).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByRole("button", { name: "Undo" })).toBeNull();
  });

  it("keeps the Undo toast when a background notice arrives", () => {
    function Notice() {
      const toast = useToast();
      return (
        <button
          type="button"
          onClick={() => {
            toast.show("Ready to work offline.", { background: true });
          }}
        >
          Notice
        </button>
      );
    }
    render(
      <ToastProvider>
        <Trigger onUndo={() => undefined} />
        <Notice />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Mark" }));
    fireEvent.click(screen.getByRole("button", { name: "Notice" }));
    expect(screen.getByRole("button", { name: "Undo" })).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(UNDO_MS);
    });
    fireEvent.click(screen.getByRole("button", { name: "Notice" }));
    expect(screen.getByText("Ready to work offline.")).toBeTruthy();
  });

  it("runs the action once and closes the toast when Undo is pressed", () => {
    const onUndo = vi.fn();
    render(
      <ToastProvider>
        <Trigger onUndo={onUndo} />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Mark" }));
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Nasi Uduk sold out at 10:32")).toBeNull();
  });
});
