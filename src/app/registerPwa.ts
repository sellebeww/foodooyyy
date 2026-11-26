// src/app/registerPwa.ts
import { registerSW } from "virtual:pwa-register";

export function registerPwa(onOfflineReady: () => void): void {
  registerSW({ immediate: true, onOfflineReady });
}
