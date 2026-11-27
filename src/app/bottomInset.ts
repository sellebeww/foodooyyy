// src/app/bottomInset.ts
const PINNED = ".tab-bar, .action-bar";
const EDGE = 40;

export function bottomInset(): number {
  const viewport = window.innerHeight;
  let top = viewport;
  for (const bar of document.querySelectorAll<HTMLElement>(PINNED)) {
    const rect = bar.getBoundingClientRect();
    if (
      rect.height > 0 &&
      rect.bottom >= viewport - EDGE &&
      rect.top > viewport / 2
    ) {
      top = Math.min(top, rect.top);
    }
  }
  return viewport - top;
}
