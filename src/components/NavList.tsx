// src/components/NavList.tsx
import { useId, type MouseEvent } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCurrentPhase } from "../app/useCurrentPhase.ts";
import { runWithViewTransition } from "../app/viewTransition.ts";
import { useT } from "../i18n/index.ts";
import { NavIconFor } from "./NavIconFor.tsx";
import type { NavItem } from "./navItems.ts";

interface NavListProps {
  items: readonly NavItem[];
  className: string;
}

export function NavList({ items, className }: NavListProps) {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const phase = useCurrentPhase();
  const nowId = useId();

  function onClick(event: MouseEvent<HTMLAnchorElement>, to: string) {
    const plain =
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey;
    if (!plain || location.pathname === to) {
      return;
    }
    event.preventDefault();
    runWithViewTransition(() => {
      void navigate(to);
    });
  }

  return (
    <ul className={className}>
      {items.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            className="nav-link"
            aria-describedby={item.icon === phase ? nowId : undefined}
            onClick={(event) => {
              onClick(event, item.to);
            }}
          >
            <NavIconFor icon={item.icon} />
            <span className="nav-link__label">{t(item.label)}</span>
            {item.icon === phase ? (
              <span className="nav-link__now" aria-hidden="true">
                {t("today.status.current")}
              </span>
            ) : null}
          </NavLink>
          {item.icon === phase ? (
            <span id={nowId} className="visually-hidden">
              {t("nav.currentStep")}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
