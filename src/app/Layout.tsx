// src/app/Layout.tsx
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../components/Sidebar.tsx";
import { TabBar } from "../components/TabBar.tsx";
import { RequireStall } from "./RequireStall.tsx";
import { useDemoRefresh } from "./useDemoRefresh.ts";

export function Layout() {
  useDemoRefresh();
  const location = useLocation();
  const state = location.state as { demoRun?: number } | null;
  const demoRun = state?.demoRun ?? 0;
  return (
    <RequireStall>
      <div className="layout">
        <Sidebar />
        <div key={demoRun} className="layout__content">
          <Outlet />
        </div>
        <TabBar />
      </div>
    </RequireStall>
  );
}
