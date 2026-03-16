import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // GitHub Pages needs /iid-ai-exposure/ base; local dev uses /
  base:
    process.env.VITE_BASE_PATH ||
    (mode === "production" ? "/iid-ai-exposure/" : "/"),
  server: { port: 3000 },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@iid/common": path.resolve(__dirname, "_common"),
    },
  },
}));
