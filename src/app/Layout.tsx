// src/app/Layout.tsx
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar.tsx";
import { TabBar } from "../components/TabBar.tsx";
import { RequireStall } from "./RequireStall.tsx";
import { useDemoRefresh } from "./useDemoRefresh.ts";

export function Layout() {
  useDemoRefresh();
  return (
    <RequireStall>
      <div className="layout">
        <Sidebar />
        <div className="layout__content">
          <Outlet />
        </div>
        <TabBar />
      </div>
    </RequireStall>
  );
}
