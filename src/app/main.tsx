// src/app/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { createDb } from "../db/schema.ts";
import "../styles/tokens.css";
import "../styles/base.css";
import "../styles/layout.css";
import "../styles/components.css";
import "../styles/landing.css";
import "../styles/motion.css";
import { App } from "./App.tsx";
import { AppProviders } from "./AppProviders.tsx";

const container = document.getElementById("root");
if (container === null) {
  throw new Error("Root element not found");
}

const db = createDb();

createRoot(container).render(
  <StrictMode>
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AppProviders db={db}>
        <App />
      </AppProviders>
    </BrowserRouter>
  </StrictMode>,
);
