// src/components/FeatureCard.tsx
import type { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  body: string;
  step?: number;
}

export function FeatureCard({ icon, title, body, step }: FeatureCardProps) {
  return (
    <li className="card feature-card">
      <span className="feature-card__icon">{icon}</span>
      <h3 className="feature-card__title">
        {step !== undefined ? (
          <span className="feature-card__step num">{step}. </span>
        ) : null}
        {title}
      </h3>
      <p>{body}</p>
    </li>
  );
}
