// src/components/DemoBand.tsx
import { DEMO_ENABLED } from "../app/demoConfig.ts";
import { useT } from "../i18n/index.ts";
import { EntryActions } from "./EntryActions.tsx";
import { FeatureCard } from "./FeatureCard.tsx";
import { PlanIcon } from "./icons/PlanIcon.tsx";
import { PlayIcon } from "./icons/PlayIcon.tsx";
import { ServiceIcon } from "./icons/ServiceIcon.tsx";

export function DemoBand() {
  const t = useT();
  if (!DEMO_ENABLED) {
    return null;
  }
  return (
    <section id="demo" className="band band--try" aria-labelledby="landing-try">
      <div className="band__inner">
        <div className="band__head">
          <p className="eyebrow">{t("landing.try.eyebrow")}</p>
          <h2 id="landing-try">{t("landing.try.title")}</h2>
          <p>{t("landing.try.lead")}</p>
        </div>
        <ol className="features features--try">
          <FeatureCard
            step={1}
            icon={<PlayIcon />}
            title={t("landing.try.openTitle")}
            body={t("landing.try.openBody")}
          />
          <FeatureCard
            step={2}
            icon={<PlanIcon />}
            title={t("landing.try.tourTitle")}
            body={t("landing.try.tourBody")}
          />
          <FeatureCard
            step={3}
            icon={<ServiceIcon />}
            title={t("landing.try.freeTitle")}
            body={t("landing.try.freeBody")}
          />
        </ol>
        <EntryActions className="entry--band" />
      </div>
    </section>
  );
}
