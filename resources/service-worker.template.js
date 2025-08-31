let CACHE_KEY = '{CACHE_KEY}';

// Local resources we always want cached.
const PRECACHE_URLS = ['/', '/audio/alarm.ogg'];
const NON_SPA_PAGES = [];

// Install handler: precache assets
self.addEventListener('install', (event) => {
    event.waitUntil(onInstall());
});

async function onInstall() {
    const preCache = await caches.open(CACHE_KEY);
    await preCache.addAll(PRECACHE_URLS);
    return self.skipWaiting();
}

// Activate handler: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(onActivate());
});

async function onActivate() {
    const currentCaches = [CACHE_KEY];
    const cacheNames = await caches.keys();

    const cachesToDelete = cacheNames.filter(
        (cacheName) => !currentCaches.includes(cacheName),
    );

    await Promise.all(cachesToDelete.map((c) => caches.delete(c)));
    return self.clients.claim();
}

// Fetch handler
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests (analytics, fonts, etc.)
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(getFetchResponse(event.request));
});

async function getFetchResponse(request) {
    // If it's a script, style, image etc, never treat as SPA
    if (['script', 'style', 'image', 'font'].includes(request.destination)) {
        return networkFirst(request);
    }

    const isPreCacheUrl = PRECACHE_URLS.some((url) =>
        request.url.endsWith(url),
    );

    const isSpaRoute = eventIsForSpaPageRoute(request);
    const cacheKey = isSpaRoute ? '/' : request;

    // Try cache first for SPA routes + precached URLs
    if (isSpaRoute || isPreCacheUrl) {
        const cachedResponse = await caches.match(cacheKey);
        if (cachedResponse) {
            return cachedResponse;
        }
    }

    // Fallback: network + cache
    return networkFirst(request, cacheKey);
}

// Network-first strategy with cache fallback
async function networkFirst(request, cacheKey = request) {
    const cache = await caches.open(CACHE_KEY);
    try {
        const response = await fetch(request);
        if (response && response.ok && request.method === 'GET') {
            cache.put(cacheKey, response.clone());
        }
        return response;
    } catch {
        const cachedResponse = await caches.match(cacheKey);
        if (cachedResponse) {
            return cachedResponse;
        }
    }
}

/**
 * Detect if request is for an SPA route (e.g. /about, /dashboard).
 * Excludes static assets, API calls, and NON_SPA_PAGES.
 */
function eventIsForSpaPageRoute(request) {
    const url = new URL(request.url);

    // If it looks like a static asset (has an extension) → not SPA
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
