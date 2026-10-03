// Service Worker for Kettlebell Tracker
// Handles offline functionality and caching

const CACHE_NAME = 'kettlebell-tracker-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/js/app.js',
    '/js/auth-manager.js',
    '/js/constants.js',
    '/js/data-export.js',
    '/js/error-handler.js',
    '/js/firebase-manager.js',
    '/js/notifications.js',
    '/js/state-manager.js',
    '/js/training-insights.js',
    '/js/ui-manager.js',
    '/js/workout-manager.js',
    '/js/workout-sharing.js',
    '/js/workout-template.js',
    '/js/offline-storage.js',
    '/js/sync-manager.js',
    '/js/offline-ui.js',
    '/manifest.json',
    '/icons/icon-96.svg',
    '/icons/icon-144.svg',
    '/icons/icon-192.svg',
    '/icons/icon-256.svg',
    '/icons/icon-512.svg',
    // External dependencies
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    'https://cdn.jsdelivr.net/npm/chart.js@3.7.0/dist/chart.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js',
    'https://cdnjs.cloudflare.com/ajax/libs/slim-select/2.8.0/slimselect.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/slim-select/2.8.0/slimselect.min.js'
];

// Install event - cache essential files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
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
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip Firebase requests - these should go to network
    if (event.request.url.includes('firebase') || 
        event.request.url.includes('googleapis.com/identitytoolkit') ||
        event.request.url.includes('firebaseapp.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(response => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }).catch(() => {
                    // Return offline page if available
                    if (event.request.destination === 'document') {
                        return caches.match('/index.html');
                    }
                });
            })
    );
});

// Handle messages from clients
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});