// src/components/TextField.tsx
import { useId, type InputHTMLAttributes } from "react";

interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
  hint?: string | undefined;
}

export function TextField({
  label,
  value,
  onChange,
  error,
  hint,
  type = "text",
  ...rest
}: TextFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [
    hint === undefined ? "" : hintId,
    error === undefined ? "" : errorId,
  ]
    .filter((item) => item !== "")
    .join(" ");
  return (
    <div className={error === undefined ? "field" : "field field--error"}>
      <label htmlFor={id}>{label}</label>
      {hint === undefined ? null : (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
      <input
        id={id}
        type={type}
        value={value}
        aria-invalid={error !== undefined}
        aria-describedby={describedBy === "" ? undefined : describedBy}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        {...rest}
      />
      {error === undefined ? null : (
        <p id={errorId} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}
