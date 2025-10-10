import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
// "homepage": "https://gmpm292.github.io/adm-frontend",
// (base: "/adm-frontend/",) o si se configura un dominio personalizado se pone (base: "/",)
export default defineConfig({
  plugins: [react()],
  base: "/adm-frontend/",
  server: {
    port: 3001,
    open: true,
  },
  build: {
    outDir: "dist",
  },
  define: {
    "process.env": {},
  },
});
