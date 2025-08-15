// Service Worker for ID Scanner PWA
const CACHE_NAME = 'id-scanner-v1';
const urlsToCache = [
  '/',
  '/index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.debug.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.log('Cache addAll failed:', error);
        // Continue even if some resources fail to cache
        return Promise.resolve();
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Ensure the new service worker takes control immediately
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .catch(() => {
            // If both cache and network fail, return a basic offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return new Response(
                `<!DOCTYPE html>
                <html>
                <head>
                  <title>ID Scanner - Offline</title>
                  <style>
                    body { font-family: 'Century Gothic', sans-serif; text-align: center; padding: 2em; }
                    h1 { color: #FFD700; }
                  </style>
                </head>
                <body>
                  <h1>ID Scanner</h1>
                  <p>You're currently offline. Please check your internet connection and try again.</p>
                  <button onclick="location.reload()">Retry</button>
                </body>
                </html>`,
                {
                  headers: { 'Content-Type': 'text/html' }
                }
              );
            }
          });
      })
  );
});

// Handle background sync (for future use)
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    // Future: sync captured photos to cloud storage
  }
});

// Handle push notifications (for future use)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from ID Scanner',
    icon: '/icon-192.png',
    badge: '/icon-72.png'
  };

  event.waitUntil(
    self.registration.showNotification('ID Scanner', options)
  );
});