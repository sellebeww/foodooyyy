// src/components/Tour.tsx
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { DEMO_ENABLED } from "../app/demoConfig.ts";
import { useTour } from "../app/tour.ts";
import { FIRST_APP_STEP, TOUR_STEPS } from "../app/tourSteps.ts";
import { useStall } from "../db/hooks.ts";
import { useT } from "../i18n/index.ts";
import { Button } from "./Button.tsx";

const POLL_MS = 150;
const GAP = 12;
const PAD = 6;

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

function findTarget(selectors: readonly string[]): HTMLElement | null {
  for (const selector of selectors) {
    const all = Array.from(document.querySelectorAll<HTMLElement>(selector));
    const found =
      all.find((node) => node.getClientRects().length > 0) ?? all[0];
    if (found !== undefined) {
      return found;
    }
  }
  return null;
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

function sameBox(a: Box | null, b: Box | null): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function cardStyle(box: Box | null, height: number): CSSProperties {
  if (box === null) {
    return { bottom: GAP };
  }
  const below = box.top + box.height + GAP;
  if (below + height <= window.innerHeight) {
    return { top: below };
  }
  const above = box.top - GAP - height;
  return above >= 0 ? { top: above } : { bottom: GAP };
}

export function Tour() {
  const t = useT();
  const stall = useStall();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { step: index, goTo, finish } = useTour();
  const [measuredBox, setMeasuredBox] = useState<{
    step: number;
    box: Box | null;
    inSheet: boolean;
  } | null>(null);
  const card = useRef<HTMLElement>(null);
  const [cardHeight, setCardHeight] = useState(220);
  const here = pathname === "/" ? "/welcome" : pathname;
  const step = index === null ? undefined : TOUR_STEPS[index];
  const onWelcome = step?.path === "/welcome";
  const visible =
    DEMO_ENABLED &&
    step !== undefined &&
    stall !== undefined &&
    (stall === null ? here === "/welcome" && onWelcome : stall.settings.isDemo);
  const onPath = step !== undefined && here === step.path;

  useEffect(() => {
    if (visible && onWelcome && here !== "/welcome") {
      goTo(FIRST_APP_STEP);
    }
  }, [visible, onWelcome, here, goTo]);

  useEffect(() => {
    if (!visible || !onPath || index === null || step === undefined) {
      return undefined;
    }
    const next = () => {
      if (index + 1 < TOUR_STEPS.length) {
        goTo(index + 1);
      } else {
        finish();
      }
    };
    let shown: HTMLElement | null = null;
    const measure = () => {
      if (
        step.advance !== null &&
        "appears" in step.advance &&
        document.querySelector(step.advance.appears) !== null
      ) {
        next();
        return;
      }
      const found = findTarget(step.targets);
      const sheet = document.querySelector<HTMLElement>(".sheet");
      const inSheet = sheet !== null && !sheet.contains(found);
      const target = inSheet ? sheet : found;
      if (target !== null && target !== shown) {
        shown = target;
        const tall =
          target.getBoundingClientRect().height > window.innerHeight * 0.6;
        target.scrollIntoView?.({ block: tall ? "start" : "center" });
        if (step.advance === null) {
          card.current?.querySelector<HTMLElement>(".btn")?.focus();
        } else {
          target.focus({ preventScroll: true });
        }
      }
      const measured = target === null ? null : boxOf(target);
      setCardHeight(card.current?.offsetHeight ?? 220);
      setMeasuredBox((current) =>
        current?.step === index &&
        current.inSheet === inSheet &&
        sameBox(current.box, measured)
          ? current
          : { step: index, box: measured, inSheet },
      );
    };
    const onClick = (event: MouseEvent) => {
      if (
        step.advance !== null &&
        "click" in step.advance &&
        event.target instanceof Element &&
        event.target.closest(step.advance.click) !== null
      ) {
        next();
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
  }, [visible, onPath, index, step, goTo, finish]);

  if (!visible || index === null) {
    return null;
  }

  const current = onPath && measuredBox?.step === index ? measuredBox : null;
  const box = current?.box ?? null;
  const onTop =
    onPath && (step.cardOnTop === true || current?.inSheet === true);
  const last = index === TOUR_STEPS.length - 1;
  const forward = () => {
    if (last) {
      finish();
    } else {
      goTo(index + 1);
    }
  };
  const title = t(`tour.${step.id}.title`);

  return createPortal(
    <div className="tour">
      {box === null ? null : (
        <>
          <div
            className="tour__shade"
            style={{ inset: "0 0 auto 0", height: box.top }}
          />
          <div
            className="tour__shade"
            style={{ inset: `${box.top + box.height}px 0 0 0` }}
          />
          <div
            className="tour__shade"
            style={{
              top: box.top,
              left: 0,
              width: box.left,
              height: box.height,
            }}
          />
          <div
            className="tour__shade"
            style={{
              top: box.top,
              left: box.left + box.width,
              right: 0,
              height: box.height,
            }}
          />
          <div className="tour__ring" style={box} />
        </>
      )}
      <section
        ref={card}
        className={onTop ? "tour__card tour__card--top" : "tour__card"}
        aria-label={t("tour.label")}
        aria-live="polite"
        style={onTop ? { top: GAP } : cardStyle(box, cardHeight)}
      >
        <p className="eyebrow">
          {t("tour.progress", { step: index + 1, total: TOUR_STEPS.length })}
        </p>
        <h2 className="tour__title">{title}</h2>
        <p>{t(`tour.${step.id}.body`)}</p>
        <div className="tour__actions">
          <button type="button" className="tour__end" onClick={finish}>
            {t("tour.end")}
          </button>
          {!onPath ? (
            <Button
              className="btn--small"
              onClick={() => {
                navigate(step.path);
              }}
            >
              {t("tour.goThere")}
            </Button>
          ) : onWelcome ? null : (
            <Button
              className="btn--small"
              variant={step.advance === null ? "primary" : "secondary"}
              onClick={forward}
            >
              {t(
                last
                  ? "tour.finish"
                  : step.advance === null
                    ? "tour.next"
                    : "tour.skip",
              )}
            </Button>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}
