/**
 * Focus Timer Pro - Service Worker
 * Handles offline support, caching, and background sync
 */

const CACHE_NAME = 'focus-timer-v6';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/index.css',
    '/css/components.css',
    '/js/app.js',
    '/js/storage.js',
    '/js/timer.js',
    '/js/tasks.js',
    '/js/audio.js',
    '/js/ambient.js',
    '/js/notifications.js',
    '/js/statistics.js',
    '/js/matrix.js',
    '/js/folders.js',
    '/js/heatmap.js',
    '/js/pomodoro.js',
    '/js/reports.js',
    '/js/themes.js',
    '/js/shortcuts.js',
    '/js/templates.js',
    '/js/ui.js',
    '/js/ticktick.js',
    '/js/datacollection.js',
    '/js/timers/styles.js',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch((err) => console.log('[SW] Cache failed:', err))
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip external requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached version
                    return cachedResponse;
                }

                // Fetch from network
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Don't cache if not a valid response
                        if (!networkResponse || networkResponse.status !== 200) {
                            return networkResponse;
                        }

                        // Clone the response
                        const responseToCache = networkResponse.clone();

                        // Add to cache
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    })
                    .catch(() => {
                        // Offline fallback for HTML pages
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Background sync for statistics (when online)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-stats') {
        console.log('[SW] Background sync: stats');
        // Future: sync statistics to cloud
    }
});

// Push notifications (for reminders)
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body || 'Time to focus!',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        vibrate: [200, 100, 200],
        tag: data.tag || 'timer-notification',
        actions: [
            { action: 'start', title: 'Start Timer' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Focus Timer', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'start') {
        event.waitUntil(
            clients.openWindow('/?action=start')
        );
    } else {
        event.waitUntil(
            clients.matchAll({ type: 'window' })
                .then((clientList) => {
                    if (clientList.length > 0) {
                        return clientList[0].focus();
                    }
                    return clients.openWindow('/');
                })
        );
    }
});
