import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), visualizer({ open: true })],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate big libraries into their own chunks
          react: ["react", "react-dom"],
          ui: ["@mui/material", "@mui/icons-material"], // example
        },
      },
      chunkSizeWarningLimit: 600, // optional, raise the warning limit
    },
  },
});
