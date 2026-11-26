// src/components/Splash.tsx
import { useT } from "../i18n/index.ts";
import { Logo } from "./Logo.tsx";

export function Splash() {
  const t = useT();
  return (
    <main id="main" className="welcome" tabIndex={-1}>
      <div className="welcome__card">
        <Logo width={180} />
        <p className="welcome__value">{t("app.valueLine")}</p>
        <span className="welcome__loader" aria-hidden="true" />
        <p role="status" className="visually-hidden">
          {t("app.loading")}
        </p>
      </div>
    </main>
  );
}
