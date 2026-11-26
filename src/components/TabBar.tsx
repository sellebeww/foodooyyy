// src/components/TabBar.tsx
import { useT } from "../i18n/index.ts";
import { NavList } from "./NavList.tsx";
import { HISTORY_NAV, LOOP_NAV } from "./navItems.ts";

export function TabBar() {
  const t = useT();
  return (
    <nav className="tab-bar" aria-label={t("nav.main")}>
      <NavList items={[...LOOP_NAV, HISTORY_NAV]} className="tab-bar__list" />
    </nav>
  );
}
