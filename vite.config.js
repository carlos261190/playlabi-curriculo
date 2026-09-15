import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Puertos propios para poder tener Genius y Currículo abiertos a la vez.
    port: 5176,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:3002",
        changeOrigin: true,
        timeout: 300000,
        proxyTimeout: 300000,
      },
    },
  },
});
