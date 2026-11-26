// src/components/navItems.ts
import type { MessageKey } from "../i18n/index.ts";

export type NavIcon =
  "today" | "plan" | "service" | "close" | "history" | "settings";

export interface NavItem {
  to: string;
  label: MessageKey;
  icon: NavIcon;
}

export const LOOP_NAV: readonly NavItem[] = [
  { to: "/today", label: "nav.today", icon: "today" },
  { to: "/plan", label: "nav.plan", icon: "plan" },
  { to: "/service", label: "nav.service", icon: "service" },
  { to: "/close", label: "nav.close", icon: "close" },
];

export const HISTORY_NAV: NavItem = {
  to: "/history",
  label: "nav.history",
  icon: "history",
};

export const SETTINGS_NAV: NavItem = {
  to: "/settings",
  label: "nav.settings",
  icon: "settings",
};
