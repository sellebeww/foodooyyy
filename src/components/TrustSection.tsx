// src/components/TrustSection.tsx
import { useT } from "../i18n/index.ts";
import { Button } from "./Button.tsx";
import { FeatureCard } from "./FeatureCard.tsx";
import { ArrowIcon } from "./icons/ArrowIcon.tsx";
import { EyeOffIcon } from "./icons/EyeOffIcon.tsx";
import { LockIcon } from "./icons/LockIcon.tsx";
import { PlanIcon } from "./icons/PlanIcon.tsx";
import { PotIcon } from "./icons/PotIcon.tsx";

export function TrustSection() {
  const t = useT();
  return (
    <section id="trust" className="band" aria-labelledby="landing-trust">
      <div className="band__inner">
        <div className="band__head">
          <p className="eyebrow">{t("landing.nav.trust")}</p>
          <h2 id="landing-trust">{t("landing.trust.title")}</h2>
          <p>{t("landing.trust.lead")}</p>
        </div>
        <ul className="features features--trust">
          <FeatureCard
            icon={<EyeOffIcon />}
            title={t("landing.trust.estimateTitle")}
            body={t("landing.trust.estimateBody")}
          />
          <FeatureCard
            icon={<PotIcon />}
            title={t("landing.trust.simulatedTitle")}
            body={t("landing.trust.simulatedBody")}
          />
          <FeatureCard
            icon={<PlanIcon />}
            title={t("landing.trust.yoursTitle")}
            body={t("landing.trust.yoursBody")}
          />
          <FeatureCard
            icon={<LockIcon />}
            title={t("landing.trust.rulesTitle")}
            body={t("landing.trust.rulesBody")}
          />
        </ul>
        <Button variant="secondary" to="/how" icon={<ArrowIcon />}>
          {t("settings.about.how")}
        </Button>
      </div>
    </section>
  );
}
