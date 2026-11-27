// src/app/entry.ts
export const ENTRY_KEY = "foodoo.entered";

function session(): Storage | undefined {
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
}

export function hasEntered(): boolean {
  try {
    return session()?.getItem(ENTRY_KEY) === "1";
  } catch {
    return false;
  }
}

export function markEntered(): void {
  try {
    session()?.setItem(ENTRY_KEY, "1");
  } catch {
    return;
  }
}
