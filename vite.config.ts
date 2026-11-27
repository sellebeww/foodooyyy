// vite.config.ts
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import packageJson from "./package.json" with { type: "json" };
import { parseDemoEnabled } from "./src/demo/catalog.ts";

export default defineConfig(({ mode }) => {
  parseDemoEnabled(loadEnv(mode, process.cwd(), "VITE_")["VITE_DEMO"]);
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["icons/icon.svg"],
        workbox: {
          globPatterns: ["**/*.{js,css,html,svg,png,woff2,webmanifest}"],
          navigateFallback: "/index.html",
          cleanupOutdatedCaches: true,
        },
        manifest: {
          name: "FOODOO",
          short_name: "FOODOO",
          description:
            "Daily portion planning that counts the customers a sold-out menu hides.",
          id: "/",
          start_url: "/",
          scope: "/",
          display: "standalone",
          theme_color: "#00212f",
          background_color: "#f7f4ef",
          icons: [
            { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
            {
              src: "/icons/icon-maskable-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
      }),
    ],
    define: {
      __APP_VERSION__: JSON.stringify(packageJson.version),
    },
    test: {
      environment: "jsdom",
      include: ["tests/**/*.test.{ts,tsx}"],
      setupFiles: ["tests/setup.ts"],
      testTimeout: 15_000,
      maxWorkers: "25%",
      minWorkers: 1,
      env: { VITE_DEMO: "on" },
      coverage: {
        provider: "v8",
        include: ["src/domain/**/*.ts"],
        exclude: ["src/domain/types.ts"],
        reporter: ["text", "html"],
        thresholds: {
          "src/domain/**/*.ts": {
            lines: 100,
            functions: 100,
            branches: 100,
            statements: 100,
          },
        },
      },
    },
  };
});
