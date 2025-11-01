const APP_VERSION = "__APP_VERSION__";
const CACHE_NAME = `launchpad-gallery-${APP_VERSION}`;
const BASE_PATH = (() => {
  const scopePath = new URL(self.registration.scope).pathname;
  if (scopePath === "/") {
    return "";
  }
  return scopePath.endsWith("/") ? scopePath.slice(0, -1) : scopePath;
})();

const withBase = (path) => `${BASE_PATH}${path}`;

const OFFLINE_FALLBACK = withBase("/index.html");
const PRECACHE_ASSETS = [
  withBase("/"),
  withBase("/index.html"),
  withBase("/default-icon.svg"),
  withBase("/bg-photo-gallery.avif"),
  withBase("/manifest.webmanifest"),
  withBase("/data/apps.json"),
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
      const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      clients.forEach((client) =>
        client.postMessage({ type: "app-version", version: APP_VERSION })
      );
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          const cloned = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, cloned);
          });

          return networkResponse;
        })
        .catch(async () => {
          if (request.mode === "navigate") {
            const fallback = await caches.match(OFFLINE_FALLBACK);
            if (fallback) {
              return fallback;
            }
          }
          return Response.error();
        });
    })
  );
});
