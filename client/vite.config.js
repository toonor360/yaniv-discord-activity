import { defineConfig } from "vite";
import { ViteMinifyPlugin } from "vite-plugin-minify";

// https://vitejs.dev/config/
export default defineConfig({
  envDir: "../",
  server: {
    proxy: {
      "/api": {
        target: "https://yaniv-discord-activity.onrender.com",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      "/socket": {
        target: "https://yaniv-discord-activity.onrender.com/socket.io",
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
      input: {
        index: "index.html",
        game: "game.html",
      },
    },
  },
  plugins: [ViteMinifyPlugin()],
});
