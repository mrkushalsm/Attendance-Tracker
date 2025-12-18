import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(), tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      injectManifest: {
        swSrc: 'public/sw.js',
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
      },
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['attendance-tracker.png'],
      manifest: {
        name: 'Attendance Tracker',
        short_name: 'Attendance',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#10b981',
        icons: [
          {
            src: 'attendance-tracker.png',
            sizes: '128x128',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  server: {
    port: 5555,
  },
});
