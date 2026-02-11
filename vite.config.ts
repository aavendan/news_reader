/// <reference types="vitest" />
import { VitePWA } from 'vite-plugin-pwa'

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/news_reader/",
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        id: '/news_reader/',
        name: 'Lector de noticias',
        short_name: 'Lector de noticias',
        description: 'Lector de noticias de El Universo',
        theme_color: '#D3D1D1',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: "pwa-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          },
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            // Intercepta todas las peticiones a esta API (ajusta según necesidad)
            urlPattern: /^https:\/\/news-reader-2acd6-default-rtdb\.firebaseio\.com\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firebase-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 5, // 5 días
              },
              cacheableResponse: {
                statuses: [0, 200],
              }
            }
          }
        ]
      }
    }),
    legacy()
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
