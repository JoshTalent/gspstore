import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname), // make sure root points to stock_frontend
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
