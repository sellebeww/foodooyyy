// src/components/Stepper.tsx
import { useId, useState } from "react";
import { clampQty } from "../domain/plan.ts";
import { parseWholeInput } from "../i18n/format.ts";
import { StepButton } from "./StepButton.tsx";

interface StepperProps {
  label: string;
  decreaseLabel: string;
  increaseLabel: string;
  value: number | null;
  min: number;
  max: number;
  placeholder?: string | undefined;
  error?: string | undefined;
  onChange: (value: number) => void;
}

export function Stepper({
  label,
  decreaseLabel,
  increaseLabel,
  value,
  min,
  max,
  placeholder,
  error,
  onChange,
}: StepperProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const [text, setText] = useState<string | null>(null);

  function stepBy(delta: number) {
    setText(null);
    onChange(
      value === null
        ? clampQty(min + Math.max(0, delta), min, max)
        : clampQty(value + delta, min, max),
    );
  }

  const stepper = (
    <div className="stepper">
      <label htmlFor={id} className="visually-hidden">
        {label}
      </label>
      <StepButton
        label={decreaseLabel}
        disabled={value !== null && value <= min}
        onStep={() => {
          stepBy(-1);
        }}
      >
        <span aria-hidden="true">−</span>
      </StepButton>
      <input
        id={id}
        className="stepper__input num"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        aria-invalid={error === undefined ? undefined : true}
        aria-describedby={error === undefined ? undefined : errorId}
        value={text ?? (value === null ? "" : String(value))}
        onChange={(event) => {
          const raw = event.target.value;
          setText(raw);
          const parsed = parseWholeInput(raw);
          if (!Number.isNaN(parsed)) {
            onChange(clampQty(parsed, min, max));
          }
        }}
        onBlur={() => {
          setText(null);
        }}
        onFocus={(event) => {
          event.target.select();
        }}
      />
      <StepButton
        label={increaseLabel}
        disabled={value !== null && value >= max}
        onStep={() => {
          stepBy(1);
        }}
      >
        <span aria-hidden="true">+</span>
      </StepButton>
    </div>
  );

  if (error === undefined) {
    return stepper;
  }
  return (
    <div className="field field--error">
      {stepper}
      <p id={errorId} className="field__error">
        {error}
      </p>
    </div>
  );
}
