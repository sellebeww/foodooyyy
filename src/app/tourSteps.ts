// src/app/tourSteps.ts
export type TourStepId =
  | "welcome"
  | "moment"
  | "suggestion"
  | "accept"
  | "toService"
  | "soldOut"
  | "toClose"
  | "close"
  | "toHistory"
  | "history"
  | "toSettings"
  | "cashier"
  | "toToday"
  | "openSim"
  | "play"
  | "analysis";

export interface TourStep {
  id: TourStepId;
  path: string;
  targets: readonly string[];
  advance: { click: string } | { appears: string } | null;
  cardOnTop?: boolean;
}

function navStep(id: TourStepId, path: string, to: string): TourStep {
  return {
    id,
    path,
    targets: [`.tab-bar a[href="${to}"]`, `a[href="${to}"]`],
    advance: { click: `a[href="${to}"]` },
  };
}

function clickStep(id: TourStepId, path: string, target: string): TourStep {
  return { id, path, targets: [target], advance: { click: target } };
}

function readStep(id: TourStepId, path: string, target: string): TourStep {
  return { id, path, targets: [target], advance: null };
}

export const TOUR_STEPS: readonly TourStep[] = [
  clickStep("welcome", "/welcome", '[data-tour="try-demo"]'),
  {
    id: "moment",
    path: "/welcome",
    targets: [
      '[role="dialog"] [data-tour="moment-plan"]',
      '[data-tour="try-demo"]',
    ],
    advance: { click: '[data-tour="moment-plan"]' },
  },
  readStep("suggestion", "/plan", ".card-grid > li:first-child"),
  clickStep("accept", "/plan", ".action-bar .btn"),
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
    targets: [".screen__main"],
    advance: { appears: ".closed-card" },
    cardOnTop: true,
  },
  navStep("toHistory", "/close", "/history"),
  readStep("history", "/history", 'section[aria-labelledby="history-week"]'),
  navStep("toSettings", "/history", "/settings"),
  readStep("cashier", "/settings", 'section[aria-labelledby="set-mode"]'),
  navStep("toToday", "/settings", "/today"),
  clickStep("openSim", "/today", '[data-tour="open-sim"]'),
  clickStep("play", "/simulate", '[data-tour="sim-play"]'),
  readStep("analysis", "/simulate", '[data-tour="sim-analysis"]'),
];

export const FIRST_APP_STEP = TOUR_STEPS.findIndex(
  (step) => step.path !== "/welcome",
);
