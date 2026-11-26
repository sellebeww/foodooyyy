// src/components/SiteHeader.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useT, type MessageKey } from "../i18n/index.ts";
import { AppIcon } from "./AppIcon.tsx";
import { CloseXIcon } from "./icons/CloseXIcon.tsx";
import { MenuIcon } from "./icons/MenuIcon.tsx";
import { LanguageSwitch } from "./LanguageSwitch.tsx";

const SECTIONS: readonly { id: string; label: MessageKey }[] = [
  { id: "problem", label: "landing.nav.problem" },
  { id: "loop", label: "landing.nav.loop" },
  { id: "demo", label: "landing.nav.demo" },
  { id: "team", label: "landing.nav.team" },
];

interface SiteHeaderProps {
  complete: boolean;
  showDemo: boolean;
}

export function SiteHeader({ complete, showDemo }: SiteHeaderProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const sections = SECTIONS.filter((item) => showDemo || item.id !== "demo");
  return (
    <header
      className="site-header"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
        }
      }}
    >
      <div className="site-header__inner">
        <a className="brand" href="#main">
          <AppIcon size={36} />
          <span>{t("app.name")}</span>
        </a>
        <nav
          id="site-nav"
          className={open ? "site-nav site-nav--open" : "site-nav"}
          aria-label={t("landing.nav.label")}
        >
          <ul>
            {sections.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  {t(item.label)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <LanguageSwitch compact />
        {complete ? (
          <Link className="btn btn--primary site-header__cta" to="/today">
            {t("landing.nav.openApp")}
          </Link>
        ) : showDemo ? (
          <a className="btn btn--primary site-header__cta" href="#demo">
            {t("landing.nav.seeDemo")}
          </a>
        ) : null}
        <button
          type="button"
          className="icon-btn site-header__menu"
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label={t("landing.nav.menu")}
          onClick={() => {
            setOpen(!open);
          }}
        >
          {open ? <CloseXIcon /> : <MenuIcon />}
        </button>
      </div>
    </header>
  );
}
