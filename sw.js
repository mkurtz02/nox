const CACHE = 'nox-v8';
const ASSETS = ['./','./index.html','./manifest.webmanifest','./fonts/fonts.css','./fonts/fonts-varianten.css',
  './fonts/SpaceGrotesk-latin.woff2','./fonts/SpaceGrotesk-latin-ext.woff2',
  './fonts/JetBrainsMono-latin.woff2','./fonts/JetBrainsMono-latin-ext.woff2',
  './fonts/Outfit-300-latin.woff2','./fonts/Inter-400-latin.woff2','./fonts/Inter-500-latin.woff2',
  './icon-180.png','./icon-192.png','./icon-512.png','./favicon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(ASSETS.map(a => c.add(new Request(a, { cache: 'no-store' }))))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Netz zuerst und am HTTP-Cache vorbei; Cache nur offline.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-store' }).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html')))
  );
});
