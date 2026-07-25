var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { viteSingleFile } from 'vite-plugin-singlefile';
export default defineConfig(function (_a) {
  var _b;
  var mode = _a.mode;
  var env = loadEnv(mode, process.cwd(), '');
  var demoFlag =
    (_b = env.DEMO_SINGLEFILE) !== null && _b !== void 0 ? _b : process.env.DEMO_SINGLEFILE;
  var isSingleFileDemo = demoFlag === 'true' || demoFlag === '1';
  return __assign(
    __assign(
      {
        base: isSingleFileDemo ? './' : '/',
        define: {
          __DEMO_SINGLEFILE__: JSON.stringify(isSingleFileDemo)
        }
      },
      isSingleFileDemo
        ? {
            transformIndexHtml: function (html) {
              return html
                .replace(/<link\s+rel="manifest"[^>]*>\s*/i, '')
                .replace(/<link\s+rel="apple-touch-icon"[^>]*>\s*/i, '');
            }
          }
        : {}
    ),
    {
      plugins: __spreadArray(
        [react()],
        isSingleFileDemo
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
            ],
        true
      ),
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
    }
  );
});
