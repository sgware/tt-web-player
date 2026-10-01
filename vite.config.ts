import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Per the requirements PDF, this client is published into tt-web's
  // `/play` directory and served from there, not from the site root -- so
  // production asset URLs need that prefix. The dev server still serves
  // from `/`, since nothing else shares its origin locally.
  base: command === "build" ? "/play/" : "/",
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
}));
