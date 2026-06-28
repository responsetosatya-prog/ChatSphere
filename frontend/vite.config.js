// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          router: ["react-router-dom"],
          socket: ["socket.io-client"]
        }
      }
    }
  },
  // ✅ Ensure the public directory is copied correctly
  publicDir: "public"
});
