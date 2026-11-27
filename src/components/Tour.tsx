// src/components/Tour.tsx
import {
  startTransition,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { DEMO_ENABLED } from "../app/demoConfig.ts";
import { bottomInset } from "../app/bottomInset.ts";
import { findTarget } from "../app/findTarget.ts";
import { placeCard, type Box } from "../app/placeCard.ts";
import { revealTarget } from "../app/revealTarget.ts";
import { useTour } from "../app/tour.ts";
import { TOUR_STEPS, TOUR_TOTAL } from "../app/tourSteps.ts";
import { useCaseView } from "../app/useCaseView.ts";
import { useStall } from "../db/hooks.ts";
import { TourCard, type TourPlacement } from "./TourCard.tsx";

const POLL_MS = 150;
const PAD = 6;
const PUBLIC_PATHS = ["/", "/start", "/how"];

interface View {
  step: number;
  box: Box | null;
  blocked: boolean;
  width: number;
  height: number;
  inset: number;
}

interface Size {
  width: number;
  height: number;
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

function sameView(a: View | null, b: View): boolean {
  return (
    a !== null &&
    a.step === b.step &&
    a.blocked === b.blocked &&
    a.width === b.width &&
    a.height === b.height &&
    a.inset === b.inset &&
    a.box?.top === b.box?.top &&
    a.box?.left === b.box?.left &&
    a.box?.width === b.box?.width &&
    a.box?.height === b.box?.height
  );
}

function arrivalStep(from: number, pathname: string): number {
  for (let at = from; at < TOUR_STEPS.length; at += 1) {
    const advance = TOUR_STEPS[at]?.advance;
    if (advance === null || advance === undefined) {
      return -1;
    }
    if ("arrives" in advance && advance.arrives === pathname) {
      return at;
    }
  }
  return -1;
}

function blockersAround(box: Box) {
  const bottom = box.top + box.height;
  return [
    { top: 0, left: 0, right: 0, height: box.top },
    { top: bottom, left: 0, right: 0, bottom: 0 },
    { top: box.top, left: 0, width: box.left, height: box.height },
    { top: box.top, left: box.left + box.width, right: 0, height: box.height },
  ];
}

export function Tour() {
  const stall = useStall();
  const caseView = useCaseView();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { step: index, goTo, finish } = useTour();
  const [view, setView] = useState<View | null>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const card = useRef<HTMLElement | null>(null);
  const sizeWatcher = useRef<ResizeObserver | null>(null);
  const lastPath = useRef(pathname);
  const step = index === null ? undefined : TOUR_STEPS[index];
  const visible =
    DEMO_ENABLED &&
    step !== undefined &&
    stall?.settings.isDemo === true &&
    !PUBLIC_PATHS.includes(pathname);
  const onPath =
    step !== undefined && (step.path === null || step.path === pathname);
  // The suggestion step points at the menu the stall's case talks about.
  const focusMenu =
    step?.id === "suggestion" && caseView?.facts
      ? caseView.facts.primary.menuId
      : null;
  const targets = useMemo(
    () =>
      step === undefined
        ? []
        : focusMenu === null
          ? step.targets
          : [`.card-grid > li[data-menu-id="${focusMenu}"]`, ...step.targets],
    [step, focusMenu],
  );
  const blocked = view?.blocked === true;

  const attach = useCallback((node: HTMLElement | null) => {
    sizeWatcher.current?.disconnect();
    card.current = node;
    if (node === null) {
      return;
    }
    const read = () => {
      const width = node.offsetWidth;
      const height = node.offsetHeight;
      setSize((current) =>
        current.width === width && current.height === height
          ? current
          : { width, height },
      );
    };
    read();
    if (typeof ResizeObserver === "function") {
      sizeWatcher.current = new ResizeObserver(read);
      sizeWatcher.current.observe(node);
    }
  }, []);

  useEffect(() => {
    const changed = lastPath.current !== pathname;
    lastPath.current = pathname;
    if (!changed || !visible || index === null || index < 1) {
      return;
    }
    const reached = arrivalStep(index, pathname);
    if (reached >= 0) {
      goTo(reached + 1);
    }
  }, [pathname, index, visible, goTo]);

  useEffect(() => {
    if (!visible || index === null || step === undefined) {
      return undefined;
    }
    const appears =
      step.advance !== null && "appears" in step.advance
        ? step.advance.appears
        : null;
    let armed = false;
    let shown: HTMLElement | null = null;
    let focused = false;
    let frame = 0;

    const measure = () => {
      const dialogOpen = document.querySelector('[role="dialog"]') !== null;
      if (onPath && appears !== null) {
        const reached = document.querySelector(appears) !== null;
        if (reached && armed) {
          goTo(index + 1);
          return;
        }
        if (
          !reached &&
          targets.some((selector) => document.querySelector(selector) !== null)
        ) {
          armed = true;
        }
      }
      const held =
        step.free === true &&
        shown?.isConnected === true &&
        shown.contains(document.activeElement);
      const target =
        !onPath || dialogOpen ? null : held ? shown : findTarget(targets);
      if (target !== null && target !== shown) {
        shown = target;
        revealTarget(target);
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
        blocked: dialogOpen,
        width: window.innerWidth,
        height: window.innerHeight,
        inset: bottomInset(),
      };
      setView((current) => (sameView(current, next) ? current : next));
    };

    const schedule = () => {
      if (frame !== 0) {
        return;
      }
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        measure();
      });
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

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) {
        finish();
      }
    };

    const resizeObserver =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(schedule)
        : undefined;
    resizeObserver?.observe(document.body);

    measure();
    const timer = window.setInterval(measure, POLL_MS);
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearInterval(timer);
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [visible, onPath, index, step, targets, goTo, finish]);

  if (!visible || index === null || step === undefined || blocked) {
    return null;
  }

  const current = view?.step === index ? view : null;
  const centred = onPath && targets.length === 0;
  const box = onPath && !centred ? (current?.box ?? null) : null;
  const spot =
    box === null || size.width === 0
      ? undefined
      : placeCard(box, size, {
          width: current?.width ?? window.innerWidth,
          height:
            (current?.height ?? window.innerHeight) - (current?.inset ?? 0),
        });
  const placement: TourPlacement = centred
    ? "center"
    : spot === undefined
      ? "dock"
      : "spot";

  const move = (to: number) => {
    const path = TOUR_STEPS[to]?.path;
    startTransition(() => {
      goTo(to);
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
      {centred ? <div className="tour__veil" /> : null}
      {box === null || step.free === true
        ? null
        : blockersAround(box).map((style, side) => (
            <div key={side} className="tour__blocker" style={style} />
          ))}
      {box === null ? null : (
        <div
          className={
            step.free === true ? "tour__ring tour__ring--free" : "tour__ring"
          }
          style={box}
        />
      )}
      <TourCard
        ref={attach}
        step={step}
        index={index}
        total={TOUR_TOTAL}
        onPath={onPath}
        placement={placement}
        position={spot}
        onBack={() => {
          move(index - 1);
        }}
        onNext={() => {
          move(index + 1);
        }}
        onEnd={finish}
        onStart={() => move(1)}
        onGoThere={() => {
          if (step.path !== null) {
            navigate(step.path);
          }
        }}
        onLeave={leave}
      />
    </div>,
    document.body,
  );
}
