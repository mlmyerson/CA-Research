// Service Worker for Elementary Cellular Automaton PWA
const CACHE_NAME = 'eca-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.webmanifest',
  './ca-icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});
