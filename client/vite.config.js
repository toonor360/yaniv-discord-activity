import { defineConfig } from "vite";
import { ViteMinifyPlugin } from "vite-plugin-minify";

// https://vitejs.dev/config/
export default defineConfig({
  envDir: "../",
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      "/socket.io": {
        target: "http://localhost:3001/socket.io",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
    hmr: {
      clientPort: 443,
    },
  },
  build: {
    emptyOutDir: true,
    rollupOptions: {
      index: "index.html",
      game: "game.html",
    },
  },
  plugins: [ViteMinifyPlugin()],
});
