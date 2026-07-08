var CACHE = 'sitoc-wc-v1';
var URLS = [
  '.',
  'index.html',
  'styles.css',
  'icon.svg',
  'manifest.json'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.all(URLS.map(function (u) { return cache.add(u); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function (cr) {
      return cr || fetch(e.request).then(function (res) {
        if (res && res.ok && URLS.indexOf(e.request.url.split('/').pop()) >= 0) {
          var c = caches.open(CACHE).then(function (c) { c.put(e.request, res.clone()); return res; });
          return c;
        }
        return res;
      }).catch(function () { return cr; });
    })
  );
});
