// src/components/StatusBadge.tsx
import { useT, type MessageKey } from "../i18n/index.ts";

interface StatusBadgeProps {
  closed: boolean;
  unusual: boolean;
}

export function StatusBadge({ closed, unusual }: StatusBadgeProps) {
  const t = useT();
  const status = !closed ? "open" : unusual ? "unusual" : "closed";
  const label: MessageKey = `history.status.${status}`;
  return <span className={`badge badge--${status}`}>{t(label)}</span>;
}
