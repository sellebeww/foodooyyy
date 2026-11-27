// src/components/Sidebar.tsx
import { Link } from "react-router-dom";
import { useT } from "../i18n/index.ts";
import { AppIcon } from "./AppIcon.tsx";
import { ArrowIcon } from "./icons/ArrowIcon.tsx";
import { NavList } from "./NavList.tsx";
import { HISTORY_NAV, LOOP_NAV, SETTINGS_NAV } from "./navItems.ts";

export function Sidebar() {
  const t = useT();
  return (
    <nav className="sidebar" aria-label={t("nav.main")}>
      <Link className="brand" to="/today">
        <AppIcon size={40} />
        <span>{t("app.name")}</span>
      </Link>
      <NavList
        items={[...LOOP_NAV, HISTORY_NAV, SETTINGS_NAV]}
        className="sidebar__list"
      />
      <Link className="sidebar__about" to="/">
        <span>{t("settings.about.landing")}</span>
        <ArrowIcon />
      </Link>
    </nav>
  );
}
