/// <reference types="vitest/config" />
import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  // Pre-bundling breaks maplibre-gl v6's `new URL(worker, import.meta.url)` lookup.
  optimizeDeps: { exclude: ["maplibre-gl"] },
  server: { port: 5173, strictPort: true, open: false },
  preview: { port: 4173, strictPort: true },
  // maplibre-gl is ~1 MB minified on its own and already lands in a separate chunk.
  build: { chunkSizeWarningLimit: 2600 },
  test: {
    // Pure logic runs in node (fast); component tests opt in with `// @vitest-environment jsdom`.
    environment: "node",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: false,
  },
});
