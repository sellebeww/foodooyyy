// tests/app/viewTransition.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { runWithViewTransition } from "../../src/app/viewTransition.ts";

function setup(reduced: boolean, supported: boolean) {
  const start = vi.fn((run: () => void) => {
    run();
  });
  window.matchMedia = vi.fn(
    () => ({ matches: reduced }) as MediaQueryList,
  ) as typeof window.matchMedia;
  Object.defineProperty(document, "startViewTransition", {
    configurable: true,
    value: supported ? start : undefined,
  });
  return start;
}

afterEach(() => {
  Reflect.deleteProperty(document, "startViewTransition");
});

describe("runWithViewTransition", () => {
  it.each([
    { reduced: false, supported: true, animated: 1 },
    { reduced: true, supported: true, animated: 0 },
    { reduced: false, supported: false, animated: 0 },
  ])(
    "reduced $reduced, supported $supported: updates once",
    ({ reduced, supported, animated }) => {
      const start = setup(reduced, supported);
      const update = vi.fn();
      runWithViewTransition(update);
      expect(update).toHaveBeenCalledTimes(1);
      expect(start).toHaveBeenCalledTimes(animated);
    },
  );
});
