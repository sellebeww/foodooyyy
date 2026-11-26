// src/components/StepButton.tsx
import { useEffect, useRef, type ReactNode } from "react";

export const REPEAT_DELAY_MS = 400;
export const REPEAT_EVERY_MS = 100;

interface StepButtonProps {
  label: string;
  disabled: boolean;
  onStep: () => void;
  children: ReactNode;
}

export function StepButton({
  label,
  disabled,
  onStep,
  children,
}: StepButtonProps) {
  const step = useRef(onStep);
  const delay = useRef<number | null>(null);
  const repeat = useRef<number | null>(null);
  const stepped = useRef(false);

  useEffect(() => {
    step.current = onStep;
  }, [onStep]);

  function stop() {
    if (delay.current !== null) {
      window.clearTimeout(delay.current);
      delay.current = null;
    }
    if (repeat.current !== null) {
      window.clearInterval(repeat.current);
      repeat.current = null;
    }
  }

  useEffect(() => {
    if (disabled) {
      stop();
    }
  }, [disabled]);

  useEffect(() => stop, []);

  return (
    <button
      type="button"
      className="stepper__btn"
      aria-label={label}
      disabled={disabled}
      onPointerDown={(event) => {
        if (event.button !== 0) {
          return;
        }
        stop();
        stepped.current = event.pointerType !== "touch";
        if (stepped.current) {
          step.current();
        }
        delay.current = window.setTimeout(() => {
          repeat.current = window.setInterval(() => {
            stepped.current = true;
            step.current();
          }, REPEAT_EVERY_MS);
        }, REPEAT_DELAY_MS);
      }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={(event) => {
        event.preventDefault();
      }}
      onClick={(event) => {
        if (event.detail === 0 || !stepped.current) {
          step.current();
        }
        stepped.current = false;
      }}
    >
      {children}
    </button>
  );
}
