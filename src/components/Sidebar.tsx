// src/components/Sidebar.tsx
import { Link } from "react-router-dom";
import { DEMO_ENABLED } from "../app/demoConfig.ts";
import { useStartTour } from "../app/useStartTour.ts";
import { useStall } from "../db/hooks.ts";
import { useT } from "../i18n/index.ts";
import { AppIcon } from "./AppIcon.tsx";
import { ArrowIcon } from "./icons/ArrowIcon.tsx";
import { PlayIcon } from "./icons/PlayIcon.tsx";
import { NavList } from "./NavList.tsx";
import { HISTORY_NAV, LOOP_NAV, SETTINGS_NAV } from "./navItems.ts";

export function Sidebar() {
  const t = useT();
  const stall = useStall();
  const startTour = useStartTour();
  const tutorial = DEMO_ENABLED && stall?.settings.isDemo === true;
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
      {tutorial ? (
        <button type="button" className="sidebar__tour" onClick={startTour}>
          <PlayIcon />
          <span>{t("nav.tutorial")}</span>
        </button>
      ) : null}
      <Link className="sidebar__about" to="/">
        <span>{t("settings.about.landing")}</span>
        <ArrowIcon />
      </Link>
    </nav>
  );
}
