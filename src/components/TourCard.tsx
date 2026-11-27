// src/components/TourCard.tsx
import { forwardRef, type CSSProperties } from "react";
import type { TourStep } from "../app/tourSteps.ts";
import { useCaseGuide } from "../app/caseGuide.ts";
import { useCaseView } from "../app/useCaseView.ts";
import { caseTextKey } from "../demo/cases.ts";
import { useT } from "../i18n/index.ts";
import { Button } from "./Button.tsx";
import { CloseXIcon } from "./icons/CloseXIcon.tsx";

export type TourPlacement = "center" | "dock" | "spot";

interface TourCardProps {
  step: TourStep;
  index: number;
  total: number;
  onPath: boolean;
  placement: TourPlacement;
  position?: CSSProperties | undefined;
  onBack: () => void;
  onNext: () => void;
  onEnd: () => void;
  onStart: () => void;
  onGoThere: () => void;
  onLeave: (path: string) => void;
}

// Small screens keep the explanation one tap away so the card does not cover
// what it points at; tablets and desktops show it open.
function isRoomy(): boolean {
  return (
    typeof window.matchMedia !== "function" ||
    window.matchMedia("(min-width: 700px) and (min-height: 560px)").matches
  );
}

export const TourCard = forwardRef<HTMLElement, TourCardProps>(
  function TourCard(
    {
      step,
      index,
      total,
      onPath,
      placement,
      position,
      onBack,
      onNext,
      onEnd,
      onStart,
      onGoThere,
      onLeave,
    },
    ref,
  ) {
    const t = useT();
    const view = useCaseView();
    const guide = useCaseGuide();
    const roomy = isRoomy();
    const intro = step.id === "intro";
    const outro = step.id === "outro";
    const counted = index >= 1 && index <= total;
    const interactive = step.advance !== null && onPath;
    return (
      <section
        ref={ref}
        className={`tour__card tour__card--${placement}`}
        aria-label={t("tour.label")}
        aria-live="polite"
        style={position}
      >
        <div key={step.id} className="tour__content">
          <div className="tour__head">
            {counted ? (
              <div className="tour__progress">
                <p className="eyebrow">
                  {t("tour.progress", { step: index, total })}
                </p>
                <span className="tour__dots" aria-hidden="true">
                  {Array.from({ length: total }, (_, dot) => (
                    <span
                      key={dot}
                      className={
                        dot + 1 < index
                          ? "tour__dot tour__dot--done"
                          : dot + 1 === index
                            ? "tour__dot tour__dot--now"
                            : "tour__dot"
                      }
                    />
                  ))}
                </span>
              </div>
            ) : (
              <span />
            )}
            <button
              type="button"
              className="tour__close"
              aria-label={t("tour.close")}
              onClick={onEnd}
            >
              <CloseXIcon />
            </button>
          </div>
          <h2 className="tour__title">{t(`tour.${step.id}.title`)}</h2>
          <p>
            {view?.facts && intro
              ? t(`case.s${view.entry.id}.title`)
              : view?.facts && step.id === "suggestion"
                ? t(`tour.s${view.entry.id}.task`, view.params)
                : view?.facts && step.id === "close"
                  ? t(`tour.s${view.entry.id}.closeTask`, view.params)
                  : t(`tour.${step.id}.body`)}
          </p>
          {interactive ? <p className="tour__hint">{t("tour.tryIt")}</p> : null}
          {step.explain === undefined ||
          view === undefined ||
          view === null ||
          view.facts === null ? null : (
            <details
              className="tour__case"
              open={roomy || placement === "center"}
            >
              <summary className="eyebrow">
                {step.explain === "situation"
                  ? view.stallName
                  : t("tour.caseLabel")}
              </summary>
              <p>
                {step.explain === "situation"
                  ? t(`case.s${view.entry.id}.situation`, view.params)
                  : t(
                      caseTextKey(view.entry.id, step.explain, "happens"),
                      view.params,
                    )}
              </p>
            </details>
          )}
        </div>
        {intro && view?.facts ? (
          <Button
            variant="secondary"
            className="btn--small"
            onClick={() => {
              guide.start();
              onLeave("/case");
            }}
          >
            {t(`tour.s${view.entry.id}.exercise`)}
          </Button>
        ) : null}
        {outro ? (
          <div className="tour__extras">
            <Button
              className="btn--small"
              variant="secondary"
              onClick={() => {
                onLeave("/settings");
              }}
            >
              {t("tour.register")}
            </Button>
            <Button
              className="btn--small"
              variant="secondary"
              onClick={() => {
                onLeave("/simulate");
              }}
            >
              {t("tour.sim")}
            </Button>
          </div>
        ) : null}
        <div className="tour__actions">
          <button type="button" className="tour__end" onClick={onEnd}>
            {t(intro ? "tour.notNow" : "tour.skipAll")}
          </button>
          <div className="tour__nav">
            {intro ? (
              <Button className="btn--small" onClick={onStart}>
                {t("tour.start")}
              </Button>
            ) : (
              <>
                {index > 1 ? (
                  <Button
                    className="btn--small"
                    variant="secondary"
                    onClick={onBack}
                  >
                    {t("tour.back")}
                  </Button>
                ) : null}
                {outro ? (
                  <Button className="btn--small" onClick={onEnd}>
                    {t("tour.finish")}
                  </Button>
                ) : !onPath ? (
                  <Button className="btn--small" onClick={onGoThere}>
                    {t("tour.goThere")}
                  </Button>
                ) : (
                  <Button
                    className="btn--small"
                    variant={interactive ? "secondary" : "primary"}
                    onClick={onNext}
                  >
                    {t("tour.next")}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    );
  },
);
