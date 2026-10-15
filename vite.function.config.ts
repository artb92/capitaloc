import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

/** Bundles the leaderboard handler (with country data) into one ES module for the Edge Function. */
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  publicDir: false,
  build: {
    lib: {
      entry: "src/features/leaderboard/handler.ts",
      formats: ["es"],
      fileName: () => "handler.js",
    },
    outDir: "supabase/functions/submit-score",
    emptyOutDir: false,
    minify: false,
  },
});
