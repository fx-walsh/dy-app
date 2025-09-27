import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), cloudflare()],
  server: {
    // Use 0.0.0.0 to bind to all interfaces, not just localhost
    host: '0.0.0.0',
    port: 5173,
    // HMR configuration
    hmr: {
      port: 5173, // Use same port as dev server
      host: 'localhost', // Ensure HMR connects to localhost
    },
    // Allow connections from any origin (helpful for local dev)
    cors: true,
  },
  build: {
    outDir: "dist",
  },
});