// src/app/placeCard.ts
export interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface Size {
  width: number;
  height: number;
}

const GAP = 12;

function clamp(value: number, max: number): number {
  return Math.max(GAP, Math.min(value, max));
}

export function placeCard(
  box: Box,
  card: Size,
  viewport: Size,
): { top: number; left: number } {
  const right = box.left + box.width;
  const lowest = viewport.height - card.height - GAP;
  const furthest = viewport.width - card.width - GAP;
  if (right <= viewport.width / 4 && right + GAP <= furthest) {
    return { top: clamp(box.top, lowest), left: right + GAP };
  }
  const left = clamp(box.left + (box.width - card.width) / 2, furthest);
  const below = box.top + box.height + GAP;
  if (below <= lowest) {
    return { top: below, left };
  }
  const above = box.top - GAP - card.height;
  return { top: above >= GAP ? above : clamp(lowest, lowest), left };
}
