import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(() => {
  const isSingleFileDemo = process.env.DEMO_SINGLEFILE === 'true';

  return {
    base: isSingleFileDemo ? './' : '/',
    plugins: [
      react(),
      ...(isSingleFileDemo ? [viteSingleFile()] : []),
      ...(isSingleFileDemo
        ? []
        : [
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
          ])
    ],
    build: isSingleFileDemo
      ? {
          cssCodeSplit: false,
          assetsInlineLimit: 100000000
        }
      : undefined,
    server: {
      port: 5187,
      host: true
    }
  };
});
