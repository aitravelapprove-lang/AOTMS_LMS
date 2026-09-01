import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// https://vitejs.dev/config/

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    strictPort: false,
    hmr: {
      host: "localhost",
      protocol: "ws",
    },
    proxy: {
      // Any request to /api/* gets forwarded to the Express backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    include: ["@zoom/meetingsdk"],
  },
  plugins: [react()],
  assetsInclude: ['**/*.glb'],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 4500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@zoom/meetingsdk")) {
              return "zoom-vendor";
            }
            if (
              id.includes("three") ||
              id.includes("@react-three") ||
              id.includes("@splinetool")
            ) {
              return "three-vendor";
            }
            if (id.includes("recharts")) {
              return "charts-vendor";
            }
            if (
              id.includes("framer-motion") ||
              id.includes("gsap") ||
              id.includes("lucide-react")
            ) {
              return "ui-vendor";
            }
          }
        },
      },
    },
  },
}));