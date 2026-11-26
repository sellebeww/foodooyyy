// src/components/SetupProgress.tsx
import { useT } from "../i18n/index.ts";

const TOTAL_STEPS = 2;

interface SetupProgressProps {
  step: number;
}

export function SetupProgress({ step }: SetupProgressProps) {
  const t = useT();
  return (
    <div className="setup-progress">
      <p className="step">{t("setup.step", { step, total: TOTAL_STEPS })}</p>
      <div className="setup-progress__bar" aria-hidden="true">
        {Array.from({ length: TOTAL_STEPS }, (_, index) => (
          <span key={index} className={index < step ? "is-on" : undefined} />
        ))}
      </div>
    </div>
  );
}
