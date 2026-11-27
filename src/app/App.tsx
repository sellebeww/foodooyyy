// src/app/App.tsx
import { lazy, Suspense, useEffect, useRef } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useT } from "../i18n/index.ts";
import { Welcome } from "../screens/Welcome.tsx";
import { registerPwa } from "./registerPwa.ts";
import { EntryGate } from "./EntryGate.tsx";
import { RequireStall } from "./RequireStall.tsx";
import { useToast } from "./toast.ts";
import { Splash } from "../components/Splash.tsx";
import { LaunchProvider } from "../components/LaunchProvider.tsx";
import { Tour } from "../components/Tour.tsx";

const Case = lazy(() =>
  import("../screens/Case.tsx").then((m) => ({ default: m.Case })),
);
const Close = lazy(() =>
  import("../screens/Close.tsx").then((m) => ({ default: m.Close })),
);
const DayDetail = lazy(() =>
  import("../screens/DayDetail.tsx").then((m) => ({ default: m.DayDetail })),
);
const History = lazy(() =>
  import("../screens/History.tsx").then((m) => ({ default: m.History })),
);
const HowItWorks = lazy(() =>
  import("../screens/HowItWorks.tsx").then((m) => ({ default: m.HowItWorks })),
);
const Layout = lazy(() =>
  import("./Layout.tsx").then((m) => ({ default: m.Layout })),
);
const Plan = lazy(() =>
  import("../screens/Plan.tsx").then((m) => ({ default: m.Plan })),
);
const Sales = lazy(() =>
  import("../screens/Sales.tsx").then((m) => ({ default: m.Sales })),
);
const Start = lazy(() =>
  import("../screens/Start.tsx").then((m) => ({ default: m.Start })),
);
const Today = lazy(() =>
  import("../screens/Today.tsx").then((m) => ({ default: m.Today })),
);
const Settings = lazy(() =>
  import("../screens/Settings.tsx").then((m) => ({ default: m.Settings })),
);
const Simulate = lazy(() =>
  import("../screens/Simulate.tsx").then((m) => ({ default: m.Simulate })),
);
const SetupHours = lazy(() =>
  import("../screens/SetupHours.tsx").then((m) => ({ default: m.SetupHours })),
);
const SetupMenus = lazy(() =>
  import("../screens/SetupMenus.tsx").then((m) => ({ default: m.SetupMenus })),
);

export function App() {
  const t = useT();
  const toast = useToast();

  const announce = useRef(() => {
    toast.show(t("app.offlineReady"), { background: true });
  });

  useEffect(() => {
    announce.current = () => {
      toast.show(t("app.offlineReady"), { background: true });
    };
  }, [toast, t]);

  useEffect(() => {
    registerPwa(() => {
      announce.current();
    });
  }, []);

  return (
    <LaunchProvider>
      <a className="skip-link" href="#main">
        {t("app.skip")}
      </a>
      <Suspense fallback={<Splash />}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route
            path="/start"
            element={
              <EntryGate>
                <Start />
              </EntryGate>
            }
          />
          <Route path="/how" element={<HowItWorks />} />
          <Route
            path="/setup/menus"
            element={
              <EntryGate>
                <RequireStall>
                  <SetupMenus />
                </RequireStall>
              </EntryGate>
            }
          />
          <Route
            path="/setup/hours"
            element={
              <EntryGate>
                <RequireStall>
                  <SetupHours />
                </RequireStall>
              </EntryGate>
            }
          />
          <Route
            element={
              <EntryGate>
                <Layout />
              </EntryGate>
            }
          >
            <Route path="/today" element={<Today />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/service" element={<Sales />} />
            <Route path="/close" element={<Close />} />
            <Route path="/close/:date" element={<Close />} />
            <Route path="/history" element={<History />} />
            <Route path="/day/:date" element={<DayDetail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/simulate" element={<Simulate />} />
            <Route path="/case" element={<Case />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Tour />
    </LaunchProvider>
  );
}
