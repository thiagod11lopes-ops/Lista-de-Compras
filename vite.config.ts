import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  // GitHub Pages: https://thiagod11lopes-ops.github.io/Lista-de-Compras/
  base: mode === "production" ? "/Lista-de-Compras/" : "/",
  plugins: [react(), tailwindcss()],
}));
