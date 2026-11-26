// src/components/SiteFooter.tsx
import { Link } from "react-router-dom";
import { README_URL } from "../app/links.ts";
import { useT } from "../i18n/index.ts";
import { Logo } from "./Logo.tsx";

export function SiteFooter() {
  const t = useT();
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <Logo width={96} />
        <div className="site-footer__text">
          <p>{t("landing.footerNote")}</p>
          <p>{t("settings.about.version", { version: __APP_VERSION__ })}</p>
        </div>
        <nav aria-label={t("landing.footerLinks")}>
          <ul>
            <li>
              <Link className="link-target" to="/how">
                {t("settings.about.how")}
              </Link>
            </li>
            <li>
              <a
                className="link-target"
                href={README_URL}
                target="_blank"
                rel="noreferrer"
              >
                {t("settings.about.link")}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
