const CACHE_NAME = 'buddhist-solar-time-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/style.css',
  '/app.js',
  '/images/icon-192.png',
  '/images/icon-512.png',

  // Windows tiles
  '/images/windows11/SmallTile.scale-100.png',
  '/images/windows11/SmallTile.scale-125.png',
  '/images/windows11/SmallTile.scale-150.png',
  '/images/windows11/SmallTile.scale-200.png',
  '/images/windows11/SmallTile.scale-400.png',
  '/images/windows11/Square150x150Logo.scale-100.png',
  '/images/windows11/Square150x150Logo.scale-125.png',
  '/images/windows11/Square150x150Logo.scale-150.png',
  '/images/windows11/Square150x150Logo.scale-200.png',
  '/images/windows11/Square150x150Logo.scale-400.png',
  '/images/windows11/Wide310x150Logo.scale-100.png',
  '/images/windows11/Wide310x150Logo.scale-125.png',
  '/images/windows11/Wide310x150Logo.scale-150.png',
  '/images/windows11/Wide310x150Logo.scale-200.png',
  '/images/windows11/Wide310x150Logo.scale-400.png',
  '/images/windows11/LargeTile.scale-100.png',
  '/images/windows11/LargeTile.scale-125.png',
  '/images/windows11/LargeTile.scale-150.png',
  '/images/windows11/LargeTile.scale-200.png',
  '/images/windows11/LargeTile.scale-400.png',
  '/images/windows11/Square44x44Logo.scale-100.png',
  '/images/windows11/Square44x44Logo.scale-125.png',
  '/images/windows11/Square44x44Logo.scale-150.png',
  '/images/windows11/Square44x44Logo.scale-200.png',
  '/images/windows11/Square44x44Logo.scale-400.png',
  '/images/windows11/StoreLogo.scale-100.png',
  '/images/windows11/StoreLogo.scale-125.png',
  '/images/windows11/StoreLogo.scale-150.png',
  '/images/windows11/StoreLogo.scale-200.png',
  '/images/windows11/StoreLogo.scale-400.png',
  '/images/windows11/SplashScreen.scale-100.png',
  '/images/windows11/SplashScreen.scale-125.png',
  '/images/windows11/SplashScreen.scale-150.png',
  '/images/windows11/SplashScreen.scale-200.png',
  '/images/windows11/SplashScreen.scale-400.png',

  // Android icons
  '/images/android/android-launchericon-512-512.png',
  '/images/android/android-launchericon-192-192.png',
  '/images/android/android-launchericon-144-144.png',
  '/images/android/android-launchericon-96-96.png'
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

