// --- CONFIG ---
const CACHE_NAME_PREFIX = 'lift-tracker-';
const CACHE_KEY = `${CACHE_NAME_PREFIX}{CACHE_KEY}`; // replace during build
const MAX_APP_CACHES = 3;
const PRECACHE_URLS = ['/', '/audio/beep.mp3'];
const NON_SPA_PAGES = [];

// --- INSTALL ---
self.addEventListener('install', (event) => {
    event.waitUntil(onInstall());
});

async function onInstall() {
    const preCache = await caches.open(CACHE_KEY);
    try {
        await Promise.all(
            PRECACHE_URLS.map((url) => preCacheUrl(preCache, url)),
        );
        console.log('[SW] Precache complete');
    } catch (err) {
        console.warn('[SW] Precache failed:', err);
        reportRollbar(err);
    }
    return self.skipWaiting();
}

// --- ACTIVATE ---
self.addEventListener('activate', (event) => {
    event.waitUntil(onActivate());
});

async function onActivate() {
    const cacheNames = await caches.keys();
    const appCacheNames = cacheNames.filter((cacheName) =>
        cacheName.startsWith(CACHE_NAME_PREFIX),
    );
    const appCachesToKeep = new Set([
        ...appCacheNames.slice(-(MAX_APP_CACHES - 1)),
        CACHE_KEY,
    ]);

    const cachesToDelete = appCacheNames.filter(
        (cacheName) => !appCachesToKeep.has(cacheName),
    );

    await Promise.all(cachesToDelete.map((c) => caches.delete(c)));
    console.log('[SW] Cleaned up old caches');
    return self.clients.claim();
}

// --- FETCH ---
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests (analytics, fonts, etc.)
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(getFetchResponse(event.request));
});

async function getFetchResponse(request) {
    try {
        // Static assets: network-first
        if (
            ['script', 'style', 'image', 'font'].includes(request.destination)
        ) {
            return await networkFirst(request);
        }

        const isPreCacheUrl = PRECACHE_URLS.some((url) =>
            request.url.endsWith(url),
        );
        const isSpaRoute = eventIsForSpaPageRoute(request);

        // Normalize cache key for SPA routes
        const cacheKey = isSpaRoute ? new Request('/') : request;

        // Cache-first for SPA routes + precache URLs
        if (isSpaRoute || isPreCacheUrl) {
            const cachedResponse = await caches.match(cacheKey);
            if (cachedResponse) {
                return cachedResponse;
            }
        }

        // Fallback: network-first
        return await networkFirst(request, cacheKey);
    } catch (err) {
        console.error('[SW] getFetchResponse failed:', err);
        reportRollbar(err);

        // Last-resort offline response
        return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' },
        });
    }
}

// --- STRATEGIES ---
async function networkFirst(request, cacheKey = request) {
    const cache = await caches.open(CACHE_KEY);
    try {
        const response = await fetch(request);

        // Only cache valid GET responses
        if (request.method === 'GET' && responseCanBeCached(response)) {
            try {
                await cache.put(cacheKey, response.clone());
            } catch (err) {
                console.warn('[SW] Cache write skipped:', request.url, err);
            }
        }

        return response;
    } catch (err) {
        console.warn('[SW] Network request failed:', request.url, err);
        reportRollbar(err);

        const cachedResponse = await caches.match(cacheKey);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Offline fallback
        return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' },
        });
    }
}

// --- HELPERS ---
async function preCacheUrl(cache, url) {
    const request = new Request(url, { cache: 'reload' });
    const response = await fetch(request);

    if (!responseCanBeCached(response)) {
        console.warn(
            '[SW] Precache skipped:',
            url,
            response?.status,
            response?.statusText,
        );
        return;
    }

    await cache.put(request, response);
}

function responseCanBeCached(response) {
    return response && (response.status === 200 || response.type === 'opaque');
}

function eventIsForSpaPageRoute(request) {
    const url = new URL(request.url);

    // If it looks like a static asset (has extension) → not SPA
    if (/\.[^/]+$/.test(url.pathname)) {
        return false;
    }

    // API/backend routes
    if (url.pathname.startsWith('/api/')) {
        return false;
    }

    // Explicit non-SPA pages
    if (NON_SPA_PAGES.some((page) => url.pathname.endsWith(page))) {
        return false;
    }

    return true;
}

// --- ERROR REPORTING PATCH ---
function reportRollbar(err) {
    // Send to all connected clients
    self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
        for (const client of clients) {
            client.postMessage({
                type: 'sw-error',
                payload: String(err), // stringify for safe transfer
            });
        }
    });
}
