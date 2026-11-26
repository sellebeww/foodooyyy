// src/components/HeroLoop.tsx
import { BRAND_LOOP } from "./AppIcon.tsx";

export function HeroLoop() {
  return (
    <svg
      className="hero__loop"
      viewBox="-240 -110 480 220"
      aria-hidden="true"
      focusable="false"
    >
      <path className="hero__loop-track" d={BRAND_LOOP} pathLength={100} />
      <path className="hero__loop-spark" d={BRAND_LOOP} pathLength={100} />
    </svg>
  );
}
