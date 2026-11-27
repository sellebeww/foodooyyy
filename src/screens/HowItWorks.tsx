// src/screens/HowItWorks.tsx
import { Button } from "../components/Button.tsx";
import { HowDemandLab } from "../components/HowDemandLab.tsx";
import { HowSuggestLab } from "../components/HowSuggestLab.tsx";
import { Screen } from "../components/Screen.tsx";
import { SuggestionCheckPanel } from "../components/SuggestionCheckPanel.tsx";
import { useT, type MessageKey } from "../i18n/index.ts";

const STEPS: readonly { id: string; label: MessageKey }[] = [
  { id: "how-inputs", label: "how.nav.inputs" },
  { id: "how-sources", label: "how.nav.sources" },
  { id: "how-demand", label: "how.nav.demand" },
  { id: "how-suggest", label: "how.nav.suggest" },
  { id: "how-result", label: "how.nav.result" },
  { id: "how-accuracy", label: "how.nav.accuracy" },
];

const INPUTS: readonly { title: MessageKey; body: MessageKey }[] = [
  { title: "how.input.menusTitle", body: "how.input.menusBody" },
  { title: "how.input.hoursTitle", body: "how.input.hoursBody" },
  { title: "how.input.nightTitle", body: "how.input.nightBody" },
  { title: "how.input.unusualTitle", body: "how.input.unusualBody" },
];

const SOURCES: readonly {
  name: MessageKey;
  from: MessageKey;
  entered: boolean;
}[] = [
  { name: "how.source.cooked", from: "how.source.cookedFrom", entered: true },
  { name: "how.source.soldOut", from: "how.source.soldOutFrom", entered: true },
  {
    name: "how.source.leftover",
    from: "how.source.leftoverFrom",
    entered: true,
  },
  {
    name: "how.source.demand",
    from: "how.source.demandFrom",
    entered: false,
  },
  {
    name: "how.source.suggestion",
    from: "how.source.suggestionFrom",
    entered: false,
  },
  { name: "how.source.money", from: "how.source.moneyFrom", entered: false },
];

const AFFECT: readonly MessageKey[] = [
  "how.affect1",
  "how.affect2",
  "how.affect3",
  "how.affect4",
  "how.affect5",
];

const IMPROVE: readonly MessageKey[] = [
  "how.improve1",
  "how.improve2",
  "how.improve3",
  "how.improve4",
];

export function HowItWorks() {
  const t = useT();
  return (
    <Screen title={t("how.title")} showSettings={false}>
      <div className="how-intro">
        <p>{t("how.intro")}</p>
        <p className="note note--info">{t("how.exampleNote")}</p>
        <nav className="how-nav" aria-label={t("how.nav.label")}>
          <ol className="how-nav__list">
            {STEPS.map((step, index) => (
              <li key={step.id}>
                <a className="how-nav__link" href={`#${step.id}`}>
                  <span className="how-nav__num" aria-hidden="true">
                    {index + 1}
                  </span>
                  {t(step.label)}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <section className="card how" aria-labelledby="how-inputs">
        <h2 id="how-inputs">{t("how.inputsTitle")}</h2>
        <p>{t("how.inputsLead")}</p>
        <ul className="how-inputs">
          {INPUTS.map((input) => (
            <li key={input.title} className="how-inputs__item">
              <h3>{t(input.title)}</h3>
              <p>{t(input.body)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="card how" aria-labelledby="how-sources">
        <h2 id="how-sources">{t("how.sourcesTitle")}</h2>
        <p>{t("how.sourcesLead")}</p>
        <ul className="how-sources">
          {SOURCES.map((source) => (
            <li key={source.name} className="how-sources__item">
              <h3>{t(source.name)}</h3>
              <p>{t(source.from)}</p>
              <span
                className={
                  source.entered
                    ? "how-sources__kind how-sources__kind--entered"
                    : "how-sources__kind"
                }
              >
                {t(source.entered ? "how.kind.entered" : "how.kind.calculated")}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="how-grid">
        <HowDemandLab />
        <HowSuggestLab />
      </div>

      <section className="card how" aria-labelledby="how-result">
        <h2 id="how-result">{t("how.resultTitle")}</h2>
        <p>{t("how.resultBody")}</p>
        <p>{t("how.resultMore")}</p>
        <p>{t("how.resultLoop")}</p>
      </section>

      <section className="card how" aria-labelledby="how-accuracy">
        <h2 id="how-accuracy">{t("how.accuracyTitle")}</h2>
        <p>{t("how.accuracyLead")}</p>
        <div className="how-accuracy">
          <div>
            <h3>{t("how.affectTitle")}</h3>
            <ul className="how__rules">
              {AFFECT.map((key) => (
                <li key={key}>{t(key)}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>{t("how.improveTitle")}</h3>
            <ul className="how__rules">
              {IMPROVE.map((key) => (
                <li key={key}>{t(key)}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <SuggestionCheckPanel />

      <section className="card how how--dark" aria-labelledby="how-not">
        <h2 id="how-not">{t("how.notTitle")}</h2>
        <ul className="how__rules">
          <li>{t("how.notAi")}</li>
          <li>{t("how.notCloud")}</li>
        </ul>
      </section>

      <Button variant="secondary" to="/start">
        {t("how.back")}
      </Button>
    </Screen>
  );
}
