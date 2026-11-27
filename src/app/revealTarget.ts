// src/app/revealTarget.ts
const GAP = 8;
const TALL_SHARE = 0.6;
const TALL_TOP_SHARE = 0.35;

export function revealTarget(node: HTMLElement): void {
  const header = document.querySelector<HTMLElement>(".header");
  const headerRect = header?.getBoundingClientRect();
  const floor =
    headerRect === undefined || headerRect.height === 0
      ? 0
      : headerRect.bottom + GAP;
  const rect = node.getBoundingClientRect();
  const tall = rect.height > window.innerHeight * TALL_SHARE;
  const inView = tall
    ? rect.top >= floor && rect.top <= window.innerHeight * TALL_TOP_SHARE
    : rect.top >= floor && rect.bottom <= window.innerHeight - GAP;
  if (inView) {
    return;
  }
  node.scrollIntoView?.({ block: tall ? "start" : "center" });
  if (floor === 0) {
    return;
  }
  const hidden = node.getBoundingClientRect().top - floor;
  if (hidden < 0) {
    window.scrollBy({ top: hidden });
  }
}
