const PRECACHE = 'precache-v2';
const RUNTIME = 'runtime';

// A list of local resources we always want to be cached.
const PRECACHE_URLS = ['/', '/privacy-policy', '/audio/alarm.ogg'];
const NON_SPA_PAGES = ['/privacy-policy', '/facebook-login'];

// The "install" handler takes care of precaching the resources we always need.
self.addEventListener('install', async (event) => {
    event.waitUntil(onInstall());
});

async function onInstall() {
    const preCache = await caches.open(PRECACHE);
    await preCache.addAll(PRECACHE_URLS);

    return self.skipWaiting();
}

// The "activate" handler takes care of cleaning up old caches.
self.addEventListener('activate', async (event) => {
    event.waitUntil(onActivate());
});

async function onActivate() {
    const currentCaches = [PRECACHE, RUNTIME];

    const cacheNames = await caches.keys();
    const cachesToDelete = cacheNames.filter(
        (cacheName) => !currentCaches.includes(cacheName)
    );

    await Promise.all(
        cachesToDelete.map((cacheToDelete) => caches.delete(cacheToDelete))
    );

    return self.clients.claim();
}

self.addEventListener('fetch', async (event) => {
    // Skip cross-origin requests, like those for Google Analytics.
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(getFetchResponse(event.request));
});

async function getFetchResponse(request) {
    const isPreCacheUrl = PRECACHE_URLS.some((prefetchUrl) =>
        request.url.endsWith(prefetchUrl)
    );

    const isSpaRoute = eventIsForSpaPageRoute(request);
    const cacheKey = isSpaRoute ? '/' : request;

    if (!navigator.onLine || isSpaRoute || isPreCacheUrl) {
        const cachedResponse = await caches.match(cacheKey);

        if (cachedResponse) {
            return cachedResponse;
        }
    }

    const cache = await caches.open(RUNTIME);
    const response = await fetch(request);

    if (cacheKey.method.toUpperCase() === 'GET') {
        cache.put(cacheKey, response.clone());
    }

    return response;
}

/**
 * Is the event for a frontend route.
 * @param request {{ url: string }}
 * @return {boolean}
 */
function eventIsForSpaPageRoute(request) {
    const isStaticAsset = request.url.includes('.');
    if (isStaticAsset) {
        return false;
    }

    const isApiCall = request.url.includes('/api/');
    if (isApiCall) {
        return false;
    }

    const isNonSpaPage = NON_SPA_PAGES.some((prefetchUrl) =>
        request.url.split('?')[0].endsWith(prefetchUrl)
    );

    return !isNonSpaPage;
}
