const CACHE = "cybertime-shell-v10";
const BASE = "/cybertime/";
const SHELL = [
  `${BASE}`,
  `${BASE}index.html`,
  `${BASE}game.bundle.js`,
  `${BASE}manifest.json`,
  `${BASE}assets/logo.png`,
  `${BASE}assets/icon-192.png`,
  `${BASE}assets/icon-512.png`,
  `${BASE}assets/1.png`,
  `${BASE}assets/fonts/Cyberjunkies.ttf`,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (!url.pathname.startsWith(BASE)) return;
  if (url.pathname.includes("/music/")) return;

  const isAppShell = url.pathname.endsWith("game.bundle.js") || url.pathname.endsWith("index.html");

  if (isAppShell) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request)),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response.ok) return response;
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      });
    }),
  );
});
