import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// https://vitejs.dev/config/

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 8080,
    headers: {
      "Cross-Origin-Embedder-Policy": "credentialless",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
    hmr: {
      host: "localhost",
      port: 8080,
      protocol: "ws",
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
}));
