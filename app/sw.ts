import { Serwist, ExpirationPlugin, NetworkFirst, StaleWhileRevalidate, CacheFirst, type PrecacheEntry, type SerwistGlobalConfig } from "serwist";




// This declares the value of `self` strongly typed
declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST || [],
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: [
        {
            matcher: ({ request }) => request.mode === "navigate",
            handler: new StaleWhileRevalidate({
                cacheName: "pages",
                plugins: [
                    new ExpirationPlugin({
                        maxEntries: 32,
                        maxAgeSeconds: 24 * 60 * 60, // 24 hours
                    }),
                ],
            }),
        },
        {
            matcher: /^\/_next\/static\/.*/i,
            handler: new CacheFirst({
                cacheName: "next-static-js-assets",
                plugins: [
                    new ExpirationPlugin({
                        maxEntries: 64,
                        maxAgeSeconds: 24 * 60 * 60, // 24 hours
                    }),
                ],
            }),
        },
        {
            matcher: /^\/_next\/image\/.*/i,
            handler: new StaleWhileRevalidate({
                cacheName: "next-image",
                plugins: [
                    new ExpirationPlugin({
                        maxEntries: 64,
                        maxAgeSeconds: 24 * 60 * 60, // 24 hours
                    }),
                ],
            }),
        },
        {
            matcher: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: new StaleWhileRevalidate({
                cacheName: "static-image-assets",
                plugins: [
                    new ExpirationPlugin({
                        maxEntries: 64,
                        maxAgeSeconds: 24 * 60 * 60, // 24 hours
                    }),
                ],
            }),
        },
        {
            matcher: /.*/i,
            handler: new NetworkFirst({
                cacheName: "others",
                plugins: [
                    new ExpirationPlugin({
                        maxEntries: 32,
                        maxAgeSeconds: 24 * 60 * 60, // 24 hours
                    }),
                ],
                networkTimeoutSeconds: 10,
            }),
        },
    ],
});

serwist.addEventListeners();
