// src/components/Tour.tsx
import { startTransition, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { DEMO_ENABLED } from "../app/demoConfig.ts";
import { findTarget } from "../app/findTarget.ts";
import { placeCard, type Box } from "../app/placeCard.ts";
import { useTour } from "../app/tour.ts";
import { TOUR_STEPS, TOUR_TOTAL } from "../app/tourSteps.ts";
import { useStartTour } from "../app/useStartTour.ts";
import { useStall } from "../db/hooks.ts";
import { useT } from "../i18n/index.ts";
import { Button } from "./Button.tsx";

const POLL_MS = 150;
const PAD = 6;
const PUBLIC_PATHS = ["/", "/start", "/how"];

interface View {
  step: number;
  box: Box | null;
  card: { width: number; height: number };
  blocked: boolean;
}

function boxOf(node: HTMLElement): Box {
  const rect = node.getBoundingClientRect();
  const top = Math.max(0, rect.top - PAD);
  const left = Math.max(0, rect.left - PAD);
  return {
    top,
    left,
    width: rect.right + PAD - left,
    height: Math.max(0, rect.bottom + PAD - top),
  };
}

function shadesAround(box: Box) {
  const bottom = box.top + box.height;
  return [
    { top: 0, left: 0, right: 0, height: box.top },
    { top: bottom, left: 0, right: 0, bottom: 0 },
    { top: box.top, left: 0, width: box.left, height: box.height },
    { top: box.top, left: box.left + box.width, right: 0, height: box.height },
  ];
}

export function Tour() {
  const t = useT();
  const stall = useStall();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { step: index, goTo, finish } = useTour();
  const startTour = useStartTour();
  const [view, setView] = useState<View | null>(null);
  const card = useRef<HTMLElement>(null);
  const step = index === null ? undefined : TOUR_STEPS[index];
  const visible =
    DEMO_ENABLED &&
    step !== undefined &&
    stall?.settings.isDemo === true &&
    !PUBLIC_PATHS.includes(pathname);
  const onPath =
    step !== undefined && (step.path === null || step.path === pathname);

  useEffect(() => {
    if (!visible || index === null || step === undefined) {
      return undefined;
    }
    let shown: HTMLElement | null = null;
    let focused = false;
    const measure = () => {
      const blocked = document.querySelector('[role="dialog"]') !== null;
      if (
        onPath &&
        step.advance !== null &&
        "appears" in step.advance &&
        document.querySelector(step.advance.appears) !== null
      ) {
        goTo(index + 1);
        return;
      }
      const held =
        step.free === true &&
        shown?.isConnected === true &&
        shown.contains(document.activeElement);
      const target =
        !onPath || blocked ? null : held ? shown : findTarget(step.targets);
      if (target !== null && target !== shown) {
        shown = target;
        const tall =
          target.getBoundingClientRect().height > window.innerHeight * 0.6;
        target.scrollIntoView?.({ block: tall ? "start" : "center" });
        if (step.advance !== null && step.free !== true) {
          target.focus({ preventScroll: true });
        }
      }
      if (!focused && step.advance === null && card.current !== null) {
        focused = true;
        card.current
          .querySelector<HTMLElement>(".btn--primary")
          ?.focus({ preventScroll: true });
      }
      const next: View = {
        step: index,
        box: target === null ? null : boxOf(target),
        card: {
          width: card.current?.offsetWidth ?? 0,
          height: card.current?.offsetHeight ?? 0,
        },
        blocked,
      };
      setView((current) =>
        JSON.stringify(current) === JSON.stringify(next) ? current : next,
      );
    };
    const onClick = (event: MouseEvent) => {
      if (
        onPath &&
        step.advance !== null &&
        "click" in step.advance &&
        event.target instanceof Element &&
        event.target.closest(step.advance.click) !== null
      ) {
        startTransition(() => {
          goTo(index + 1);
        });
      }
    };
    measure();
    const timer = window.setInterval(measure, POLL_MS);
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    document.addEventListener("click", onClick, true);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
      document.removeEventListener("click", onClick, true);
    };
  }, [visible, onPath, index, step, goTo]);

  if (!visible || index === null || view?.blocked === true) {
    return null;
  }

  const current = view?.step === index ? view : null;
  const centred = onPath && step.targets.length === 0;
  const box = onPath && !centred ? (current?.box ?? null) : null;
  const spot =
    box === null || current === null
      ? undefined
      : placeCard(box, current.card, {
          width: window.innerWidth,
          height: window.innerHeight,
        });
  const modifier = centred
    ? " tour__card--center"
    : spot === undefined
      ? " tour__card--dock"
      : "";
  const forward = () => {
    const path = TOUR_STEPS[index + 1]?.path;
    startTransition(() => {
      goTo(index + 1);
      if (path && path !== pathname) {
        navigate(path);
      }
    });
  };
  const leave = (path: string) => {
    finish();
    navigate(path);
  };

  return createPortal(
    <div className="tour">
      {centred ? <div className="tour__shade tour__shade--full" /> : null}
      {box === null || step.free === true
        ? null
        : shadesAround(box).map((style, side) => (
            <div key={side} className="tour__shade" style={style} />
          ))}
      {box === null ? null : <div className="tour__ring" style={box} />}
      <section
        ref={card}
        className={`tour__card${modifier}`}
        aria-label={t("tour.label")}
        aria-live="polite"
        style={spot}
      >
        {index >= 1 && index <= TOUR_TOTAL ? (
          <p className="eyebrow">
            {t("tour.progress", { step: index, total: TOUR_TOTAL })}
          </p>
        ) : null}
        <h2 className="tour__title">{t(`tour.${step.id}.title`)}</h2>
        <p>{t(`tour.${step.id}.body`)}</p>
        <div className="tour__actions">
          <button type="button" className="tour__end" onClick={finish}>
            {t(
              step.id === "intro"
                ? "tour.notNow"
                : step.id === "outro"
                  ? "tour.finish"
                  : "tour.end",
            )}
          </button>
          {step.id === "intro" ? (
            <Button className="btn--small" onClick={startTour}>
              {t("tour.start")}
            </Button>
          ) : !onPath ? (
            <Button
              className="btn--small"
              onClick={() => {
                if (step.path !== null) {
                  navigate(step.path);
                }
              }}
            >
              {t("tour.goThere")}
            </Button>
          ) : step.id === "outro" ? (
            <>
              <Button
                className="btn--small"
                variant="secondary"
                onClick={() => {
                  leave("/settings");
                }}
              >
                {t("tour.register")}
              </Button>
              <Button
                className="btn--small"
                onClick={() => {
                  leave("/simulate");
                }}
              >
                {t("tour.sim")}
              </Button>
            </>
          ) : (
            <Button
              className="btn--small"
              variant={step.advance === null ? "primary" : "secondary"}
              onClick={forward}
            >
              {t(step.advance === null ? "tour.next" : "tour.skip")}
            </Button>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}
