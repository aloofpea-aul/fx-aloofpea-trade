// FX Aloofpea - minimal service worker (enables "Add to Home Screen" / installability)
// Not doing offline caching since the app needs live data from the server every time.

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  self.clients.claim();
});

// Pass-through fetch handler (required for install prompt on some browsers)
self.addEventListener('fetch', function(event) {
  event.respondWith(fetch(event.request));
});
