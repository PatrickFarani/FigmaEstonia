/**
 * Service Worker for Estonia Registration Form PWA
 * Basic caching functionality for PWA requirements
 */

const CACHE_NAME = 'estonia-register-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  // Cache icons
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-192x192-maskable.png',
  '/icons/icon-512x512-maskable.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache.map(url => {
          // Handle relative URLs
          return new Request(url, { credentials: 'same-origin' });
        }));
      })
      .catch(err => {
        console.error('Service Worker: Cache failed', err);
      })
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Claim all clients immediately
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests and API calls
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip API endpoints (they should always be fresh)
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('testtask.abz.agency')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(err => {
        console.error('Service Worker: Fetch failed', err);
        // Return a fallback page for navigation requests
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// Handle background sync (if needed in future)
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync', event.tag);
});

// Handle push notifications (if needed in future)
self.addEventListener('push', event => {
  console.log('Service Worker: Push received');
});

// Log service worker messages
self.addEventListener('message', event => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});