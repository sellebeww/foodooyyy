// src/components/EmptyState.tsx
import type { ReactNode } from "react";
import { AppIcon } from "./AppIcon.tsx";

interface EmptyStateProps {
  title: string;
  body: string;
  action?: ReactNode;
}

export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <section className="card empty-state">
      <AppIcon size={64} />
      <h2>{title}</h2>
      <p>{body}</p>
      {action}
    </section>
  );
}
