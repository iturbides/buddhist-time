const CACHE_NAME = 'buddhist-solar-time-cache-v1.3';

const FILES_TO_CACHE = [
  '/',
    '/index.html',
    '/about.html',
    '/app.js',
    '/LICENSE.md',
    '/README.md',
    '/css/becess.css',
    '/images/favicon.ico',
    '/images/github.svg',
    '/images/info.svg',
    '/images/home.svg',
    '/images/main-logo.webp',
    '/images/main-logo.png',
    '/images/icon-192.png',
    '/images/icon-512.png',
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(response => {
      return response || fetch(evt.request);
    })
  );
});

