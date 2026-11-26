// src/app/demoConfig.ts
import { parseDemoEnabled } from "../demo/catalog.ts";

export const DEMO_ENABLED = parseDemoEnabled(import.meta.env.VITE_DEMO);
