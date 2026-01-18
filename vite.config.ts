import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const demoFlag = env.DEMO_SINGLEFILE ?? process.env.DEMO_SINGLEFILE;
  const isSingleFileDemo = demoFlag === 'true' || demoFlag === '1';

  return {
    base: isSingleFileDemo ? './' : '/',
    define: {
      __DEMO_SINGLEFILE__: JSON.stringify(isSingleFileDemo)
    },
    plugins: [
      react(),
      ...(isSingleFileDemo
        ? [
            viteSingleFile({
              removeViteModuleLoader: true
            })
          ]
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
          assetsInlineLimit: 100000000,
          rollupOptions: {
            output: {
              inlineDynamicImports: true,
              manualChunks: undefined
            }
          }
        }
      : undefined,
    server: {
      port: 5187,
      host: true
    }
  };
});
