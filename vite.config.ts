import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      srcDir: 'src/mobile',
      filename: 'service-worker.ts',
      strategies: 'injectManifest',
      registerType: 'autoUpdate',
      manifest: false,
      injectRegister: false,
      includeAssets: [
        'icons/icon-72x72.png',
        'icons/icon-192x192.png',
        'icons/icon-512x512.png',
        'screenshots/home.png',
        'offline.html'
      ],
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  server: {
    port: 5173,
    host: true
  }
});
