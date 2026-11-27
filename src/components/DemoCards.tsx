// src/components/DemoCards.tsx
import { DEMO_ENABLED } from "../app/demoConfig.ts";
import { useStartTour } from "../app/useStartTour.ts";
import { useStall } from "../db/hooks.ts";
import { useT } from "../i18n/index.ts";
import { Button } from "./Button.tsx";
import { PlayIcon } from "./icons/PlayIcon.tsx";

export function DemoCards() {
  const t = useT();
  const stall = useStall();
  const startTour = useStartTour();
  if (!DEMO_ENABLED || stall?.settings.isDemo !== true) {
    return null;
  }
  return (
    <div className="demo-cards">
      <section className="card panel" aria-labelledby="today-tour">
        <h2 id="today-tour">{t("tour.card.title")}</h2>
        <p>{t("tour.card.body")}</p>
        <Button variant="secondary" icon={<PlayIcon />} onClick={startTour}>
          {t("tour.start")}
        </Button>
      </section>
      <section className="card panel" aria-labelledby="today-case">
        <h2 id="today-case">{t("case.card.title")}</h2>
        <p>{t("case.card.body")}</p>
        <Button variant="secondary" to="/case">
          {t("case.card.open")}
        </Button>
      </section>
      <section className="card panel" aria-labelledby="today-sim">
        <h2 id="today-sim">{t("sim.title")}</h2>
        <p>{t("sim.cardBody")}</p>
        <Button variant="secondary" to="/simulate">
          {t("sim.open")}
        </Button>
      </section>
    </div>
  );
}
