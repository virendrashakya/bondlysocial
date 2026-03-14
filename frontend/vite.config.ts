import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "IntentConnect",
        short_name: "IntentConnect",
        description: "Connect with purpose, not swipes.",
        theme_color: "#0A0A0A",
        background_color: "#0A0A0A",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/discover",
        icons: [
          { src: "/icons/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "/icons/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /\/api\/v1\/app_config$/,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "app-config-cache", expiration: { maxAgeSeconds: 300 } },
          },
          {
            urlPattern: /\/api\/v1\/profiles\/suggestions/,
            handler: "NetworkFirst",
            options: { cacheName: "suggestions-cache", expiration: { maxAgeSeconds: 300, maxEntries: 50 } },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:3001", changeOrigin: true },
      "/cable": { target: "ws://localhost:3001", ws: true },
    },
  },
});
