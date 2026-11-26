// src/components/Header.tsx
import { Link } from "react-router-dom";
import { useStallStamp } from "../app/useStallStamp.ts";
import { useStall } from "../db/hooks.ts";
import { formatLongDate } from "../i18n/format.ts";
import { useI18n } from "../i18n/index.ts";
import { AppIcon } from "./AppIcon.tsx";
import { OfflinePill } from "./OfflinePill.tsx";
import { Sticker } from "./Sticker.tsx";
import { SettingsIcon } from "./icons/SettingsIcon.tsx";

interface HeaderProps {
  title: string;
  showSettings?: boolean;
}

export function Header({ title, showSettings = true }: HeaderProps) {
  const { t, language } = useI18n();
  const stall = useStall();
  const { date } = useStallStamp();
  const isDemo = stall?.settings.isDemo === true;
  return (
    <header className="header">
      <div className="header__row">
        <AppIcon size={40} />
        <div className="header__titles">
          <h1 className="header__title" tabIndex={-1}>
            {title}
          </h1>
          <p className="header__date">{formatLongDate(date, language)}</p>
        </div>
        {isDemo ? <Sticker>{t("header.demo")}</Sticker> : null}
        {showSettings ? (
          <Link
            to="/settings"
            className="icon-btn header__settings"
            aria-label={t("nav.settings")}
          >
            <SettingsIcon />
          </Link>
        ) : null}
      </div>
      <OfflinePill />
    </header>
  );
}
