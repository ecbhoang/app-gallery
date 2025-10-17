const CACHE_NAME = "launchpad-gallery-v1";
const OFFLINE_FALLBACK = "./index.html";
const PRECACHE_ASSETS = [
  "./",
  "./index.html",
  "./main.js",
  "./apps.sample.json",
  "./default-icon.svg",
  "./bg-photo-gallery.avif",
  "./manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
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
