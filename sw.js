// Offline for pages already visited. Network first, and always revalidated: when online, every page, script, style and
// data file is asked of the server again (a cheap 304 when unchanged), so a new deployment replaces the old site on the
// reader's next load, whatever the browser's HTTP cache holds. A copy of each same-origin GET is kept so that a page
// read once opens again without a connection. Photographs and fonts use the ordinary HTTP cache (they do not change).
// Bump CACHE on a deployment that removes or renames files: the old cache is then deleted on activation. Only this site's
// own caches (named dny-…) are touched: other sites on the same github.io origin keep theirs.
const CACHE = 'dny-2026-11-27';
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('dny-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
const STATIC = /\/(media|fonts)\//;
self.addEventListener('fetch', (e) => {
  const r = e.request;
  const url = new URL(r.url);
  if (r.method !== 'GET' || url.origin !== location.origin) return;
  const nav = r.mode === 'navigate';
  // a navigation request cannot be copied with new options, so it is asked for again by its URL
  const ask = nav ? fetch(url.href, { cache: 'no-cache', credentials: 'same-origin' })
    : STATIC.test(url.pathname) ? fetch(r) : fetch(r, { cache: 'no-cache' });
  e.respondWith(ask.then((res) => {
    if (res.ok && res.status === 200) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(r, copy)).catch(() => {}); }
    return res;
  }).catch(() => caches.match(r).then((m) => m || (nav ? caches.match(new URL('./', self.registration.scope), { ignoreSearch: true }) : Response.error()))));
});
