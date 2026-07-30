/* SNEAKTAP service worker.
   Optional: index.html is fully playable without it. Serving the folder over
   http(s) registers this and the game then works with no network at all.
   Bump CACHE on release so clients pick the new shell up. */

const CACHE = "sneaktap-v2";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      // One at a time, so a single 404 can't fail the whole install. Falls back
      // to fetch+put where Cache.add is missing.
      await Promise.all(
        SHELL.map(async (url) => {
          try {
            if (cache.add) {
              await cache.add(url);
            } else {
              const res = await fetch(url);
              if (res && res.ok) await cache.put(url, res);
            }
          } catch (_) { /* this entry just won't be available offline */ }
        })
      );
      await self.skipWaiting();
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // Cache first: the shell never changes within a release, and offline play
  // matters more here than picking up a same-release edit instantly.
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
            }
            return res;
          })
          // Only a navigation gets the shell as a fallback. Handing index.html
          // back for a script or icon request would be worse than failing.
          .catch(() => (req.mode === "navigate" ? caches.match("./index.html") : Response.error()))
    )
  );
});
