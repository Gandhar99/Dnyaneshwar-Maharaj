// The preview has moved to the site root. This worker replaces the old preview worker, deletes the preview's cache and
// unregisters itself, so nothing is left running under preview/.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.delete('dny-2026-11-26').catch(() => {})
    .then(() => self.registration.unregister())
    .then(() => self.clients.matchAll({ type: 'window' }))
    .then((cs) => cs.forEach((c) => c.navigate(c.url).catch(() => {}))));
});
