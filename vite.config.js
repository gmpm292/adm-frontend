import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/adm-frontend/",
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
  },
  define: {
    "process.env": {},
  },
});
