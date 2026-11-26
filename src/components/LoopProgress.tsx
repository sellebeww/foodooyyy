// src/components/LoopProgress.tsx
import {
  LOOP_PHASES,
  segmentStatus,
  type Phase,
  type SegmentStatus,
} from "../domain/phase.ts";
import { useT } from "../i18n/index.ts";
import { BRAND_LOOP } from "./AppIcon.tsx";

interface LoopProgressProps {
  phase: Phase;
}

export function LoopProgress({ phase }: LoopProgressProps) {
  const t = useT();
  const statusLabel: Record<SegmentStatus, string> = {
    done: t("today.status.done"),
    current: t("today.status.current"),
    next: t("today.status.next"),
  };
  return (
    <figure className="loop">
      <svg
        className="loop__graphic"
        viewBox="-226 -95 452 190"
        aria-hidden="true"
        focusable="false"
      >
        {LOOP_PHASES.map((segment, index) => (
          <path
            key={segment}
            className={`loop__arc loop__arc--${segmentStatus(phase, segment)}`}
            d={BRAND_LOOP}
            transform="scale(-1 1)"
            pathLength={300}
            strokeDasharray="96 204"
            strokeDashoffset={-100 * index}
          />
        ))}
      </svg>
      <figcaption>
        <h2 className="visually-hidden">{t("today.loopTitle")}</h2>
        <ol className="loop__steps">
          {LOOP_PHASES.map((segment) => {
            const status = segmentStatus(phase, segment);
            return (
              <li
                key={segment}
                className={`loop__step loop__step--${status}`}
                aria-current={status === "current" ? "step" : undefined}
              >
                <span className="loop__step-name">
                  {t(`today.phase.${segment}`)}
                </span>{" "}
                <span className="loop__step-status">{statusLabel[status]}</span>
              </li>
            );
          })}
        </ol>
      </figcaption>
    </figure>
  );
}
