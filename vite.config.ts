
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins = [react()];
  
  // Safely add componentTagger only in development if available
  if (mode === 'development') {
    try {
      const { componentTagger } = require("lovable-tagger");
      if (componentTagger) {
        plugins.push(componentTagger());
      }
    } catch (error) {
      console.warn("lovable-tagger not available:", error);
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    build: {
      target: 'esnext',
      minify: 'esbuild',
    },
    esbuild: {
      target: 'esnext',
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        react: path.resolve(__dirname, "node_modules/react"),
        "react/jsx-runtime": path.resolve(__dirname, "node_modules/react/jsx-runtime"),
        "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      },
      dedupe: ["react", "react-dom"],
    },
  };
});
