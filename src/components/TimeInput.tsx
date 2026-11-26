// src/components/TimeInput.tsx
import { TextField } from "./TextField.tsx";

interface TimeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
}

export function TimeInput({ label, value, onChange, error }: TimeInputProps) {
  return (
    <TextField
      type="time"
      step={60}
      label={label}
      value={value}
      onChange={onChange}
      error={error}
    />
  );
}
