const CACHE_NAME = 'balu-shell-v1';
const RUNTIME_CACHE = 'balu-runtime-v1';

const OFFLINE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',

  // CSS - change filenames if yours differ
  '/css/style.css',
  '/css/bootstrap.min.css',
  '/css/default-css.css',
  '/css/flaticon.css',
  '/css/font-awesome.min.css',
  '/css/magnific-popup.css',
  '/css/owl.carousel.min.css',
  '/css/owl.video.play.html',
  '/css/responsive.css',
  '/css/slicknav.min.css',
  '/css/swiper.min.css',

  // JS - change filenames if yours differ
  '/js/bootstrap.min.js',
  '/js/main.js',
  '/js/countdown.js',
  '/js/easing-min.js',
  '/js/flat-surface-shader.js',
  '/js/imageloded.min.js',
  '/js/isotop.min.js',
  '/js/jquery-ripples.js',
  '/js/jquery-sticky-menu.js',
  '/js/jquery.magnific-popup.min.js',
  '/js/jquery.mb.YTPlayer.src.js',
  '/js/jquery.particleground.min.js',
  '/js/jquery.slicknav.min.js',
  '/js/owl-carousel.js',
  '/js/particle-app.js',
  '/js/particleground.js',
  '/js/spirit.js',
  '/js/spirit2.js',
  '/js/spirit3.js',
  '/js/spirit4.js',
  '/js/swiper.min.js',
  '/js/validation.js',

  // Images - only include a few important ones (hero/logo)
  '/images/22.jpg',
  '/images/single-21.jpeg',

  // Fonts (if self-hosted)
  '/fonts/Inter-Regular.woff2',

  // Icons
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME && k !== RUNTIME_CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(res => res).catch(() => caches.match('/offline.html')));
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(networkResp => {
        try {
          return caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(request, networkResp.clone());
            return networkResp;
          });
        } catch (e) {
          return networkResp;
        }
      }).catch(() => {
        if (request.destination === 'document') return caches.match('/offline.html');
        if (request.destination === 'image') {
          return new Response(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#888">Offline</text></svg>`, { headers: { 'Content-Type': 'image/svg+xml' }});
        }
        return new Response('', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});
