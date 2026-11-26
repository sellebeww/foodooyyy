// src/components/icons/IconBase.tsx
import type { ReactNode } from "react";

interface IconBaseProps {
  children: ReactNode;
}

export function IconBase({ children }: IconBaseProps) {
  return (
    <svg
      className="icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}
