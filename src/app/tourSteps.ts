// src/app/tourSteps.ts
export type TourStepId =
  | "intro"
  | "suggestion"
  | "accept"
  | "toService"
  | "soldOut"
  | "toClose"
  | "close"
  | "toHistory"
  | "outro";

export interface TourStep {
  id: TourStepId;
  path: string | null;
  targets: readonly string[];
  advance: { click: string } | { appears: string } | null;
  free?: boolean;
}

function navStep(id: TourStepId, path: string, to: string): TourStep {
  return {
    id,
    path,
    targets: [`.tab-bar a[href="${to}"]`, `a[href="${to}"]`],
    advance: { click: `a[href="${to}"]` },
  };
}

export const TOUR_STEPS: readonly TourStep[] = [
  { id: "intro", path: null, targets: [], advance: null },
  {
    id: "suggestion",
    path: "/plan",
    targets: [".card-grid > li:first-child"],
    advance: null,
  },
  {
    id: "accept",
    path: "/plan",
    targets: [".action-bar .btn"],
    advance: { click: ".action-bar .btn" },
  },
  navStep("toService", "/today", "/service"),
  {
    id: "soldOut",
    path: "/service",
    targets: [".service-grid .service-tile"],
    advance: { appears: ".service-tile--soldout" },
  },
  navStep("toClose", "/service", "/close"),
  {
    id: "close",
    path: "/close",
    targets: [".close-row[data-missing]", ".action-bar .btn"],
    advance: { appears: ".closed-card" },
    free: true,
  },
  navStep("toHistory", "/close", "/history"),
  { id: "outro", path: "/history", targets: [], advance: null },
];

export const TOUR_TOTAL = TOUR_STEPS.length - 2;
