// src/components/EcosystemSection.tsx
import { useT, type MessageKey } from "../i18n/index.ts";
import { ArrowIcon } from "./icons/ArrowIcon.tsx";

const PARTS: readonly {
  title: MessageKey;
  body: MessageKey;
  out: MessageKey;
}[] = [
  {
    title: "landing.eco.setupTitle",
    body: "landing.eco.setupBody",
    out: "landing.eco.setupOut",
  },
  {
    title: "landing.eco.planTitle",
    body: "landing.eco.planBody",
    out: "landing.eco.planOut",
  },
  {
    title: "landing.eco.serviceTitle",
    body: "landing.eco.serviceBody",
    out: "landing.eco.serviceOut",
  },
  {
    title: "landing.eco.closeTitle",
    body: "landing.eco.closeBody",
    out: "landing.eco.closeOut",
  },
  {
    title: "landing.eco.historyTitle",
    body: "landing.eco.historyBody",
    out: "landing.eco.historyOut",
  },
];

export function EcosystemSection() {
  const t = useT();
  return (
    <section
      id="ecosystem"
      className="band band--paper"
      aria-labelledby="landing-eco"
    >
      <div className="band__inner">
        <div className="band__head">
          <p className="eyebrow">{t("landing.nav.ecosystem")}</p>
          <h2 id="landing-eco">{t("landing.eco.title")}</h2>
          <p>{t("landing.eco.lead")}</p>
        </div>
        <ol className="eco">
          {PARTS.map((part, index) => (
            <li key={part.title} className="eco__item">
              <span className="eco__num num" aria-hidden="true">
                {index + 1}
              </span>
              <h3>{t(part.title)}</h3>
              <p>{t(part.body)}</p>
              <p className="eco__out">
                <ArrowIcon />
                <span>
                  <strong>{t("landing.eco.passes")}</strong> {t(part.out)}
                </span>
              </p>
            </li>
          ))}
        </ol>
        <p className="eco__loop">{t("landing.eco.loop")}</p>
      </div>
    </section>
  );
}
