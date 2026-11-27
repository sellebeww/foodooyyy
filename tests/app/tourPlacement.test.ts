// tests/app/tourPlacement.test.ts
import { afterEach, describe, expect, it } from "vitest";
import { findTarget } from "../../src/app/findTarget.ts";
import { placeCard, type Box } from "../../src/app/placeCard.ts";

afterEach(() => {
  document.body.innerHTML = "";
});

function link(className: string, shown: boolean): HTMLElement {
  const node = document.createElement("a");
  node.className = className;
  node.getClientRects = () => (shown ? [new DOMRect()] : []) as never;
  document.body.append(node);
  return node;
}

describe("findTarget", () => {
  it("passes over a hidden match and takes the next selector that is shown", () => {
    link("tab", false);
    const side = link("side", true);
    expect(findTarget([".tab", ".side"])).toBe(side);
  });

  it("returns null when nothing is shown", () => {
    link("tab", false);
    expect(findTarget([".tab", ".missing"])).toBeNull();
  });
});

const CARD = { width: 336, height: 200 };
const PHONE = { width: 360, height: 740 };
const DESKTOP = { width: 1280, height: 800 };

function overlaps(box: Box, spot: { top: number; left: number }): boolean {
  return (
    spot.left < box.left + box.width &&
    box.left < spot.left + CARD.width &&
    spot.top < box.top + box.height &&
    box.top < spot.top + CARD.height
  );
}

describe("placeCard", () => {
  it.each([
    ["a card near the top", { top: 100, left: 10, width: 340, height: 200 }],
    [
      "a button near the bottom",
      { top: 580, left: 210, width: 120, height: 60 },
    ],
    ["a tab bar item", { top: 660, left: 140, width: 78, height: 74 }],
  ])("stays on screen and clear of %s on a phone", (_, box) => {
    const spot = placeCard(box, CARD, PHONE);
    expect(overlaps(box, spot)).toBe(false);
    expect(spot.left).toBeGreaterThanOrEqual(0);
    expect(spot.left + CARD.width).toBeLessThanOrEqual(PHONE.width);
    expect(spot.top).toBeGreaterThanOrEqual(0);
    expect(spot.top + CARD.height).toBeLessThanOrEqual(PHONE.height);
  });

  it("sits beside a sidebar link on desktop", () => {
    const box = { top: 150, left: 10, width: 244, height: 60 };
    const spot = placeCard(box, CARD, DESKTOP);
    expect(spot.left).toBeGreaterThanOrEqual(box.left + box.width);
    expect(overlaps(box, spot)).toBe(false);
  });

  it("centres under a target in the middle of a desktop screen", () => {
    const box = { top: 100, left: 600, width: 200, height: 100 };
    const spot = placeCard(box, CARD, DESKTOP);
    expect(spot.left).toBe(600 + 100 - CARD.width / 2);
    expect(spot.top).toBeGreaterThan(box.top + box.height);
  });

  it("falls back to the bottom edge when the target leaves no room", () => {
    const box = { top: 20, left: 10, width: 340, height: 300 };
    const spot = placeCard(box, CARD, { width: 360, height: 360 });
    expect(spot.top + CARD.height).toBeLessThanOrEqual(360);
    expect(spot.top).toBeGreaterThanOrEqual(0);
  });
});
