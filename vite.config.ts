// @lovable.dev/vite-tanstack-config already includes many plugins & defaults.
// Use VITE_BASE to override build.base for environments like GitHub Pages.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "server" },
  },
  // Allow overriding Vite's base path via VITE_BASE env var (useful for GH Pages repo path hosting)
  vite: {
    base: process.env.VITE_BASE || "/",
  },
});
