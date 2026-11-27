// src/app/findTarget.ts
export function findTarget(selectors: readonly string[]): HTMLElement | null {
  for (const selector of selectors) {
    const shown = Array.from(
      document.querySelectorAll<HTMLElement>(selector),
    ).find((node) => node.getClientRects().length > 0);
    if (shown !== undefined) {
      return shown;
    }
  }
  return null;
}
