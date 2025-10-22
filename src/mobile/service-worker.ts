/// <reference lib="webworker" />

import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, cleanupOutdatedCaches, type PrecacheEntry } from 'workbox-precaching';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { CacheFirst, NetworkFirst, NetworkOnly, StaleWhileRevalidate } from 'workbox-strategies';

import { CACHE_NAME, OFFLINE_URL } from './sw-config';

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<PrecacheEntry> };

clientsClaim();
self.skipWaiting();

precacheAndRoute([{ url: OFFLINE_URL, revision: null }, ...self.__WB_MANIFEST]);
cleanupOutdatedCaches();

const pageStrategy = new NetworkFirst({
  cacheName: `${CACHE_NAME}-pages`,
  plugins: [
    new ExpirationPlugin({
      maxEntries: 50,
      purgeOnQuotaError: true
    })
  ]
});

registerRoute(({ request }) => request.mode === 'navigate', pageStrategy);

registerRoute(
  ({ request }) => request.destination === 'style' || request.destination === 'script',
  new StaleWhileRevalidate({ cacheName: `${CACHE_NAME}-assets` })
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: `${CACHE_NAME}-images`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 150,
        maxAgeSeconds: 60 * 60 * 24 * 30,
        purgeOnQuotaError: true
      })
    ]
  })
);

const bgSyncPlugin = new BackgroundSyncPlugin('sync-pending-actions', {
  maxRetentionTime: 24 * 60
});

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkOnly({ plugins: [bgSyncPlugin] }),
  'POST'
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: `${CACHE_NAME}-api`,
    networkTimeoutSeconds: 4,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60,
        purgeOnQuotaError: true
      })
    ]
  })
);

setCatchHandler(async ({ request }) => {
  if (request.destination === 'document') {
    return caches.match(OFFLINE_URL) as Promise<Response>;
  }

  return Response.error();
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-actions') {
    event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(() => undefined));
  }
});

self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'YadroOS', {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: data.url
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data ?? '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return undefined;
    })
  );
});

export {};
