const CACHE_NAME = 'buddhist-solar-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/css/becss.css',
  '/main.js',
  '/manifest.json',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/images/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

