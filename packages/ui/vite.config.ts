import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    // CSS-only build
    rollupOptions: {
      input: "./src/index.html", // Vite needs an HTML entry point
      output: {
        assetFileNames: "styles.css",
      },
    },
    outDir: "dist",
    emptyOutDir: false, // Don't clear TypeScript declarations
  },
});
