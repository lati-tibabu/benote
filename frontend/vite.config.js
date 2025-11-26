import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@core": path.resolve(__dirname, "./src/core"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@redux": path.resolve(__dirname, "./src/redux"),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate", // Auto-update service worker when a new version is available
      manifest: {
        name: "Benote",
        short_name: "Benote",
        description:
          "A productivity app for students to manage tasks, schedules, and projects.",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        //for caching
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 5 MB
        runtimeCaching: [
          {
            urlPattern: /\.(?:js|css|html|json)$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "assets-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 24 * 60 * 60, // 1 day
              },
            },
          },
        ],
      },
    }),
  ],
});
