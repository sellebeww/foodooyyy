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

// What the stall's case says at this step: its situation, or what happens at
// one of the four moments of the day.
export type TourExplain =
  "situation" | "plan" | "service" | "close" | "summary";

export interface TourStep {
  id: TourStepId;
  explain?: TourExplain;
  path: string | null;
  targets: readonly string[];
  advance: { click: string; arrives: string } | { appears: string } | null;
  free?: boolean;
}

function navStep(id: TourStepId, path: string, to: string): TourStep {
  return {
    id,
    path,
    targets: [`.tab-bar a[href="${to}"]`, `a[href="${to}"]`],
    advance: { click: `a[href="${to}"]`, arrives: to },
  };
}

export const TOUR_STEPS: readonly TourStep[] = [
  { id: "intro", explain: "situation", path: null, targets: [], advance: null },
  {
    id: "suggestion",
    explain: "plan",
    path: "/plan",
    targets: [".card-grid > li:first-child"],
    advance: null,
  },
  {
    id: "accept",
    path: "/plan",
    targets: [".action-bar .btn"],
    advance: { click: ".action-bar .btn", arrives: "/today" },
  },
  navStep("toService", "/today", "/service"),
  {
    id: "soldOut",
    explain: "service",
    path: "/service",
    targets: [".service-grid .service-tile"],
    advance: { appears: ".service-tile--soldout" },
  },
  navStep("toClose", "/service", "/close"),
  {
    id: "close",
    explain: "close",
    path: "/close",
    targets: [".close-row[data-missing]", ".action-bar .btn"],
    advance: { appears: ".closed-card" },
    free: true,
  },
  navStep("toHistory", "/close", "/history"),
  {
    id: "outro",
    explain: "summary",
    path: "/history",
    targets: [],
    advance: null,
  },
];

export const TOUR_TOTAL = TOUR_STEPS.length - 2;
