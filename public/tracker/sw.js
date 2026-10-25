// Retire only this tracker's old shell cache. Workout records in browser storage are untouched.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('kettlebell-tracker-')).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
// Navigation now uses the current application rather than a stale cached landing page.
