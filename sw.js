const CACHE_NAME = 'hredoy-portfolio-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/css/styles.css',
  '/assets/css/boxicons.min.css',
  '/assets/css/devicon.min.css',
  '/assets/js/main.js',
  '/assets/data/portfolio-data.js',
  '/assets/favicons/H.png',
  '/assets/favicons/site.webmanifest',
  '/assets/fonts/boxicons.woff2',
  '/assets/fonts/boxicons.woff',
  '/assets/fonts/boxicons.ttf',
  '/assets/css/fonts/devicon.ttf',
  '/assets/css/fonts/devicon.woff',
  '/assets/img/perfil.webp',
  '/assets/img/about.webp',
  '/assets/img/BRAC-Mark-Icon-BRAC-UPGI.webp',
  '/assets/img/Jabali-LogoNoWords-200x205.webp',
  '/assets/img/unnamed.webp',
  '/assets/img/work1.webp',
  '/assets/img/work2.webp',
  '/assets/img/work3.webp',
  '/assets/img/work4.webp',
  '/assets/img/work5.webp'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .catch(err => console.log('SW Cache open failed:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        return cachedResponse || fetch(event.request);
      })
      .catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});
