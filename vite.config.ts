import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => ({
  // https://thiagod11lopes-ops.github.io/Lista-de-Compras/
  base: command === "build" ? "/Lista-de-Compras/" : "/",
  plugins: [react(), tailwindcss()],
}));
