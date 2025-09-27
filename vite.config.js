import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), cloudflare()],
  server: {
    // Explicitly set the host to ensure HMR connects
    host: 'http://127.0.0.1', 
    // You may also need to set a specific HMR port if the default is failing
    hmr: {
      port: 5174, // Try a different port if needed
    }
  },
  build: {
    // 👈 ADD THIS: Specify the output directory for 'npm run build'
    // This folder will contain index.html and all compiled assets.
    outDir: "dist", 
  },
  
  // 👈 REMOVE THIS ENTIRE SECTION
  /*
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8787", 
        changeOrigin: true,
      },
    },
  },
  */
});