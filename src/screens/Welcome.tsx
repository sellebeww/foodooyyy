// src/screens/Welcome.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useScreenArrival } from "../app/useScreenArrival.ts";
import { Button } from "../components/Button.tsx";
import { EntryActions } from "../components/EntryActions.tsx";
import { DemoBand } from "../components/DemoBand.tsx";
import { EcosystemSection } from "../components/EcosystemSection.tsx";
import { DemandExplorer } from "../components/DemandExplorer.tsx";
import { HeroLoop } from "../components/HeroLoop.tsx";
import { FeatureCard } from "../components/FeatureCard.tsx";
import { ArrowIcon } from "../components/icons/ArrowIcon.tsx";
import { ClockIcon } from "../components/icons/ClockIcon.tsx";
import { CloseIcon } from "../components/icons/CloseIcon.tsx";
import { EyeOffIcon } from "../components/icons/EyeOffIcon.tsx";
import { LockIcon } from "../components/icons/LockIcon.tsx";
import { PlanIcon } from "../components/icons/PlanIcon.tsx";
import { PotIcon } from "../components/icons/PotIcon.tsx";
import { ServiceIcon } from "../components/icons/ServiceIcon.tsx";
import { TodayIcon } from "../components/icons/TodayIcon.tsx";
import { WifiOffIcon } from "../components/icons/WifiOffIcon.tsx";
import { OfflinePill } from "../components/OfflinePill.tsx";
import { ScreenPreview } from "../components/ScreenPreview.tsx";
import { SiteFooter } from "../components/SiteFooter.tsx";
import { SiteHeader } from "../components/SiteHeader.tsx";
import { TeamSection } from "../components/TeamSection.tsx";
import { TrustSection } from "../components/TrustSection.tsx";
import { useT } from "../i18n/index.ts";

export function Welcome() {
  const t = useT();
  const { hash } = useLocation();

  useScreenArrival(t("landing.pageTitle"));

  useEffect(() => {
    if (window.location.hash !== "") {
      document
        .getElementById(window.location.hash.slice(1))
        ?.scrollIntoView?.();
    }
  }, [hash]);

  return (
    <div className="site">
      <SiteHeader />
      <main id="main" className="landing" tabIndex={-1}>
        <section className="hero" aria-labelledby="landing-title">
          <HeroLoop />
          <div className="hero__inner">
            <div className="hero__copy">
              <p className="eyebrow">{t("landing.eyebrow")}</p>
              <h1 id="landing-title" className="hero__title" tabIndex={-1}>
                {t("landing.headline")}{" "}
                <span className="hero__accent">
                  {t("landing.headlineAccent")}
                </span>
              </h1>
              <p className="hero__lead">{t("app.valueLine")}</p>
              <EntryActions className="entry--hero" />
              <ul className="hero__pills">
                <li>
                  <WifiOffIcon />
                  {t("landing.pillOffline")}
                </li>
                <li>
                  <TodayIcon />
                  {t("landing.pillNoAccount")}
                </li>
                <li>
                  <LockIcon />
                  {t("landing.pillLocal")}
                </li>
              </ul>
              <OfflinePill />
            </div>
            <DemandExplorer />
          </div>
        </section>

        <section
          id="problem"
          className="band"
          aria-labelledby="landing-problem"
        >
          <div className="band__inner">
            <div className="band__head">
              <p className="eyebrow">{t("landing.nav.problem")}</p>
              <h2 id="landing-problem">{t("landing.problemTitle")}</h2>
              <p>{t("landing.problemLead")}</p>
            </div>
            <ul className="features features--problem">
              <FeatureCard
                icon={<PotIcon />}
                title={t("landing.problemWasteTitle")}
                body={t("landing.problemWasteBody")}
              />
              <FeatureCard
                icon={<ClockIcon />}
                title={t("landing.problemEarlyTitle")}
                body={t("landing.problemEarlyBody")}
              />
              <FeatureCard
                icon={<EyeOffIcon />}
                title={t("landing.problemHiddenTitle")}
                body={t("landing.problemHiddenBody")}
              />
            </ul>
          </div>
        </section>

        <section
          id="loop"
          className="band band--dark"
          aria-labelledby="landing-loop"
        >
          <div className="band__inner">
            <div className="band__head">
              <p className="eyebrow">{t("landing.nav.loop")}</p>
              <h2 id="landing-loop">{t("landing.loopTitle")}</h2>
              <p>{t("landing.loopLead")}</p>
            </div>
            <ol className="features features--loop">
              <FeatureCard
                step={1}
                icon={<PlanIcon />}
                title={t("landing.loopPlanTitle")}
                body={t("landing.loopPlanBody")}
              />
              <FeatureCard
                step={2}
                icon={<ServiceIcon />}
                title={t("landing.loopServiceTitle")}
                body={t("landing.loopServiceBody")}
              />
              <FeatureCard
                step={3}
                icon={<CloseIcon />}
                title={t("landing.loopCloseTitle")}
                body={t("landing.loopCloseBody")}
              />
              <FeatureCard
                step={4}
                icon={<TodayIcon />}
                title={t("landing.loopNextTitle")}
                body={t("landing.loopNextBody")}
              />
            </ol>
          </div>
        </section>

        <section className="band" aria-labelledby="landing-example">
          <div className="band__inner">
            <div className="band__head">
              <p className="eyebrow">{t("landing.seeEyebrow")}</p>
              <h2 id="landing-example">{t("landing.exampleTitle")}</h2>
              <p>{t("landing.seeLead")}</p>
            </div>
            <ScreenPreview />
            <Button variant="secondary" to="/how" icon={<ArrowIcon />}>
              {t("settings.about.how")}
            </Button>
          </div>
        </section>

        <EcosystemSection />

        <DemoBand />

        <section className="band band--paper" aria-labelledby="landing-why">
          <div className="band__inner">
            <div className="band__head">
              <p className="eyebrow">{t("landing.whyEyebrow")}</p>
              <h2 id="landing-why">{t("landing.whyTitle")}</h2>
            </div>
            <ul className="features features--why">
              <FeatureCard
                icon={<EyeOffIcon />}
                title={t("landing.whyHiddenTitle")}
                body={t("landing.whyHiddenBody")}
              />
              <FeatureCard
                icon={<PlanIcon />}
                title={t("landing.whyRulesTitle")}
                body={t("landing.whyRulesBody")}
              />
              <FeatureCard
                icon={<WifiOffIcon />}
                title={t("landing.whyOfflineTitle")}
                body={t("landing.whyOfflineBody")}
              />
              <FeatureCard
                icon={<LockIcon />}
                title={t("landing.whyPrivateTitle")}
                body={t("landing.whyPrivateBody")}
              />
            </ul>
          </div>
        </section>

        <TrustSection />

        <TeamSection />

        <section className="band" aria-labelledby="landing-closing">
          <div className="band__inner">
            <div className="closing">
              <h2 id="landing-closing">{t("landing.closingTitle")}</h2>
              <p>{t("landing.closingBody")}</p>
              <EntryActions className="entry--closing" />
              <p className="closing__hint">{t("landing.installHint")}</p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
