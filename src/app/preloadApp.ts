// src/app/preloadApp.ts
export function preloadApp(): Promise<unknown> {
  return Promise.all([
    import("./Layout.tsx"),
    import("../screens/Today.tsx"),
    import("../screens/Start.tsx"),
  ]);
}
